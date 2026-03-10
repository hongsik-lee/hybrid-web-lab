# Hybrid Web Lab

랜딩, 바닐라 게시판 프로젝트, React 식단 플래너, Vue 플래너를 하나의 Vite 멀티페이지 구성으로 관리하는 저장소입니다.

## 배포 바로가기

- 메인(랜딩) 페이지: https://hongsik-lee.github.io/hybrid-web-lab/

## 프로젝트 구성

### 1) Landing
- 진입: `landing/index.html`
- 역할: 전체 프로젝트 소개 및 하위 프로젝트 빠른 이동

### 2) Vanilla Board Project
- 실제 소스 루트: `src/`
- 진입: `src/pages/main/main.html` (랜딩에서 Vanilla 카드 클릭)
- 사용자가 이용할 수 있는 기능
  - 게시글 목록 조회 및 페이지 이동
  - 게시글 작성
  - 게시글 상세 조회
  - 댓글 작성 및 조회
  - 대시보드에서 최근 게시글 확인
  - 체크리스트 추가/완료/삭제(로컬 저장)
  - 로그인/마이페이지/프로필 화면 이용
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
- 사용자가 이용할 수 있는 기능
  - 요일별 식단 카드 조회
  - 검색어 기반 식단 필터링
  - 보기 모드 전환(전체 주간/평일/집중 요일)
  - 식단 카드 좋아요 토글
  - 식단 완료 처리 및 상세 접기/펼치기
  - 식단 상세 항목 추가/삭제
  - 모달로 새 식단 추가
  - 진행률(Progress) / 인기 식단(Recipe Lounge) 화면 확인

### 4) Vue Planner
- 진입: `projects/vue/index.html`
- 사용자가 이용할 수 있는 기능
  - 온보딩 이름 입력 및 프로필 정보 저장
  - 요일 선택 기반 일정 확인
  - 일정 완료 처리/해제
  - 타이머 설정/시작/일시정지/초기화
  - 일정 추가/수정/삭제
  - 챌린지 완료 처리(누적 횟수 반영)
  - 검색 화면에서 일정 검색
  - 통계 화면에서 완료 개수/달성률 확인

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

## GitHub Pages 배포
- 워크플로 파일: `.github/workflows/deploy-pages.yml`
- 배포 방식: `main` 브랜치 push 시 `vite build` 후 `dist`를 GitHub Pages에 게시
- 메인 URL: https://hongsik-lee.github.io/hybrid-web-lab/
- 저장소 설정에서 `Settings > Pages > Build and deployment > Source`를 `GitHub Actions`로 선택해야 합니다.

## 메모
- 바닐라 페이지는 `src/main.js`에서 공통 컴포넌트 로딩과 함께 `메인` 플로팅 버튼(`landing/index.html` 이동)을 자동 주입합니다.
