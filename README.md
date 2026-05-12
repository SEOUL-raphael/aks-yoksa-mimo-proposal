# AKS Yoksa Tree Snapshot

한국학중앙연구원 장서각 `고도서 > 본문텍스트 > 서명별` 공개 자료를 `legalize-kr` 스타일의 경로 기반 트리로 정돈한 진행형 데이터 저장소입니다.

원문 한문을 canonical 데이터로 유지하고, 한국어 번역, 독음, 의미 요약, 엔티티 후보는 파생 레이어로 누적합니다.

## Project Documents

- `PROJECT.md`: MiMo 신청 근거로 사용할 프로젝트 설명
- `ROADMAP.md`: 원문 공개, 번역, 색인, 지식 그래프 계획
- `STATUS.md`: 현재 번역 큐와 진행 현황
- `_index/translation_status.json`: 기계 처리용 진행 현황 스냅샷
- `_index/translations_progress.jsonl`: 현재까지의 번역 성공/실패 시도 로그

## Layout

- `kr/{서명}/README.md`: 서명 요약
- `kr/{서명}/서지.json`: 서지 메타데이터
- `kr/{서명}/해제.md`: 해제 원문
- `kr/{서명}/{권책}/{기사}.md`: 사람이 읽는 기사 원문/번역
- `kr/{서명}/{권책}/{기사}.json`: 기계 처리용 기사 레코드
- `_index/books.jsonl`: 서지 색인
- `_index/articles.jsonl`: 기사 색인
- `_index/translations_progress.jsonl`: 번역 진행 스냅샷

## Counts

- Exported books: 439
- Exported volumes: 1,325
- Exported articles: 113,150
- Translatable articles with body text: 112,287
- Translation queue OK at latest snapshot: 940
- Translation queue failed at latest snapshot: 2,530

## Current Strategy

한문 원문을 먼저 공개하고, 한국어 번역은 SQLite 작업 큐 기반으로 계속 누적합니다. 실패 결과도 오류 사유와 함께 보존하여 MiniMax 및 MiMo 재처리 근거로 사용합니다.

이 저장소는 완성본이 아니라 진행 중인 공개 작업물입니다. MiMo 토큰 확보 후 번역 및 품질 개선 결과를 같은 구조에 계속 반영할 예정입니다.
