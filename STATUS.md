# Status

Updated: 2026-06-05T05:59:30.324777+00:00

## Translation Queue

- Total: 112,287
- OK: 28,079
- Failed: 79,451
- Pending: 4,697
- Running: 60

## Public Snapshot

- Publishes successful translation rows only.
- Excludes failed-attempt logs, secrets, raw HTML cache, SQLite DBs, logs, and local runtime files.
- Includes cleaned Hanmun source text for successful rows and a `kr/` path-based sample tree.

## Cleanup

- Removed AKS viewer navigation artifacts from canonical article bodies and public tree: `????`, `????`, `?`.
- Requeued affected translation results locally for retry.

## Next

- Continue first-pass queue completion.
- Retry failed rows after additional MiniMax/MiMo capacity is available.
- Refresh KG and search indexes after the full first-pass queue is complete.
