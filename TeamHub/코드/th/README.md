# TeamHub 백엔드

## 소개
TeamHub 백엔드는 리조트객실·워터레저 예약, 커뮤니티(공지/FAQ/Q&A)와 리뷰, 관리자 도구를 제공하는 Spring Boot 기반 REST API입니다. JWT 인증, PortOne 결제 연동, 이메일·SMS 알림, 파일 업로드 등 서비스 운영에 필요한 기능을 포함합니다.

## 기술 스택
- Java 17, Spring Boot 3.5
- Spring Data JPA, MySQL 8
- Spring Security + JWT
- WebSocket, Spring Mail, Nurigo SMS, PortOne API
- Gradle, Lombok

## 모듈 개요
| 모듈 | 설명 |
| --- | --- |
| `UserController`, `JwtUtil` | 회원 가입/로그인, 비밀번호 재설정, JWT 토큰 발급 및 검증 |
| `ReservationController`, `RoomController` | 객실 정보 조회, 예약 생성/취소, 예약 현황 조회 |
| `WaterReservationController` | 워터레저 상품 예약 및 관리 |
| `ReviewController`, `AdminReviewController` | 이용 후기 CRUD, 관리자 검수 |
| `NoticeController`, `FaqController`, `QnAController` | 공지/FAQ/Q&A 게시판 및 답변 관리 |
| `ChatController` | 실시간 상담/채팅 |
| `EmailService`, `SmsService`, `PortOneService` | 알림 메일/문자 발송, 결제 생성·취소 |

## 개발 환경 구성
1. **필수 도구**
   - JDK 17
   - MySQL 8 (스키마명 `th`)
   - Gradle Wrapper (동봉)
2. **환경 설정**
   - `src/main/resources/application.properties`를 `.env` 또는 별도 profile로 분리하여 민감정보(`spring.datasource.*`, `jwt.secret`, `portone.api.*`, `openai.api.key` 등)를 관리하세요.
   - `custom.upload-path`에는 객실/레저 이미지가 저장될 로컬 경로를 지정합니다.
   - 초기 데이터가 필요하면 `data.sql`을 확인하고 수정합니다.
3. **DB 준비**
   ```sql
   CREATE DATABASE th DEFAULT CHARACTER SET utf8mb4;
   ```
4. **실행**
   ```bash
   cd th
   ./gradlew bootRun
   ```
   Windows PowerShell에서는 `.\gradlew.bat bootRun`을 사용합니다.
5. **테스트**
   ```bash
   ./gradlew test
   ```

## 빌드 아티팩트
- `build/libs/th-0.0.1-SNAPSHOT.jar`
- `build/reports` : 테스트 및 정적 분석 결과

## API 요약
| 구분 | 엔드포인트 | 설명 |
| --- | --- | --- |
| 회원 | `POST /api/users`, `POST /api/users/login` | 회원 가입/로그인 |
| 인증 | `GET /api/users/userinfo` | JWT 기반 회원 정보 조회 |
| 객실 예약 | `POST /api/roomreservations` | 객실 예약 생성 및 결제 요청 |
| 객실 예약 | `GET /api/roomreservations` | 내 예약 목록 |
| 객실 예약 | `POST /api/roomreservations/{id}/cancel/confirm` | 환불 가능 시 결제 취소 |
| 워터레저 | `GET/POST /api/water-reservations` | 워터레저 예약 관리 |
| 리뷰 | `GET/POST /api/reviews` | 후기 작성/조회 |
| 커뮤니티 | `/api/notices`, `/api/faqs`, `/api/qna` | 공지·FAQ·Q&A CRUD |

> 스키마 및 추가 엔드포인트는 Controller 소스를 참고하세요.

## 운영 팁
- `spring.jpa.hibernate.ddl-auto=update` 설정은 개발용입니다. 운영에서는 명시적 마이그레이션 툴을 사용하세요.
- JWT 만료 시간(`jwt.accessTokenExpirationTime`, `jwt.refreshTokenExpirationTime`)을 트래픽 특성에 맞게 조정하세요.
- PortOne, Gmail, Nurigo API 키는 환경 변수나 Secret Manager로 관리하여 커밋되지 않도록 합니다.

