# Hybrid Web Lab

랜딩, 바닐라 게시판 프로젝트, React 식단 플래너, View 플래너를 하나의 Vite 멀티페이지 구성으로 관리하는 저장소입니다.

## 프로젝트 구성

### 1) Landing
- 진입: `landing/index.html`
- 역할: 전체 프로젝트 소개 및 빠른 이동

### 2) Vanilla Board Project
- 실제 소스 루트: `src/`
- 페이지 엔트리
  - 메인: `src/pages/main/main.html`
  - 게시글 목록: `src/pages/post-list/list.html`
  - 게시글 상세: `src/pages/post-detail/detail.html`
  - 작성: `src/pages/write/write.html`
  - 로그인: `src/pages/login/login.html`
  - 마이페이지: `src/pages/mypage/mypage.html`
  - 프로필: `src/pages/profile/profile.html`
- 참고: `projects/vanilla/*.html`은 기존 링크 호환용 리다이렉트 페이지입니다.
- API 동작: `VITE_API_BASE_URL`이 없으면 localStorage 기반 로컬 모드로 동작합니다.

### 3) React Meal Planner
- 진입: `projects/react/index.html`
- 역할: 식단 카드 관리, 좋아요/완료/상세 접기, 항목 추가/삭제, 메뉴별 서브페이지

### 4) View Planner
- 진입: `projects/view/index.html`
- 역할: 모바일 중심 플래너/챌린지/통계 화면

## 공통 스타일 자산
- `shared-scss/_variables.scss`
- `shared-scss/_mixins.scss`
- `shared-scss/_reset.scss`

## 실행 방법

### 설치
```bash
npm install
```

### 개발 서버
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

### 빌드 결과 미리보기
```bash
npm run preview
```

## 메모
- 바닐라 페이지는 `src/main.js`에서 공통 컴포넌트 로딩과 함께 `메인` 플로팅 버튼(`landing/index.html` 이동)을 자동 주입합니다.
