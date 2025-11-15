package kr.co.th.Controller;

import kr.co.th.Repository.ReservationRepository;
import kr.co.th.Repository.RoomRepository;
import kr.co.th.Repository.UserRepository;
import kr.co.th.Service.PortOneService;
import kr.co.th.dto.ReservationRequestDTO;
import kr.co.th.dto.ReservationResponseDTO;
import kr.co.th.util.JwtUtil;
import kr.co.th.vo.Reservation;
import kr.co.th.vo.Room;
import kr.co.th.vo.User;
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
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/roomreservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PortOneService portOneService;

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody ReservationRequestDTO request,
                                               @RequestHeader("Authorization") String token) {
        try {
            String userid = jwtUtil.validateAndGetSubject(token.substring(7));
            User user = userRepository.findByUserid(userid)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("객실을 찾을 수 없습니다."));

            LocalDateTime checkInTime = request.getCheckInTime().withHour(15).withMinute(0);
            LocalDateTime checkOutTime = request.getCheckOutTime().withHour(11).withMinute(0);

            Reservation reservation = Reservation.builder()
                    .room(room)
                    .roomName(room.getName())
                    .user(user)
                    .userId(user.getId())
                    .username(request.getUsername())
                    .checkInTime(checkInTime)
                    .checkOutTime(checkOutTime)
                    .status("예약완료")
                    .impUid(request.getImpUid())
                    .paidAmount(request.getPaidAmount())
                    .nights(request.getNights())
                    .adults(request.getAdults())
                    .children(request.getChildren())
                    .infants(request.getInfants())
                    .build();

            Reservation saved = reservationRepository.save(reservation);

            portOneService.requestPayment(request.getPaymentInfo());

            return ResponseEntity.ok(ReservationResponseDTO.fromEntity(saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("예약 실패: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponseDTO>> getReservations(@RequestHeader("Authorization") String token) {
        String userid = jwtUtil.validateAndGetSubject(token.substring(7));
        User user = userRepository.findByUserid(userid)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Reservation> reservations = reservationRepository.findByUserIdOrderByCheckInTimeDesc(user.getId());
        List<ReservationResponseDTO> response = reservations.stream()
                .map(ReservationResponseDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReservation(@PathVariable Long id,
                                            @RequestHeader("Authorization") String token) {
        String userid = jwtUtil.validateAndGetSubject(token.substring(7));
        userRepository.findByUserid(userid)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));

        return ResponseEntity.ok(ReservationResponseDTO.fromEntity(reservation));
    }

    @GetMapping("/soldout")
    public ResponseEntity<List<Long>> getSoldOutRooms(
            @RequestParam("checkIn") String checkIn,
            @RequestParam("checkOut") String checkOut) {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        LocalDateTime checkInTime = LocalDateTime.parse(checkIn, formatter).withHour(15).withMinute(0);
        LocalDateTime checkOutTime = LocalDateTime.parse(checkOut, formatter).withHour(11).withMinute(0);

        List<Long> soldOutRoomIds = reservationRepository.findSoldOutRoomIds(checkInTime, checkOutTime);
        return ResponseEntity.ok(soldOutRoomIds);
    }

    @PostMapping("/{id}/cancel/confirm")
    public ResponseEntity<?> confirmCancel(@PathVariable Long id) {
        try {
            Optional<Reservation> optional = reservationRepository.findById(id);
            if (optional.isEmpty()) return ResponseEntity.notFound().build();

            Reservation reservation = optional.get();
            if ("취소완료".equals(reservation.getStatus())) {
                return ResponseEntity.badRequest().body("이미 취소된 예약입니다.");
            }

            String impUid = reservation.getImpUid();
            if (impUid == null || impUid.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("결제 정보가 없습니다.");
            }

            LocalDate now = LocalDate.now();
            LocalDate checkInDate = reservation.getCheckInTime().toLocalDate();
            long daysBefore = ChronoUnit.DAYS.between(now, checkInDate);

            if (daysBefore >= 3) {
                boolean success = portOneService.cancelPayment(impUid);
                if (!success) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("결제 취소 실패");
                }

                reservation.setStatus("취소완료");
                reservationRepository.save(reservation);

                return ResponseEntity.ok("결제 전액 취소 완료");
            } else {
                return ResponseEntity.badRequest().body("체크인 2일 이내는 환불이 불가능합니다.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("취소 처리 실패: " + e.getMessage());
        }
    }

    private Long extractUserId(String header) {
        if (header == null || !header.startsWith("Bearer ")) {
            throw new IllegalArgumentException("유효하지 않은 토큰");
        }

        String token = header.substring(7);
        String userUid = jwtUtil.validateAndGetSubject(token);
        User user = userRepository.findByUserid(userUid)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        return user.getId();
    }

    @GetMapping("/room-reservation/admin/all")
    public ResponseEntity<?> getAllRoomReservations() {
        List<Reservation> reservations = reservationRepository.findAll(); // 또는 정렬 추가
        List<ReservationResponseDTO> result = reservations.stream()
                .map(ReservationResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/room-reservation/admin/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        try {
            Optional<Reservation> optional = reservationRepository.findById(id);
            if (optional.isEmpty()) return ResponseEntity.notFound().build();

            Reservation reservation = optional.get();

            if ("취소완료".equals(reservation.getStatus())) {
                return ResponseEntity.badRequest().body("이미 취소된 예약입니다.");
            }

            if (reservation.getPaidAmount() == 0) {
                reservation.setStatus("취소완료");
                reservationRepository.save(reservation);
                return ResponseEntity.ok("결제 없는 예약이므로 바로 취소 완료 처리되었습니다.");
            }

            boolean result = portOneService.cancelPayment(reservation.getImpUid());
            if (!result) {
                return ResponseEntity.ok("결제 취소 실패. 수동 처리 필요.");
            }

            reservation.setStatus("취소완료");
            reservationRepository.save(reservation);
            return ResponseEntity.ok("결제 취소 및 예약 상태 변경 완료");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("예약 취소 처리 중 오류: " + e.getMessage());
        }
    }

    @GetMapping("/room-reservation/admin/paged")
    public ResponseEntity<?> getPagedRoomReservations(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("checkInTime").descending());

        Page<Reservation> reservationPage = reservationRepository.findByFilters(
                search.isBlank() ? null : search,
                status == null || status.isBlank() ? null : status,
                date,
                pageable
        );

        Page<ReservationResponseDTO> dtoPage = reservationPage.map(ReservationResponseDTO::fromEntity);

        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/review-target/{id}")
    public ResponseEntity<?> getReservationForReview(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token
    ) {
        try {
            String userid = jwtUtil.validateAndGetSubject(token.substring(7));
            userRepository.findByUserid(userid)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            Reservation reservation = reservationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));

            Map<String, Object> result = new HashMap<>();
            result.put("id", reservation.getId());
            result.put("userId", reservation.getUser().getId());
            result.put("category", "room");
            result.put("roomName", reservation.getRoomName());
            result.put("imageUrl", reservation.getRoom() != null ? reservation.getRoom().getImageUrl() : null);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

}
