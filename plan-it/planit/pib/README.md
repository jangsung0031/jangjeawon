# Planit Backend (`pib`)

Spring Boot 3.5 기반으로 구현된 Planit 백엔드 서비스입니다. 사용자 인증, AI 챗봇, 공공데이터 연동, 여행/축제/코스 도메인, 관리자 기능을 통합 제공합니다.

---

## 기술 스택
- **Framework**: Spring Boot 3.5, Spring Web, Spring Security, Spring Data JPA
- **인증/보안**: JWT (io.jsonwebtoken), BCrypt, CORS 설정, Custom `JwtFilter`
- **데이터베이스**: MySQL 8.x (`spring.jpa.hibernate.ddl-auto=update`)
- **캐시/세션**: Redis (Spring Cache)
- **비동기 호출**: WebClient(WebFlux), RestTemplate + Apache HttpClient5
- **외부 연동**: OpenAI API, KCISA/TourAPI, Kakao REST, CoolSMS, Gmail SMTP
- **기타**: Jakarta Validation, Jackson Databind/XML, Lombok

---

## 모듈 구조

```
src/main/java/kr/co/pib
├─ config/          # Security, JWT, CORS, SMTP/SMS, 정적 리소스 설정
├─ controller/      # REST API (Auth, AI, Festival, Tour, MyCourse, Admin 등)
├─ dto/             # 요청/응답 DTO, AI/코스/유저 등
├─ entity/          # JPA 엔티티
├─ repository/      # Spring Data JPA Repository
├─ service/         # 비즈니스 로직, 외부 API 연동
├─ util/            # 헬퍼 클래스
└─ PibApplication   # @SpringBootApplication, @EnableCaching
```

`src/main/resources`에는 `application.properties`, 정적 리소스, Thymeleaf 템플릿(이메일 등)이 포함됩니다.

---

## 주요 구성 요소

### 1. 인증 & 보안
- `SecurityConfig`
  - CSRF 비활성화, CORS 허용, Stateless 세션.
  - `/api/auth/**`, `/api/festival/**`, `/api/tour/**`, `/api/kcisa/**` 등 공개 경로 지정.
  - `/api/my-course/**`, `/api/my-tour-courses/**`, `/api/users/**`를 USER/ADMIN 롤에만 허용.
  - `/api/admin/**`는 `ROLE_ADMIN` 권한 검사.
- `JwtFilter`: Authorization 헤더 파싱 → 토큰 검증 후 `Authentication` 주입.
- `AdminAccountInitializer`: 최초 기동 시 기본 관리자 계정 자동 생성.

### 2. 사용자/계정
- `UserController` (`/api/auth`)
  - 이메일 인증 여부 확인 후 회원가입 (`signup`)
  - 아이디/이메일 병행 로그인, JWT/리프레시 발급
  - 닉네임/이메일/전화 중복 체크
- `UsersController`
  - 마이페이지 정보 조회·수정, 탈퇴, 비밀번호 변경
- `EmailAuthController`, `SmsController`
  - Gmail SMTP / CoolSMS 로 인증 코드 발송, Redis/세션에 검증 상태 저장

### 3. AI 플래너
- `AiChatController` (`/api/chat`)
  - `history`, `messages/{chatroomId}`, `ask-ai` 엔드포인트 제공
  - `AiService`가 OpenAI API를 호출하고, `AiChatService`가 대화 히스토리/메시지를 DB에 저장
  - `@AuthenticationPrincipal String userId` 패턴으로 현재 사용자 로딩

### 4. 여행/축제/코스 도메인
- `FestivalController`: 공공 축제 데이터 목록/상세/이미지 제공
- `TourCourseController`, `KcisaApiController`, `MapController`
  - 한국관광공사 TourAPI, KCISA, Kakao REST를 호출하여 여행지·코스 데이터를 가공
- `MyCourseController`, `MyTourCourseController`, `MyPlaceController`
  - 사용자 코스 CRUD, 장소 즐겨찾기, AI 추천안 저장, 공개/비공개 전환
- `CourseInteractionController`
  - 좋아요·조회수·공유 등의 상호작용 집계

### 5. 관리자 기능
- `AdminLoginController`(SecurityConfig 상 `/api/admin/**`)
- `AdminReportOpenController`, `AdminUserOpenController`
  - 신고 리스트, 상태 변경, 사용자 목록/백업, 탈퇴자 조회, 통계 데이터 제공
- `AdminUserBackupController`
  - CSV/엑셀 백업, 정기 다운로드 지원

---

## 환경 변수 / 설정
`src/main/resources/application.properties` 예시 (민감 값은 환경 변수로 치환 권장):

```
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/planit?serverTimezone=Asia/Seoul
spring.datasource.username=<user>
spring.datasource.password=<password>
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

spring.data.redis.host=localhost
spring.data.redis.port=6379

spring.mail.username=<gmail>
spring.mail.password=<app-password>
coolsms.api.key=<sms-key>
coolsms.api.secret=<sms-secret>

openai.api.key=<openai-key>
kcisa.key=<kcisa-key>
kakao.api.key=<js-key>
kakao.rest.key=<rest-key>

file.upload.dir=C:/planit/uploads
file.access-path=/uploads/
```

운영 환경에서는 `application-prod.yml`, OS 환경 변수, 또는 Spring Cloud Config 등을 사용해 민감 정보를 분리하세요.

---

## 실행 및 빌드

```bash
./gradlew clean bootRun        # 개발 모드
./gradlew bootJar              # 배포용 JAR (build/libs/*.jar)
./gradlew test                 # 단위 테스트
```

사전 요구 사항:
1. MySQL `planit` 데이터베이스 (DDL 자동 생성).
2. Redis 서버.
3. 외부 API 키(OpenAI, Kakao, KCISA, CoolSMS, Gmail 등).

---

## API 사용 예시 (요약)

| 엔드포인트 | 메서드 | 설명 |
| --- | --- | --- |
| `/api/auth/signup` | POST | 이메일 인증 완료 후 회원가입 |
| `/api/auth/login` | POST | 아이디/이메일 로그인, JWT 발급 |
| `/api/chat/ask-ai` | POST | AI 코스 추천 |
| `/api/festival` | GET | 축제 리스트 |
| `/api/tour/detail/user/{id}` | GET | 사용자용 여행지 상세 |
| `/api/my-course` | CRUD | 나만의 코스 관리 |
| `/api/admin/reports` | GET | 신고 목록 (ROLE_ADMIN) |

세부 스펙은 각 컨트롤러 파일을 참고하세요.

---

## 개발 메모
- `file.upload.dir` 경로는 OS에 맞게 변경하고, 웹서버(예: Nginx) 정적 매핑과 일치시켜야 합니다.
- `JwtFilter` 추가 시 `SecurityFilterChain`에서 `UsernamePasswordAuthenticationFilter` 앞에 배치했습니다.
- OpenAI/Tour API 등은 호출 한도가 있으니 `AiService`, `KcisaApiController`에 rate-limit/retry 로직을 추가하는 것이 좋습니다.
- Redis 캐시, JPA lazy 로딩 설정 등을 조정하려면 `application.properties`를 분리하여 관리하세요.

필요한 추가 문서(ERD, 상세 API 스펙 등)가 있으면 자유롭게 요청해 주세요.

