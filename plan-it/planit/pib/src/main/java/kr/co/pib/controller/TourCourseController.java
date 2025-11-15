package kr.co.pib.controller;

import kr.co.pib.entity.TourCourse;
import kr.co.pib.entity.TourCoursePlace;
import kr.co.pib.service.TourCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import kr.co.pib.dto.TourCourseResponseDTO;
import kr.co.pib.dto.TourCoursePlaceResponseDTO;

import java.util.List;

@RestController
@RequestMapping("/api/course")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost") // React 연결
public class TourCourseController {

    private final TourCourseService courseService;

    // 전체 코스 리스트
    @GetMapping("/list")
    public Page<TourCourseResponseDTO> getCourseList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return courseService.getAllCourses(page, size);
    }


    // 특정 코스 상세
    @GetMapping("/detail/{courseId}")
    public List<TourCoursePlaceResponseDTO> getCourseDetail(@PathVariable Long courseId) {
        return courseService.getCourseDetail(courseId);
    }
}
