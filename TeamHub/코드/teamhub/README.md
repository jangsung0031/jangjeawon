# TeamHub 프론트엔드

## 소개
TeamHub 프론트엔드는 리조트 객실·워터레저 예약, 커뮤니티, 마이페이지 기능을 제공하는 React 애플리케이션입니다. React Router로 라우팅을 구성하고, Axios를 통해 Spring Boot 백엔드(`http://localhost:8080`)와 통신합니다.

## 주요 기능
- **예약 경험**: 객실·워터레저 리스트/상세, 날짜 선택, 결제 페이지 연동
- **마이페이지**: 예약 내역, 리뷰 관리, 회원정보 수정
- **커뮤니티**: 공지/FAQ/Q&A CRUD, 관리자 검수 화면
- **리뷰·활동**: 이용 후기 작성/편집, 액티비티 소개, 챗봇/상담

## 기술 스택
- React 19 + React Router DOM 6
- Axios, Date-fns, React Datepicker
- Bootstrap 5, React-Bootstrap, Slick Carousel

## 폴더 구조
```
src/
  Activity/         # 레저 액티비티 목록/상세
  home/             # 헤더·푸터·메인·로그인 관련 화면
  pages/            # 객실·레저 상세/결제 페이지
  mypage/           # 예약/리뷰 관리, 관리자 화면
  notice, faq, qna  # 커뮤니티 게시판
  room/             # 객실 리스트·결제
  components/       # 공통 위젯(캐러셀 등)
  data/             # 더미 데이터, FAQ 등 상수
```

## 로컬 개발
```bash
cd teamhub
npm install
npm start
```
- `npm start`는 포트 80에서 CRA 개발 서버를 실행합니다. 다른 포트를 사용하려면 `PORT` 환경 변수를 덮어쓰세요.
- API 프록시는 `package.json`의 `proxy`(`http://localhost:8080`) 설정을 사용합니다.

## 빌드 & 테스트
```bash
npm run build   # 프로덕션 번들 생성
npm test        # 기본 테스트 러너
```

## 환경 변수
- `.env`에 `REACT_APP_*` 접두사의 키를 정의하여 결제 키, API 서버 주소 등을 주입합니다.
- 이미지/정적 자산은 `public/img`와 `src/css`에서 관리합니다.

## 배포 팁
- `npm run build` 결과물(`build/`)을 Nginx 등 정적 서버에 업로드합니다.
- 백엔드 도메인과의 CORS/프록시 설정을 서버 환경에 맞게 조정하세요.
