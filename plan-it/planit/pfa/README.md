# Planit Frontend (`pfa`)

React 기반 여행 설계 서비스 Planit의 사용자/관리자 웹 클라이언트입니다. 여행지 탐색, AI 플래너, 코스 관리, 관리자 콘솔까지 하나의 SPA 안에서 제공합니다.

---

## 기술 스택
- **런타임**: React 19 (CRA), React Router v7, React Hooks
- **UI 라이브러리**: React Icons, React Slick, Slick Carousel
- **지도/외부 SDK**: `@react-google-maps/api`, Kakao 지도 REST 연동
- **데이터 통신**: Axios (전역 인터셉터로 JWT 헤더 및 에러 처리)
- **마크다운 렌더링**: `react-markdown`
- **스타일링**: 전역 CSS + 이미지 에셋

---

## 주요 화면 흐름

1. **공개 영역**
   - `/` 홈: 추천 코스, 프로모션 배너, 서비스 소개.
   - `/theme/*`: 계절별 테마 여행 콘텐츠.
   - `/festival`, `/festival/:id`: 공공데이터 기반 축제 리스트/상세.
   - `/tourlist/:city/:area/:cat/:arr/:pgno`: 한국관광공사 TourAPI 목록, 필터/페이지네이션.
   - `/tourinfo/...`: 개별 여행지 상세, 지도/사진/리뷰.

2. **AI/추천 영역**
   - `/aitalk`: `ai/AiPlanner` 컴포넌트가 대화 이력(`/api/chat/history`)을 불러오고, 질문을 `/api/chat/ask-ai`로 전달하여 코스를 추천받습니다.
   - `/course/list`, `/course/detail/:id`: 공개 코스 카탈로그, 좋아요/조회수 표시.

3. **사용자 영역**
   - `/signup`: 이메일 인증, SMS 중복 검사, 유효성 검사를 포함한 가입 폼.
   - `/login`, `/find`: 로그인 및 계정 찾기.
   - `/mypage`, `/mypage/my-courses`, `/my-course/edit/:courseId`: 내 정보·비밀번호 변경, 코스 CRUD, Drag&Drop 편집.
   - `/map`: 구글맵으로 내 코스/찜 장소 시각화.

4. **관리자 영역**
   - `/admin/login`: 관리자 인증, 발급된 JWT는 동일 Storage에 저장.
   - `/admin`, `/admin/reports`, `/admin/users`, `/admin/users/withdrawn`: 신고 관리, 통계 카드, 회원/탈퇴자 목록, CSV 백업 트리거.

---

## 상태 및 통신 전략
- 인증 토큰은 `sessionStorage`에 저장, axios 인스턴스(`src/api`)에서 `Authorization: Bearer <token>` 자동 부여.
- 401 응답 시 로그인 페이지로 리디렉션, 토큰 만료 시 스토리지 초기화.
- 폼 검증은 각 컴포넌트에서 로컬 상태 + 유틸 함수로 처리 (예: `SignupForm`의 `validateField`).
- 공통 UI(헤더/푸터)는 `components/Header`, `components/main/Footer`에서 관리하며 `App.js`의 Router 바깥에 배치.

---

## 디렉터리 구조 가이드

```
src/
├─ components/        # 공통 UI, 인증, 테마, 홈 섹션
├─ user/
│  ├─ ai/             # AI 플래너
│  ├─ tour/           # TourAPI 리스트/상세
│  ├─ MyCourse*       # 마이코스 CRUD
│  └─ MapPage, MyPage, EditProfile 등
├─ admin/             # 관리자 대시보드/신고/회원 화면
├─ api/               # axios 인스턴스, API 래퍼
├─ module/, util/     # 공통 로직, 상수
├─ css/               # 전역 스타일
└─ img/               # 로컬 이미지 자산
```

---

## 실행 방법

```bash
npm install
npm start            # package.json에서 PORT=80 설정
```

- 프록시(`package.json > proxy`)가 `http://localhost:8080`으로 지정되어 있으므로 백엔드 서버(pib)가 먼저 구동돼야 합니다.
- 프로덕션 빌드: `npm run build`
- 테스트: `npm test`

---

## 개발 팁
- 관리자/사용자 권한 분기 로직은 서버에서 최종적으로 검증되므로, 프론트에서는 네비게이션 차단 정도만 구현합니다.
- 새로운 API를 붙일 때는 `src/api`의 axios 인스턴스를 이용해 에러 핸들링을 통일하세요.
- 지도/외부 SDK 키는 `.env`(`REACT_APP_*`)로 관리하고 깃에 커밋하지 않습니다.
- 이미지/파일 업로드 결과는 백엔드 `/uploads/**` 경로에 저장되며, 절대 URL을 그대로 렌더링합니다.

필요한 추가 문서(컴포넌트별 상세 등)가 있으면 자유롭게 요청해 주세요.
