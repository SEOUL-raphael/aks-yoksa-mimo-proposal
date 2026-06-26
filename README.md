# AKS Yoksa Mimo Proposal Dataset

This repository publishes the current successful AKS Yoksa translation snapshot in a GitHub-browsable, legalize-style tree.

The layout is intentionally split by book rather than shipped as one large JSON file:

- `kr/<book>/README.md`
- `kr/<book>/book.json`
- `kr/<book>/volumes.jsonl`
- `kr/<book>/articles.jsonl`
- `kr/<book>/haje.md` when available
- `_index/books.jsonl`
- `_index/articles.jsonl`

## Current Snapshot

- Exported books: 337
- Successful translated articles: 50,275
- Translation status included here: `ok` only
- Canonical layer: Hanmun source text
- Derived layers: Korean translation, Korean reading, meaning summary, entities, uncertainty notes

Failed attempts remain local retry candidates and are not published in this repository.
