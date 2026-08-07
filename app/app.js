(function () {
  "use strict";

  var state = {
    books: [],
    query: "",
    sort: "title",
    shown: 0,
  };
  var PAGE_SIZE = 60;

  var grid = document.getElementById("grid");
  var emptyState = document.getElementById("emptyState");
  var resultCount = document.getElementById("resultCount");
  var searchInput = document.getElementById("searchInput");
  var sortSelect = document.getElementById("sortSelect");
  var sentinel = document.getElementById("sentinel");

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

  function loadBooks() {
    fetch("../_index/books.jsonl")
      .then(function (r) { return r.text(); })
      .then(function (text) {
        state.books = parseJsonl(text);
        render(true);
      })
      .catch(function () {
        emptyState.hidden = false;
        emptyState.textContent = "책 목록을 불러오지 못했습니다.";
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
    a.href = "../" + book.path;
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

  function render(reset) {
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
    if (!state.filtered) return;
    if (state.shown >= state.filtered.length) return;
    var rect = sentinel.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.5) {
      render(false);
    }
  }

  var searchTimer = null;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.query = searchInput.value;
      render(true);
    }, 120);
  });

  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    render(true);
  });

  window.addEventListener("scroll", loadMoreIfNeeded, { passive: true });
  window.addEventListener("resize", loadMoreIfNeeded);

  loadStats();
  loadBooks();
})();
