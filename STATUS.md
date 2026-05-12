# Progress Status

Snapshot time: 2026-05-13 08:28 KST

## Source Tree

- Books: 439
- Volumes: 1,325
- Articles: 113,150
- Translatable articles with body text: 112,287

## Translation Queue

- Pending: 103,605
- Running: 3
- OK: 2,589
- Failed: 6,090
- Total: 112,287

## Dashboard Snapshot

- Local dashboard screenshot: `assets/dashboard-current.png`
- Graph index after rebuild: 5,209 nodes, 9,300 edges
- Entity-linked translated articles: 1,169

## Runtime

- Worker mode: SQLite queue
- Batch size: 12
- Workers: 3
- Backoff: 1 hour for token, quota, auth, or rate-limit style errors
- Watchdog: pause 10 minutes after three all-failed batches

## Included Progress Files

- `_index/translations_progress.jsonl`: current translation attempt snapshot
- `_index/translation_status.json`: queue/status summary for the snapshot

## Notes

This is a progress snapshot. The canonical text layer is the Hanja source tree. Korean translation, reading, meaning, and entity data are derivative layers and will be updated continuously as MiniMax and MiMo runs progress.
