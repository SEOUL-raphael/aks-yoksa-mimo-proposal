(function () {
  "use strict";

  var state = {
    books: [],
    booksById: {},
    partsByBook: {},
    query: "",
    sort: "title",
    shown: 0,
    filtered: [],
    partCache: {},
  };
  var PAGE_SIZE = 60;

  var gridView = document.getElementById("gridView");
  var grid = document.getElementById("grid");
  var emptyState = document.getElementById("emptyState");
  var resultCount = document.getElementById("resultCount");
  var searchInput = document.getElementById("searchInput");
  var sortSelect = document.getElementById("sortSelect");
  var sentinel = document.getElementById("sentinel");

  var readerView = document.getElementById("readerView");
  var readerHeader = document.getElementById("readerHeader");
  var partTabs = document.getElementById("partTabs");
  var readerContent = document.getElementById("readerContent");
  var readerSource = document.getElementById("readerSource");
  var backLink = document.getElementById("backLink");

  function normalize(text) {
    return (text || "").toString().toLowerCase();
  }

  function parseJsonl(text) {
    var rows = [];
    var lines = text.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      try {
        rows.push(JSON.parse(line));
      } catch (err) {
        /* skip malformed line */
      }
    }
    return rows;
  }

  // ---- Minimal Markdown renderer, scoped to what build_github_md_snapshot.py
  // actually emits: headings, "- " bullet lists, "|" tables, ``` code fences,
  // "---" rules, **bold**, `code`, [text](href), and plain paragraphs. ----
  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function inlineMd(s) {
    s = escapeHtml(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\[([^\]]*)\]\(([^)]+)\)/g, function (m, text, href) {
      return '<a href="' + href + '">' + text + "</a>";
    });
    return s;
  }

  function renderTable(tableLines) {
    var rows = tableLines.map(function (l) {
      return l.replace(/^\|/, "").replace(/\|$/, "").split("|").map(function (c) {
        return c.trim();
      });
    });
    var header = rows[0];
    var body = rows.slice(2);
    var out = "<div class=\"tableWrap\"><table><thead><tr>";
    header.forEach(function (h) { out += "<th>" + inlineMd(h) + "</th>"; });
    out += "</tr></thead><tbody>";
    body.forEach(function (r) {
      out += "<tr>" + r.map(function (c) { return "<td>" + inlineMd(c) + "</td>"; }).join("") + "</tr>";
    });
    out += "</tbody></table></div>";
    return out;
  }

  function renderMarkdown(text) {
    var lines = text.replace(/\r\n/g, "\n").split("\n");
    var out = [];
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      if (/^```/.test(line)) {
        var buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        i++;
        out.push('<pre class="codeBlock"><code>' + escapeHtml(buf.join("\n")) + "</code></pre>");
        continue;
      }
      if (/^\s*$/.test(line)) {
        i++;
        continue;
      }
      if (/^-{3,}\s*$/.test(line)) {
        out.push("<hr />");
        i++;
        continue;
      }
      var heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        var level = heading[1].length;
        out.push("<h" + level + ">" + inlineMd(heading[2]) + "</h" + level + ">");
        i++;
        continue;
      }
      if (/^\|/.test(line)) {
        var tableLines = [];
        while (i < lines.length && /^\|/.test(lines[i])) {
          tableLines.push(lines[i]);
          i++;
        }
        out.push(renderTable(tableLines));
        continue;
      }
      if (/^-\s+/.test(line)) {
        var items = [];
        while (i < lines.length && /^-\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^-\s+/, ""));
          i++;
        }
        out.push("<ul>" + items.map(function (it) { return "<li>" + inlineMd(it) + "</li>"; }).join("") + "</ul>");
        continue;
      }
      var para = [line];
      i++;
      while (
        i < lines.length &&
        !/^\s*$/.test(lines[i]) &&
        !/^#{1,6}\s/.test(lines[i]) &&
        !/^-\s+/.test(lines[i]) &&
        !/^```/.test(lines[i]) &&
        !/^\|/.test(lines[i]) &&
        !/^-{3,}\s*$/.test(lines[i])
      ) {
        para.push(lines[i]);
        i++;
      }
      out.push("<p>" + inlineMd(para.join(" ")) + "</p>");
    }
    return out.join("\n");
  }

  function loadStats() {
    fetch("../manifest.json")
      .then(function (r) { return r.json(); })
      .then(function (manifest) {
        document.getElementById("statBooks").textContent = manifest.published_books || "-";
        document.getElementById("statArticles").textContent = manifest.published_articles || "-";
        var updated = (manifest.created_at_kst || "").slice(0, 10);
        document.getElementById("statUpdated").textContent = updated || "-";
      })
      .catch(function () {});
  }

  function loadIndexes() {
    return Promise.all([
      fetch("../_index/books.jsonl").then(function (r) { return r.text(); }),
      fetch("../_index/parts.jsonl").then(function (r) { return r.text(); }),
    ]).then(function (results) {
      state.books = parseJsonl(results[0]);
      state.books.forEach(function (b) { state.booksById[b.book_id] = b; });
      var parts = parseJsonl(results[1]);
      parts.forEach(function (p) {
        if (!state.partsByBook[p.book_id]) state.partsByBook[p.book_id] = [];
        state.partsByBook[p.book_id].push(p);
      });
    });
  }

  function matches(book, query) {
    if (!query) return true;
    var haystack = normalize(book.title_ko) + " " + normalize(book.title_hanja) + " " + normalize(book.author);
    return haystack.indexOf(query) !== -1;
  }

  function compare(a, b) {
    switch (state.sort) {
      case "author":
        return normalize(a.author).localeCompare(normalize(b.author), "ko");
      case "year":
        return normalize(a.year).localeCompare(normalize(b.year), "ko");
      case "articles-desc":
        return (b.published_article_count || 0) - (a.published_article_count || 0);
      case "articles-asc":
        return (a.published_article_count || 0) - (b.published_article_count || 0);
      default:
        return normalize(a.title_ko || a.title_hanja).localeCompare(normalize(b.title_ko || b.title_hanja), "ko");
    }
  }

  function filteredSorted() {
    var query = normalize(state.query);
    return state.books.filter(function (b) { return matches(b, query); }).sort(compare);
  }

  function cardFor(book) {
    var a = document.createElement("a");
    a.className = "card";
    a.href = "#book=" + encodeURIComponent(book.book_id);
    a.setAttribute("role", "listitem");

    var title = document.createElement("div");
    title.className = "cardTitle";
    title.textContent = book.title_ko || book.title_hanja || book.book_id;
    a.appendChild(title);

    if (book.title_hanja && book.title_hanja !== book.title_ko) {
      var hanja = document.createElement("div");
      hanja.className = "cardHanja";
      hanja.textContent = book.title_hanja;
      a.appendChild(hanja);
    }

    var meta = document.createElement("div");
    meta.className = "cardMeta";
    var chips = [
      book.author || "저자 미상",
      book.year || "연도 미상",
      (book.published_article_count || 0) + "건 기사",
      (book.volume_count || 0) + "권",
    ];
    chips.forEach(function (label) {
      var chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = label;
      meta.appendChild(chip);
    });
    a.appendChild(meta);

    return a;
  }

  function renderGrid(reset) {
    var items = filteredSorted();
    if (reset) {
      grid.innerHTML = "";
      state.shown = 0;
      state.filtered = items;
    }
    resultCount.textContent = items.length + "개 중 " + Math.min(state.shown + PAGE_SIZE, items.length) + "개 표시";
    emptyState.hidden = items.length !== 0;

    var next = items.slice(state.shown, state.shown + PAGE_SIZE);
    var frag = document.createDocumentFragment();
    next.forEach(function (book) { frag.appendChild(cardFor(book)); });
    grid.appendChild(frag);
    state.shown += next.length;
  }

  function loadMoreIfNeeded() {
    if (!state.filtered.length) return;
    if (state.shown >= state.filtered.length) return;
    var rect = sentinel.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.5) {
      renderGrid(false);
    }
  }

  // ---- Reader view: fetch a book's README/haje/part-*.md and render inline ----
  function bookDir(book) {
    return book.path.replace(/\/README\.md$/, "");
  }

  function fetchText(path) {
    return fetch("../" + path).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    });
  }

  // Links inside fetched .md content (e.g. "[해제 보기](haje.md)",
  // "[part-001.md](part-001.md)") are written relative to the book's own
  // directory, not to app/index.html. Left as-is, the browser resolves them
  // against the app page's URL and they 404. Route the ones we recognize
  // (haje.md, part-NNN.md) to the in-app reader tabs, and resolve anything
  // else relative to the book directory instead of the app page.
  function rewriteContentLinks(container, book) {
    var anchors = container.querySelectorAll("a[href]");
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var href = a.getAttribute("href");
      if (!href || /^([a-z]+:)?\/\//i.test(href) || href.charAt(0) === "#") continue;
      if (/^haje\.md$/.test(href)) {
        a.href = "#book=" + encodeURIComponent(book.book_id) + "&view=haje";
        continue;
      }
      var partMatch = href.match(/^part-0*(\d+)\.md$/);
      if (partMatch) {
        a.href = "#book=" + encodeURIComponent(book.book_id) + "&part=" + parseInt(partMatch[1], 10);
        continue;
      }
      a.href = "../" + bookDir(book) + "/" + href;
    }
  }

  function fetchTextCached(path) {
    if (state.partCache[path]) return state.partCache[path];
    var p = fetchText(path);
    state.partCache[path] = p;
    p.catch(function () { delete state.partCache[path]; });
    return p;
  }

  function renderReaderHeader(book) {
    readerHeader.innerHTML =
      '<h2 class="readerTitle">' + escapeHtml(book.title_ko || book.title_hanja || book.book_id) + "</h2>" +
      (book.title_hanja && book.title_hanja !== book.title_ko
        ? '<p class="readerHanja">' + escapeHtml(book.title_hanja) + "</p>"
        : "") +
      '<div class="cardMeta">' +
      [book.author || "저자 미상", book.year || "연도 미상", (book.published_article_count || 0) + "건 기사", (book.volume_count || 0) + "권"]
        .map(function (t) { return '<span class="chip">' + escapeHtml(t) + "</span>"; })
        .join("") +
      "</div>";
  }

  function renderTabs(book, parts, hasHaje, activeKind, activePart) {
    partTabs.innerHTML = "";
    var readmeTab = tabButton("책 소개", activeKind === "readme", function () {
      openBook(book.book_id, "readme", null);
    });
    partTabs.appendChild(readmeTab);
    if (hasHaje) {
      partTabs.appendChild(
        tabButton("해제", activeKind === "haje", function () {
          openBook(book.book_id, "haje", null);
        })
      );
    }
    parts.forEach(function (part) {
      partTabs.appendChild(
        tabButton("묶음 " + part.part, activeKind === "part" && activePart === part.part, function () {
          openBook(book.book_id, "part", part.part);
        })
      );
    });
  }

  function tabButton(label, active, onClick) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tab" + (active ? " active" : "");
    btn.textContent = label;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", active ? "true" : "false");
    btn.addEventListener("click", onClick);
    return btn;
  }

  function currentPath(book, kind, partNo) {
    if (kind === "haje") return bookDir(book) + "/haje.md";
    if (kind === "part") {
      var parts = state.partsByBook[book.book_id] || [];
      var match = parts.filter(function (p) { return p.part === partNo; })[0];
      return match ? match.path : null;
    }
    return book.path;
  }

  function openBook(bookId, kind, partNo) {
    var hash = "#book=" + encodeURIComponent(bookId);
    if (kind === "haje") hash += "&view=haje";
    if (kind === "part") hash += "&part=" + partNo;
    if (location.hash !== hash) {
      location.hash = hash;
      return; // hashchange will re-enter openBook via route()
    }
    renderBook(bookId, kind || "readme", partNo || null);
  }

  function renderBook(bookId, kind, partNo) {
    var book = state.booksById[bookId];
    if (!book) {
      showGrid();
      return;
    }
    showReader();
    renderReaderHeader(book);
    readerContent.innerHTML = '<p class="loading">불러오는 중…</p>';
    readerSource.innerHTML = "";

    var parts = (state.partsByBook[bookId] || []).slice().sort(function (a, b) { return a.part - b.part; });
    var hajePath = bookDir(book) + "/haje.md";

    fetchTextCached(hajePath)
      .then(function () { return true; })
      .catch(function () { return false; })
      .then(function (hasHaje) {
        var effectiveKind = kind;
        var effectivePart = partNo;
        if (effectiveKind === "part" && !parts.some(function (p) { return p.part === effectivePart; })) {
          effectiveKind = "readme";
          effectivePart = null;
        }
        if (effectiveKind === "haje" && !hasHaje) {
          effectiveKind = "readme";
        }
        renderTabs(book, parts, hasHaje, effectiveKind, effectivePart);
        var path = currentPath(book, effectiveKind, effectivePart);
        if (!path) {
          readerContent.innerHTML = '<p class="loading">표시할 내용이 없습니다.</p>';
          return;
        }
        fetchTextCached(path)
          .then(function (text) {
            readerContent.innerHTML = renderMarkdown(text);
            rewriteContentLinks(readerContent, book);
            readerSource.innerHTML = '원문 Markdown: <a href="../' + path + '">' + path + "</a>";
          })
          .catch(function () {
            readerContent.innerHTML = '<p class="loading">내용을 불러오지 못했습니다.</p>';
          });
      });
  }

  function showReader() {
    gridView.hidden = true;
    readerView.hidden = false;
    window.scrollTo(0, 0);
  }

  function showGrid() {
    readerView.hidden = true;
    gridView.hidden = false;
  }

  function route() {
    var hash = location.hash.replace(/^#/, "");
    if (!hash) {
      showGrid();
      return;
    }
    var params = {};
    hash.split("&").forEach(function (pair) {
      var idx = pair.indexOf("=");
      if (idx === -1) return;
      params[pair.slice(0, idx)] = decodeURIComponent(pair.slice(idx + 1));
    });
    if (!params.book) {
      showGrid();
      return;
    }
    var kind = params.view === "haje" ? "haje" : params.part ? "part" : "readme";
    renderBook(params.book, kind, params.part ? parseInt(params.part, 10) : null);
  }

  backLink.addEventListener("click", function (evt) {
    evt.preventDefault();
    location.hash = "";
  });

  var searchTimer = null;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.query = searchInput.value;
      renderGrid(true);
    }, 120);
  });

  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    renderGrid(true);
  });

  window.addEventListener("scroll", loadMoreIfNeeded, { passive: true });
  window.addEventListener("resize", loadMoreIfNeeded);
  window.addEventListener("hashchange", route);

  loadStats();
  loadIndexes().then(function () {
    renderGrid(true);
    route();
  });
})();
