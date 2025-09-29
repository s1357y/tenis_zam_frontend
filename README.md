# Tennis Zam Frontend

잠중 테니스 캘린더 플랫폼의 프론트엔드 애플리케이션입니다.

## 🚀 기능

### 인증 시스템
- 이름과 전화번호를 통한 간편 회원가입
- 전화번호 기반 로그인
- JWT 토큰 기반 인증 관리
- 자동 토큰 갱신 및 만료 처리

### 캘린더 & 일정 관리
- **캘린더 뷰**: 월별 일정을 시각적으로 확인
- **목록 뷰**: 일정을 리스트 형태로 조회
- 일정 생성, 수정, 삭제
- 일정 상세 정보 모달
- 참여 상태 관리 (참여/불참/미정)

### 반응형 UI
- 모바일, 태블릿, 데스크톱 완벽 지원
- Tailwind CSS 기반 모던 디자인
- 직관적인 사용자 인터페이스

### 관리자 기능
- 사용자 승인/거부
- 사용자 삭제
- 승인 대기 사용자 관리
- 다른 사용자 참여 상태 관리

## 📋 사전 요구사항

- Node.js 16 이상
- npm 또는 yarn
- Tennis Zam Backend 서버 실행 중

## 🛠 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성하고 설정값을 입력하세요.

```bash
cp .env.local.example .env.local
```

### 3. 개발 서버 실행
```bash
npm run dev
```

개발 서버는 기본적으로 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 4. 프로덕션 빌드
```bash
npm run build
npm start
```

## 🏗 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Layout.tsx      # 기본 레이아웃 컴포넌트
│   └── modals/         # 모달 컴포넌트들
├── contexts/           # React Context (상태 관리)
│   └── AuthContext.tsx # 인증 컨텍스트
├── hooks/              # 커스텀 훅
├── pages/              # Next.js 페이지 컴포넌트
│   ├── index.tsx       # 메인 캘린더 페이지
│   ├── login.tsx       # 로그인 페이지
│   ├── register.tsx    # 회원가입 페이지
│   └── admin/          # 관리자 페이지
├── styles/             # 스타일 파일
│   └── globals.css     # 글로벌 CSS
├── types/              # TypeScript 타입 정의
│   └── index.ts        # 공통 타입 정의
└── utils/              # 유틸리티 함수
    └── api.ts          # API 호출 함수들
```

## 🎨 주요 컴포넌트

### AuthContext
사용자 인증 상태를 전역적으로 관리합니다.
- 로그인/로그아웃 처리
- 토큰 관리
- 사용자 정보 저장

### Layout
모든 페이지의 기본 레이아웃을 제공합니다.
- 네비게이션 바
- 사용자 정보 표시
- 반응형 메뉴

### ScheduleModal
일정 생성 및 수정을 위한 모달 컴포넌트입니다.
- 폼 검증
- 날짜/시간 입력
- 장소 정보 입력

### ScheduleDetailModal
일정 상세 정보를 표시하는 모달입니다.
- 참여 상태 변경
- 참여자 목록
- 일정 수정/삭제 (권한에 따라)

## 📱 반응형 디자인

### 브레이크포인트
- **모바일**: < 640px
- **태블릿**: 640px - 1024px
- **데스크톱**: > 1024px

### 모바일 최적화
- 터치 친화적인 버튼 크기
- 간소화된 네비게이션
- 스와이프 제스처 지원

## 🔧 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| NEXT_PUBLIC_API_URL | 백엔드 API URL | http://localhost:3001 |

## 🎯 주요 특징

### 1. 사용자 친화적 인터페이스
- 직관적인 캘린더 네비게이션
- 명확한 액션 버튼
- 즉시 피드백 제공

### 2. 실시간 상태 업데이트
- 참여 상태 변경 시 즉시 반영
- 일정 생성/수정 후 자동 새로고침
- 토스트 알림으로 사용자 피드백

### 3. 접근성 고려
- 키보드 네비게이션 지원
- 충분한 색상 대비
- 스크린 리더 지원

### 4. 성능 최적화
- Next.js SSR/SSG 활용
- 이미지 최적화
- 코드 분할 (Code Splitting)

## 🧪 개발 도구

### TypeScript
전체 프로젝트에 TypeScript를 적용하여 타입 안정성을 보장합니다.

### ESLint
코드 품질 유지를 위한 린팅 도구입니다.
```bash
npm run lint
```

### Tailwind CSS
유틸리티 중심의 CSS 프레임워크로 빠른 스타일링이 가능합니다.

## 📊 주요 라이브러리

- **Next.js 14**: React 프레임워크
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 스타일링
- **React Hook Form**: 폼 관리
- **React Calendar**: 캘린더 컴포넌트
- **Axios**: HTTP 클라이언트
- **React Hot Toast**: 알림 시스템
- **React Icons**: 아이콘 라이브러리
- **date-fns**: 날짜 처리

## 🚀 배포

### Vercel (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### 기타 플랫폼
- Netlify
- AWS Amplify
- GitHub Pages (static export 시)

## 📄 라이선스

MIT License