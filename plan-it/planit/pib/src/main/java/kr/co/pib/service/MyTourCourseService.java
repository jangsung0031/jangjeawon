package kr.co.pib.service;

import kr.co.pib.dto.TourCourseDetailDTO;
import kr.co.pib.dto.TourCourseRequest;
import kr.co.pib.dto.TourCourseResponseDTO;
import kr.co.pib.entity.TourCourse;
import kr.co.pib.entity.TourCoursePlace;
import kr.co.pib.repository.CourseCommentRepository;
import kr.co.pib.repository.CourseRatingRepository;
import kr.co.pib.repository.TourCourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyTourCourseService {

    private final TourCourseRepository courseRepo;
    private final CourseRatingRepository ratingRepo;
    private final CourseCommentRepository commentRepo;

    @Transactional(readOnly = true)
    public List<TourCourseResponseDTO> getCoursesByUserId(Long userId) {
        List<TourCourse> courses = courseRepo.findByUserIdWithPlaces(userId);
        if (courses.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> courseIds = courses.stream().map(TourCourse::getId).toList();

        Map<Long, CourseRatingRepository.RatingAgg> ratingMap = ratingRepo.findAggByCourseIds(courseIds).stream()
                .collect(Collectors.toMap(CourseRatingRepository.RatingAgg::getCourseId, agg -> agg));
        Map<Long, CourseCommentRepository.CommentAgg> commentMap = commentRepo.findAggByCourseIds(courseIds).stream()
                .collect(Collectors.toMap(CourseCommentRepository.CommentAgg::getCourseId, agg -> agg));

        return courses.stream().map(course -> {
            TourCourseResponseDTO dto = TourCourseResponseDTO.fromEntity(course);
            if (course.getPlaces() != null && !course.getPlaces().isEmpty()) {
                dto.setThumbnail(course.getPlaces().get(0).getImageUrl());
                dto.setDays(course.getPlaces().stream().mapToInt(TourCoursePlace::getDay).max().orElse(0));
            }
            CourseRatingRepository.RatingAgg r = ratingMap.get(course.getId());
            CourseCommentRepository.CommentAgg c = commentMap.get(course.getId());
            dto.setAvg(r != null && r.getAvg() != null ? (Math.round(r.getAvg() * 10.0) / 10.0) : 0.0);
            dto.setRatingCount(r != null ? r.getCnt() : 0L);
            dto.setCommentCount(c != null ? c.getCnt() : 0L);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteCourse(Long courseId, Long userId) {
        TourCourse course = courseRepo.findByIdAndUserId(courseId, userId)
                .orElseThrow(() -> new AccessDeniedException("삭제 권한이 없거나 존재하지 않는 코스입니다."));
        ratingRepo.deleteByCourseId(courseId);
        commentRepo.deleteByCourseId(courseId);
        courseRepo.delete(course);
    }

    @Transactional(readOnly = true)
    public TourCourseDetailDTO getCourseForEdit(Long courseId, Long userId) {
        TourCourse course = courseRepo.findByIdAndUserId(courseId, userId)
                .orElseThrow(() -> new AccessDeniedException("조회 권한이 없거나 존재하지 않는 코스입니다."));
        return TourCourseDetailDTO.fromEntity(course);
    }

    @Transactional
    public void updateCourse(Long courseId, Long userId, TourCourseRequest request) {
        TourCourse course = courseRepo.findByIdAndUserId(courseId, userId)
                .orElseThrow(() -> new AccessDeniedException("수정 권한이 없거나 존재하지 않는 코스입니다."));

        course.setCourseTitle(request.getCourseTitle());
        course.setCourseDesc(request.getCourseDesc());
        course.getPlaces().clear();

        List<TourCoursePlace> newPlaces = request.getPlaces().stream().map(p ->
                TourCoursePlace.builder()
                        .day(p.getDay()).title(p.getTitle()).addr(p.getAddr())
                        .imageUrl(p.getImageUrl()).contentId(p.getContentId())
                        .mapx(p.getMapx()).mapy(p.getMapy()).course(course)
                        .build()
        ).collect(Collectors.toList());
        course.getPlaces().addAll(newPlaces);
    }
}