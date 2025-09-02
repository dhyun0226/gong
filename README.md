# 공(空) - 로컬 독서기록 앱

## 설치 및 실행

```bash
# 프로젝트 디렉토리로 이동
cd gong

# 의존성 설치
npm install

# Expo 시작
npx expo start

# iOS 실행 (Mac에서만)
npx expo start --ios

# Android 실행
npx expo start --android
```

## 주요 기능

- 완전 로컬 전용 (SQLite 기반)
- 모노톤 디자인 (#121212, #E0E0E0, #333)
- e-ink 친화적 모드
- 페이지별 독서 기록 관리
- 좌우 동기화 스크롤 리스트

## 초기 더미 데이터 삽입 (선택사항)

`app/data/db.ts` 파일의 `initDatabase` 함수에 다음 코드 추가:

```typescript
// 더미 데이터 삽입
tx.executeSql(
  `INSERT OR IGNORE INTO books (id, title, author, rating, startedDate) 
   VALUES ('demo-1', '데미안', '헤르만 헤세', 4.5, '2024-01-01');`
);

tx.executeSql(
  `INSERT OR IGNORE INTO entries (id, book_id, page_start, page_end, text, created_at)
   VALUES ('entry-1', 'demo-1', 16, 16, '새는 알에서 나오려고 투쟁한다.', 1704067200000);`
);
```

## 페이지 입력 형식

- 단일 페이지: `16`, `p16`, `p.16`
- 페이지 범위: `19-20`, `19~20`, `p 19–20`

## 정렬 규칙

1. page_start ASC
2. page_end ASC  
3. created_at ASC (입력 순서)