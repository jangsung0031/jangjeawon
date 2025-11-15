package kr.co.pib.controller;

import kr.co.pib.dto.TourCourseDetailDTO;
import kr.co.pib.dto.TourCourseRequest;
import kr.co.pib.dto.TourCourseResponseDTO;
import kr.co.pib.entity.TourCourse;
import kr.co.pib.entity.TourCoursePlace;
import kr.co.pib.entity.User;
import kr.co.pib.repository.TourCourseRepository;
import kr.co.pib.repository.UserRepository;
import kr.co.pib.service.MyTourCourseService;
import kr.co.pib.service.TourCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/my-tour-courses")
@RequiredArgsConstructor
public class MyTourCourseController {

    private final MyTourCourseService myTourCourseService;
    private final TourCourseRepository courseRepo;
    private final UserRepository userRepo;

    @PostMapping
    public ResponseEntity<?> saveMyCourse(@RequestBody TourCourseRequest request,
                                          @AuthenticationPrincipal String userIdString) {
        User user = userRepo.findById(userIdString).orElseThrow(() -> new AccessDeniedException("사용자를 찾을 수 없습니다."));
        Long userUid = user.getUid();

        TourCourse course = TourCourse.builder()
                .userId(userUid)
                .courseTitle(request.getCourseTitle())
                .courseDesc(request.getCourseDesc())
                .build();

        List<TourCoursePlace> places = request.getPlaces().stream().map(p ->
                TourCoursePlace.builder()
                        .day(p.getDay()).title(p.getTitle()).addr(p.getAddr())
                        .imageUrl(p.getImageUrl()).contentId(p.getContentId())
                        .mapx(p.getMapx()).mapy(p.getMapy()).course(course)
                        .build()
        ).toList();

        course.setPlaces(places);
        TourCourse saved = courseRepo.save(course);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<TourCourseResponseDTO>> getMyCourses(
            @AuthenticationPrincipal String userIdString) {
        User user = userRepo.findById(userIdString).orElseThrow(() -> new AccessDeniedException("사용자를 찾을 수 없습니다."));
        Long userUid = user.getUid();
        List<TourCourseResponseDTO> result = myTourCourseService.getCoursesByUserId(userUid);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<TourCourseDetailDTO> getMyCourseForEdit(@PathVariable Long courseId,
                                                                  @AuthenticationPrincipal String userIdString) {
        User user = userRepo.findById(userIdString).orElseThrow(() -> new AccessDeniedException("사용자를 찾을 수 없습니다."));
        Long userUid = user.getUid();
        TourCourseDetailDTO dto = myTourCourseService.getCourseForEdit(courseId, userUid);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<Void> updateMyCourse(@PathVariable Long courseId,
                                               @AuthenticationPrincipal String userIdString,
                                               @RequestBody TourCourseRequest request) {
        User user = userRepo.findById(userIdString).orElseThrow(() -> new AccessDeniedException("사용자를 찾을 수 없습니다."));
        Long userUid = user.getUid();
        myTourCourseService.updateCourse(courseId, userUid, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteMyCourse(@PathVariable Long courseId,
                                               @AuthenticationPrincipal String userIdString) {
        User user = userRepo.findById(userIdString).orElseThrow(() -> new AccessDeniedException("사용자를 찾을 수 없습니다."));
        Long userUid = user.getUid();
        myTourCourseService.deleteCourse(courseId, userUid);
        return ResponseEntity.ok().build();
    }
}