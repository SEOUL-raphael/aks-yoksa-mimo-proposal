# AKS Yoksa MiMo Proposal Snapshot

This public snapshot shares the successful portion of the AKS Yoksa classical text pipeline in a GitHub-friendly structure inspired by `legalize-kr`.

## Current Snapshot

- Source books: 439
- Source volumes: 1,325
- Source articles with translatable body text: 112,287
- Successful translations: 28,079
- Failed first-pass attempts retained locally for retry: 79,451
- Pending/running: 4,697 / 60

## Published Data

- `_index/translation_status.json`: machine-readable progress and security notes
- `_index/translations_success.jsonl.gz`: successful Korean reading/translation/meaning records
- `_index/articles_success.jsonl.gz`: successful translations joined with cleaned Hanmun source and provenance URL
- `_index/translations_success_sample.jsonl`: quick review sample of successful rows
- `kr/`: path-based source tree sample with bibliography, haje, article source, and translation fields

## Security And Quality

API keys, tokens, raw HTML cache, local SQLite databases, logs, virtual environments, process files, and failed-attempt logs are excluded. Canonical article bodies and the public `kr/` tree were cleaned to remove AKS viewer navigation artifacts such as `????`, `????`, and `?` before this snapshot.

## Strategy

The Hanmun source text remains canonical. Korean translation, Korean reading, semantic summary, and entity candidates are derivative layers that can be regenerated with MiniMax, MiMo, or other models as credits and quality controls improve.

---

# ??? ??

? ???? AKS ??? ??? ?????? `legalize-kr` ???? ?? ?? ??? ????, ??? ?? ?? ??? ?? ?? ??? ??? ???? ?? ?? ??????.

?? ??? canonical? ????, ?? ???????? ?????? ??? ?? ???? ???. MiMo ?? ?? ? ?? ?? ?? ??? ?? ??? ??? ? ??? ?? ??? ?? ??? ??? ?????.
