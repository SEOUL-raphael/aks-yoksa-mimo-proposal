# Progress Status

Snapshot time: 2026-05-12 09:59 KST

## Source Tree

- Books: 439
- Volumes: 1,325
- Articles: 113,150
- Translatable articles with body text: 112,287

## Translation Queue

- Pending: 108,813
- Running: 4
- OK: 940
- Failed: 2,530
- Total: 112,287

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
