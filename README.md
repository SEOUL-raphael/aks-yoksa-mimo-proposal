# 한국학중앙연구원 한국학 디지털 아카이브 고도서 한문 원문·한글 번역 공개 스냅샷

한국학중앙연구원이 제공하는 한국학 기초자료 및 고문헌 정보 서비스인 `한국학 디지털 아카이브`의 고도서 본문 텍스트를 수집하고, 한문 원문을 기준으로 한글 번역·독음·의미 요약을 붙인 공개용 Markdown 스냅샷입니다.

이 저장소는 연구·검토·검색을 위한 공개본입니다. 원문 한문은 검증 가능한 기준 데이터로 유지하고, 한글 번역과 독음은 파생 데이터로 함께 제공합니다.

## 바로 보기

- [책별 Markdown 목록](kr/README.md)
- [책 색인](./_index/books.md)
- [본문 묶음 색인](./_index/parts.md)
- [프로젝트 개요](./PROJECT.md)
- [데이터 출처와 범위](./DATA_SOURCE.md)
- [진행 상태](./STATUS.md)

## 공개 범위

- 공개 책 수: 359건
- 공개 기사 수: 67994건
- 공개 기준: MiniMax 성공 번역 중 번역문이 비어 있지 않은 항목
- 기준 데이터: 한문 원문
- 파생 데이터: 한글 번역, 독음, 의미 요약, 엔티티 후보, 불확실한 어휘

## 데이터 출처

- 출처명: 한국학중앙연구원 한국학 디지털 아카이브 고도서 본문텍스트 서명별 목록
- 원 URL: http://yoksa.aks.ac.kr/jsp/aa/BookList.jsp?fcs=s&fcsd=st
- 수집 범위: `고도서 > 본문텍스트 > 서명별` 목록과 그 하위 서지·해제·권책·기사·본문 페이지
- 원 페이지 기준 전체 목록: 1408건
- 원 페이지 주요 연결: 서지, 해제, 권책, 이미지

## 저장소 구조

- `kr/books/<book_id>/README.md`: 책별 서지, 해제 링크, 본문 번역 묶음 목록
- `kr/books/<book_id>/part-001.md`: 여러 기사 단위 번역을 묶은 Markdown 파일
- `_index/books.md`: 사람이 읽기 쉬운 책 색인
- `_index/parts.md`: 사람이 읽기 쉬운 본문 묶음 색인
- `_index/books.jsonl`, `_index/parts.jsonl`: 기계 처리를 위한 색인
- `manifest.json`: 공개 스냅샷 메타데이터

## 검색 키워드

한국학중앙연구원, 한국학 디지털 아카이브, 고도서, 장서각, 본문텍스트, 한문 원문, 한문 번역, 한국어 번역, 독음, 조선시대 문헌, 디지털 인문학, 지식 그래프, Korean Studies Digital Archive, Korean classics, Hanmun translation, Korean history, digital humanities.

## 공개 제외

원본 HTML, SQLite DB, 로그, API 키와 환경변수, 실패 번역 전문, 대용량 전체 JSONL은 공개 저장소에 포함하지 않습니다.
