package kr.co.pib.controller;

import kr.co.pib.dto.MyTourCourseRequestDTO;
import kr.co.pib.dto.MyTourCourseResponseDTO;
import kr.co.pib.dto.TourCourseRequest;
import kr.co.pib.entity.MyTourCourse;
import kr.co.pib.entity.TourCourse;
import kr.co.pib.entity.TourCoursePlace;
import kr.co.pib.repository.MyTourCourseRepository;
import kr.co.pib.repository.TourCoursePlaceRepository;
import kr.co.pib.repository.TourCourseRepository;
import kr.co.pib.repository.UserRepository;
import kr.co.pib.util.JwtUtil;
import kr.co.pib.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// 생략 가능 DTO/Entity/Repository import
@RestController
@RequestMapping("/api/my-course")
@RequiredArgsConstructor
public class MyCourseController {

    private final MyTourCourseRepository myTourRepo;
    private final TourCourseRepository courseRepo;
    private final TourCoursePlaceRepository placeRepo;
    private final JwtUtil jwtUtil;
    private final UserRepository usersRepository;

    @PostMapping
    public ResponseEntity<?> saveMyTourPlace(@RequestBody MyTourCourseRequestDTO dto,
                                             @RequestHeader("Authorization") String tokenHeader) {

        Long userId = extractUserIdFromToken(tokenHeader);

        if (myTourRepo.existsByUserIdAndContentId(userId, dto.getContentId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("⚠️ 이미 등록한 여행지입니다.");
        }

        MyTourCourse course = MyTourCourse.builder()
                .userId(userId)
                .title(dto.getTitle())
                .addr(dto.getAddr())
                .imageUrl(dto.getImageUrl())
                .contentId(dto.getContentId())
                .mapx(dto.getMapx())
                .mapy(dto.getMapy())
                .regDate(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(myTourRepo.save(course));
    }

    @GetMapping
    public ResponseEntity<List<MyTourCourseResponseDTO>> getMyTourPlaces(
            @RequestHeader("Authorization") String tokenHeader) {

        Long userId = extractUserIdFromToken(tokenHeader);

        List<MyTourCourse> list = myTourRepo.findByUserId(userId);
        List<MyTourCourseResponseDTO> result = list.stream()
                .map(c -> new MyTourCourseResponseDTO(c.getId(), c.getTitle(), c.getAddr(), c.getImageUrl()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMyTourPlace(@PathVariable Long id,
                                               @RequestHeader("Authorization") String tokenHeader) {
        Long userId = extractUserIdFromToken(tokenHeader);

        Optional<MyTourCourse> course = myTourRepo.findByIdAndUserId(id, userId);
        if (course.isPresent()) {
            myTourRepo.deleteById(id);
            return ResponseEntity.ok("✅ 삭제 완료");
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("삭제 권한 없음 또는 존재하지 않음");
        }
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveCourse(@RequestBody TourCourseRequest request,
                                        @RequestHeader("Authorization") String tokenHeader) {

        Long userId = extractUserIdFromToken(tokenHeader);

        TourCourse course = TourCourse.builder()
                .userId(userId)
                .courseTitle(request.getCourseTitle())
                .courseDesc(request.getCourseDesc())
                .build();

        List<TourCoursePlace> places = request.getPlaces().stream().map(p ->
                TourCoursePlace.builder()
                        .day(p.getDay())
                        .title(p.getTitle())
                        .addr(p.getAddr())
                        .imageUrl(p.getImageUrl())
                        .contentId(p.getContentId())
                        .mapx(p.getMapx())
                        .mapy(p.getMapy())
                        .course(course)
                        .build()
        ).toList();

        course.setPlaces(places);
        TourCourse saved = courseRepo.save(course);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/list")
    public ResponseEntity<?> getCourses(@RequestHeader("Authorization") String tokenHeader) {
        Long userId = extractUserIdFromToken(tokenHeader);
        return ResponseEntity.ok(courseRepo.findByUserId(userId));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id,
                                          @RequestHeader("Authorization") String tokenHeader) {
        Long userId = extractUserIdFromToken(tokenHeader);
        // 필요하면 소유권 체크 로직 추가
        courseRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ✅ 여기만 “진짜로” 수정: subject(로그인아이디) → uid 매핑
    private Long extractUserIdFromToken(String tokenHeader) {
        if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
            throw new RuntimeException("UNAUTHORIZED");
        }
        String token = tokenHeader.substring(7);

        // JwtUtil은 subject로 로그인아이디를 넣고 있으므로 그 값을 꺼낸다.
        String loginId = jwtUtil.validateTokenAndGetUserId(token); // subject = 로그인아이디

        return usersRepository.findById(loginId)   // 로그인아이디로 사용자 조회 (네가 쓰는 메서드 그대로)
                .map(User::getUid)                 // uid(PK)를 꺼내 user_id로 사용
                .orElseThrow(() -> new RuntimeException("UNAUTHORIZED"));
    }
}

