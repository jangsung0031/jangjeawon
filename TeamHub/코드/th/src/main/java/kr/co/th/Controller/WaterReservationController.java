package kr.co.th.Controller;

import kr.co.th.Repository.WaterRepository;
import kr.co.th.Service.PortOneService;
import kr.co.th.Service.WaterReservationService;
import kr.co.th.dto.ReservationDTO;
import kr.co.th.dto.WaterReservationDTO;
import kr.co.th.util.JwtUtil;
import kr.co.th.vo.User;
import kr.co.th.vo.WaterReservation;
import kr.co.th.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservation")
@RequiredArgsConstructor
public class WaterReservationController {

    private final WaterRepository reservationRepository;
    private final UserRepository userRepository;
    private final PortOneService portOneService;
    private final JwtUtil jwtUtil;
    private final WaterReservationService reservationService;

    @PostMapping
    public ResponseEntity<?> saveReservation(@RequestBody ReservationDTO req) {
        System.out.println(">>> 받은 요청: " + req);

        if (req.getUserId() == null) {
            return ResponseEntity.badRequest().body("❌ userId가 null입니다.");
        }
        Optional<User> user = userRepository.findById(req.getUserId());
        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body("존재하지 않는 사용자입니다.");
        }

        int actualPaid;
        try {
            actualPaid = portOneService.getPaidAmount(req.getImp_uid());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("결제 정보 확인 실패: " + e.getMessage());
        }

        if (actualPaid != req.getPaid_amount()) {
            return ResponseEntity.badRequest().body("❌ 결제 금액이 일치하지 않습니다.");
        }

        LocalDate parsedDate;
        try {
            parsedDate = LocalDate.parse(req.getReservationDate());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("날짜 형식 오류");
        }

        WaterReservation reservation = WaterReservation.builder()
                .reservationDate(parsedDate)
                .peopleCount(req.getPeopleCount())
                .ticketType(req.getTicketType())
                .status("예약완료")
                .impUid(req.getImp_uid())
                .amount(req.getPaid_amount())
                .user(user.get())
                .build();

        return ResponseEntity.ok(reservationRepository.save(reservation));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getReservationsByUser(@PathVariable Long userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("존재하지 않는 사용자입니다.");
        }
        return ResponseEntity.ok(reservationRepository.findByUser(optionalUser.get()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReservation(@PathVariable Long id) {
        if (!reservationRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("예약이 존재하지 않습니다.");
        }
        reservationRepository.deleteById(id);
        return ResponseEntity.ok("예약이 취소되었습니다.");
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllReservationsForAdmin() {
        List<WaterReservationDTO> dtoList = reservationRepository.findAll().stream()
                .map(r -> WaterReservationDTO.builder()
                        .id(r.getId())
                        .reservationDate(r.getReservationDate().toString())
                        .peopleCount(r.getPeopleCount())
                        .ticketType(r.getTicketType())
                        .status(r.getStatus())
                        .username(r.getUser().getUsername())
                        .tel(r.getUser().getTel())
                        .amount(r.getAmount())
                        .build())
                .toList();

        return ResponseEntity.ok(dtoList);
    }

    @PostMapping("/admin/reservations/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        Optional<WaterReservation> optional = reservationRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "예약 없음"));
        }

        WaterReservation reservation = optional.get();

        if ("취소 완료".equals(reservation.getStatus())) {
            return ResponseEntity.ok(Map.of("success", true, "message", "이미 취소된 예약입니다."));
        }

        if (reservation.getAmount() == 0) {
            System.out.println("💡 amount가 0원이므로 포트원 취소 생략");
            reservation.setStatus("취소 완료");
            reservationRepository.save(reservation);
            return ResponseEntity.ok(Map.of("success", true, "message", "결제 없이 예약만 취소 처리됨"));
        }

        boolean result = portOneService.cancelPayment(reservation.getImpUid());
        if (!result) {
            return ResponseEntity.ok(Map.of("success", false, "message", "결제 취소 실패"));
        }

        reservation.setStatus("취소 완료");
        reservationRepository.save(reservation);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyReservations(@RequestHeader("Authorization") String token) {
        try {
            System.out.println(">>> 받은 토큰: " + token);
            String userId = jwtUtil.validateAndGetSubject(token.replace("Bearer ", ""));
            System.out.println(">>> 파싱된 유저 ID: " + userId);

            User user = userRepository.findByUserid(userId).orElseThrow(() -> new RuntimeException("DB에 유저 없음"));
            System.out.println(">>> 유저 객체 조회 성공: " + user.getUsername());

            List<WaterReservationDTO> list = reservationService.getReservationsByUser(user);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace(); // ★ 꼭 추가
            return ResponseEntity.status(401).body("인증 실패 또는 유저 없음");
        }
    }

    @PostMapping("/water-reservation/{id}/cancel/confirm")
    public ResponseEntity<?> cancelWaterReservation(@PathVariable Long id) {
        try {
            Optional<WaterReservation> optional = reservationRepository.findById(id);
            if (optional.isEmpty()) return ResponseEntity.notFound().build();

            WaterReservation reservation = optional.get();

            if ("취소 완료".equals(reservation.getStatus())) {
                return ResponseEntity.badRequest().body("이미 취소된 예약입니다.");
            }

            String impUid = reservation.getImpUid();
            if (impUid == null || impUid.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("결제 정보가 없습니다.");
            }

            int paidAmount = reservation.getAmount();
            LocalDate today = LocalDate.now();
            LocalDate reservationDate = reservation.getReservationDate();

            long daysBefore = ChronoUnit.DAYS.between(today, reservationDate);

            System.out.println("✅ 체크인까지 남은 일수: " + daysBefore);

            if (daysBefore >= 3) {
                boolean success = portOneService.cancelPayment(impUid);
                if (!success) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("결제 취소 실패");
                }

                reservation.setStatus("취소 완료");
                reservationRepository.save(reservation);

                return ResponseEntity.ok("전액 환불 완료");
            } else {
                return ResponseEntity.badRequest().body("3일 이내 또는 당일 예약은 환불이 불가능합니다.");
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("취소 처리 실패: " + e.getMessage());
        }
    }

    @GetMapping("/admin/paged")
    public ResponseEntity<?> getPagedReservations(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("reservationDate").descending());
        Page<WaterReservation> pageResult = reservationRepository.findByFilters(
                search.isBlank() ? null : search,
                status == null || status.isBlank() ? null : status,
                date,
                pageable
        );

        Page<WaterReservationDTO> dtoPage = pageResult.map(r ->
                WaterReservationDTO.builder()
                        .id(r.getId())
                        .reservationDate(r.getReservationDate().toString())
                        .peopleCount(r.getPeopleCount())
                        .ticketType(r.getTicketType())
                        .status(r.getStatus())
                        .username(r.getUser().getUsername())
                        .tel(r.getUser().getTel())
                        .amount(r.getAmount())
                        .build()
        );

        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/water-reservation/{id}")
    public ResponseEntity<?> getWaterReservationById(@PathVariable Long id) {
        return reservationRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> {
                    Map<String,String> error = new HashMap<>();
                    error.put("message","예약 정보를 찾을 수 없습니다.");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
                });
    }

}
