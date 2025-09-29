# Hot Reload 설정 가이드

## 설정된 기능들

### 1. Next.js Fast Refresh 최적화
- `next.config.js`에 Fast Refresh 설정 추가
- webpack 파일 감시 최적화 설정
- Turbo 모드 지원 추가

### 2. 개발 서버 실행 방법

```bash
# Turbo 모드로 실행 (더 빠른 Hot Reload)
npm run dev

# 일반 모드로 실행
npm run dev:normal
```

### 3. 권장 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 개발 환경 설정
NEXT_PUBLIC_API_URL=http://localhost:3001

# Fast Refresh 최적화
NEXT_TELEMETRY_DISABLED=1

# 개발 모드 최적화
NODE_ENV=development
```

### 4. Hot Reload가 작동하지 않는 경우

1. **개발 서버 재시작**
   ```bash
   # 현재 서버 중지 후
   npm run dev
   ```

2. **브라우저 캐시 클리어**
   - Chrome: Ctrl+Shift+R (또는 Cmd+Shift+R on Mac)

3. **node_modules 재설치**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Next.js 캐시 클리어**
   ```bash
   rm -rf .next
   npm run dev
   ```

### 5. 파일 변경 감지 최적화

현재 설정된 파일 감시 옵션:
- Poll 주기: 1초
- 변경 감지 대기시간: 300ms
- node_modules 폴더는 감시 제외

### 6. 지원되는 Hot Reload 기능

- ✅ React 컴포넌트 변경
- ✅ CSS/Tailwind 스타일 변경
- ✅ TypeScript 타입 변경
- ✅ 페이지 라우팅 변경
- ✅ API 라우트 변경 (수동 새로고침 필요)

### 7. 문제 해결

**증상**: 파일을 저장해도 변경사항이 반영되지 않음
**해결**: 
1. 터미널에서 에러 메시지 확인
2. 브라우저 개발자 도구 콘솔 확인
3. 개발 서버 재시작

**증상**: 변경사항이 느리게 반영됨
**해결**:
1. `npm run dev` 대신 Turbo 모드 사용
2. 불필요한 파일들이 감시되고 있는지 확인
