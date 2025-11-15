# TeamHub Monorepo

## 개요
TeamHub은 리조트 객실·워터레저 예약, 커뮤니티, 리뷰, 관리자 도구를 통합 제공하는 풀스택 서비스입니다. 본 저장소는 **Spring Boot 백엔드**(`th/`)와 **React 프론트엔드**(`teamhub/`)를 한 번에 관리합니다.

## 구성
```
├─ README.md              # 통합 문서 (현재 파일)
├─ th/                    # Spring Boot 백엔드
│  └─ README.md           # 백엔드 전용 문서
├─ teamhub/               # React 프론트엔드
│  └─ README.md           # 프론트 전용 문서
├─ th.SQL                 # DB 스키마/샘플
└─ thImg/                 # 로컬 업로드용 이미지
```

## 핵심 기능
- 회원가입/로그인, JWT 기반 인증, SMS·이메일 인증
- 객실 및 워터레저 예약, 포트원 결제/취소 연동
- 마이페이지(예약, 리뷰, 정보수정)와 관리자 통계/예약 관리
- 공지·FAQ·Q&A 게시판 및 댓글/답변, 실시간 채팅
- 리뷰 및 액티비티 소개, 챗봇 가이드

## 기술 스택
- **백엔드**: Java 17, Spring Boot 3.5, Spring Security, Spring Data JPA, MySQL, PortOne, Nurigo SMS, WebSocket
- **프론트엔드**: React 19, React Router DOM 6, Axios, Bootstrap 5, Slick Carousel

## 빠른 시작
1. 필수 도구 설치: Node.js 20+, JDK 17, MySQL 8
2. 저장소 클론 후 의존성 설치
   ```bash
   cd th && ./gradlew build      # 백엔드
   cd ../teamhub && npm install  # 프론트엔드
   ```
3. 환경 변수/설정
   - `th/src/main/resources/application.properties`에서 DB, JWT, PortOne, 메일, SMS 키를 본인 환경으로 교체하거나 외부 설정으로 분리
   - `teamhub/.env`에 프론트 전용 API 베이스 주소, 결제 키 등을 정의
4. 로컬 실행
   ```bash
   # 백엔드 (http://localhost:8080)
   cd th
   ./gradlew bootRun

   # 프론트엔드 (http://localhost:80)
   cd ../teamhub
   npm start
   ```

## 배포 전략
- 백엔드: `./gradlew bootJar` 후 생성된 JAR을 서버에 배포, 운영환경에서는 `spring.jpa.hibernate.ddl-auto=validate` 권장
- 프론트엔드: `npm run build` 결과물을 CDN 또는 Nginx에 업로드, 필요 시 백엔드 Reverse Proxy 설정
- 공통: 도메인 분리 시 CORS, HTTPS 인증서, WebSocket 업그레이드 규칙을 함께 설정

## 추가 문서
- 백엔드 상세: `th/README.md`
- 프론트엔드 상세: `teamhub/README.md`
- DB 스키마/더미 데이터: `th.SQL`, `th/src/main/resources/data.sql`

