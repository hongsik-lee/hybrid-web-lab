# Hybrid Web Lab

JavaScript, React, View(플래너) 3가지 스타일의 웹 프로젝트를 한 랜딩 페이지에서 소개하는 실습 저장소입니다.
바로가기 : https://hongsik-lee.github.io/hybrid-web-lab/landing

## 프로젝트 개요

### 1) Landing
- 역할: 전체 프로젝트 소개, 미리보기, 빠른 진입
- 진입 링크: `landing/index.html`

### 2) Vanilla JS Dashboard + Board
- 역할: 대시보드, 체크리스트, 게시판 목록/작성/상세
- 주요 페이지
  - 대시보드: `projects/vanilla/index.html`
  - 게시판 목록: `projects/vanilla/board-list.html`
  - 게시글 작성: `projects/vanilla/board-write.html`
  - 게시글 상세: `projects/vanilla/board-view.html`

### 3) React Admin Dashboard
- 역할: 관리자 대시보드/분석 화면 (UMD + Babel)
- 주요 페이지
  - 개발 진입: `projects/react/index.html`
  - 배포형 진입: `projects/react/dist/index.html`

### 4) View Planner Project
- 역할: 모바일 중심 플래너, 일정/챌린지/타이머/프로필/검색/통계
- 주요 페이지
  - 홈: `projects/view/index.html`
  - 액션: `projects/view/pages/action.html`
  - 챌린지: `projects/view/pages/challenge.html`
  - 요일 상세: `projects/view/pages/day.html`
  - 일정 목록/CRUD: `projects/view/pages/plans.html`
  - 일정 상세(주짓수): `projects/view/pages/plan-judo.html`
  - 일정 상세(밸런스): `projects/view/pages/plan-balance.html`
  - 검색: `projects/view/pages/search.html`
  - 프로필: `projects/view/pages/profile.html`
  - 통계: `projects/view/pages/stats.html`

## 공통 스타일 구조
- `shared-scss/_variables.scss`: 컬러/타이포/브레이크포인트 토큰
- `shared-scss/_mixins.scss`: 공통 믹스인 및 `rem()` 함수
- `shared-scss/_reset.scss`: 리셋 및 기본 타이포
- `shared-scss/_fonts.scss`: Noto Sans KR 폰트 정의

## 실행 및 빌드

### 의존성 설치
```bash
npm install
```

### Sass 빌드
```bash
npm run sass:all
```

### 프로젝트별 빌드
```bash
npm run sass:landing
npm run sass:vanilla
npm run sass:react
npm run sass:view
```

## 네비게이션 메모
- 모든 프로젝트의 모든 페이지에 우측 하단 `메인` 플로팅 버튼이 있어 `landing/index.html`로 복귀할 수 있습니다.
