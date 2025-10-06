# Vercel 배포 가이드

## 환경변수 설정

Vercel 대시보드에서 다음 환경변수를 설정해야 합니다:

### 필수 환경변수
- `NEXT_PUBLIC_API_URL`: 백엔드 서버 URL (예: https://52.62.221.116:3001)

### 설정 방법
1. Vercel 대시보드에 로그인
2. 프로젝트 선택
3. Settings > Environment Variables 메뉴로 이동
4. 다음 환경변수 추가:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://52.62.221.116:3001`
   - Environment: Production, Preview, Development 모두 선택

## 배포 명령어

```bash
# 프로젝트 빌드
npm run build

# 로컬에서 프로덕션 빌드 테스트
npm start
```

## 문제 해결

### CORS 에러
- 백엔드 서버의 CORS 설정에서 Vercel 도메인이 허용되었는지 확인
- 현재 허용된 도메인:
  - `https://tenis-zam-frontend.vercel.app`
  - `https://tenis-zam-frontend-git-main.vercel.app`
  - `https://tenis-zam-frontend-git-develop.vercel.app`

### API 연결 실패
- 백엔드 서버가 실행 중인지 확인
- 방화벽 설정 확인 (포트 3001이 열려있는지)
- SSL 인증서 설정 확인 (HTTPS 사용 시)

## 커스텀 도메인 사용 시
커스텀 도메인을 사용하는 경우, 백엔드 서버의 CORS 설정에 해당 도메인을 추가해야 합니다.
