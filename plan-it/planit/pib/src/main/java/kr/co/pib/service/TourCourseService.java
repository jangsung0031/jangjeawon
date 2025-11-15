package kr.co.pib.service;

import kr.co.pib.dto.TourCoursePlaceResponseDTO;
import kr.co.pib.dto.TourCourseResponseDTO;
import kr.co.pib.entity.TourCourse;
import kr.co.pib.entity.TourCoursePlace;
import kr.co.pib.repository.CourseCommentRepository;
import kr.co.pib.repository.CourseRatingRepository;
import kr.co.pib.repository.TourCoursePlaceRepository;
import kr.co.pib.repository.TourCourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourCourseService {

    private final TourCourseRepository courseRepo;
    private final TourCoursePlaceRepository placeRepo;

    // ✅ 집계용 레포 추가
    private final CourseRatingRepository ratingRepo;
    private final CourseCommentRepository commentRepo;

    // ✅ 페이징된 전체 코스 리스트 (평균별점/개수, 댓글수 포함)
    public Page<TourCourseResponseDTO> getAllCourses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<TourCourse> p = courseRepo.findAll(pageable);

        List<TourCourse> courses = p.getContent();
        if (courses.isEmpty()) {
            return p.map(TourCourseResponseDTO::fromEntity); // 빈 페이지면 그대로 반환
        }

        // 코스 ID 목록
        List<Long> ids = courses.stream().map(TourCourse::getId).toList();

        // ✅ 별점/댓글 집계 조회
        Map<Long, CourseRatingRepository.RatingAgg> ratingMap =
                ratingRepo.findAggByCourseIds(ids).stream()
                        .collect(Collectors.toMap(CourseRatingRepository.RatingAgg::getCourseId, x -> x));
        Map<Long, CourseCommentRepository.CommentAgg> commentMap =
                commentRepo.findAggByCourseIds(ids).stream()
                        .collect(Collectors.toMap(CourseCommentRepository.CommentAgg::getCourseId, x -> x));

        // ✅ 총 일수 계산 (MAX(day))
        Map<Long, Integer> daysMap = new HashMap<>();
        for (Long id : ids) {
            Integer maxDay = placeRepo.findMaxDayByCourseId(id);
            daysMap.put(id, (maxDay == null || maxDay < 1) ? 1 : maxDay);
        }

        // ✅ 썸네일(첫 장소 이미지)
        Map<Long, String> thumbMap = new HashMap<>();
        for (Long id : ids) {
            TourCoursePlace first = placeRepo.findFirstByCourseIdOrderByDayAscIdAsc(id).orElse(null);
            if (first != null) thumbMap.put(id, first.getImageUrl());
        }

        // 매핑
        return p.map(c -> {
            TourCourseResponseDTO dto = TourCourseResponseDTO.fromEntity(c);

            // 썸네일/일수
            dto.setThumbnail(thumbMap.get(c.getId()));
            dto.setDays(daysMap.getOrDefault(c.getId(), 1));

            // 집계
            CourseRatingRepository.RatingAgg r = ratingMap.get(c.getId());
            CourseCommentRepository.CommentAgg cm = commentMap.get(c.getId());

            double avg = (r == null || r.getAvg() == null) ? 0.0 : r.getAvg();
            dto.setAvg(Math.round(avg * 100.0) / 100.0);
            dto.setRatingCount((r == null || r.getCnt() == null) ? 0L : r.getCnt());
            dto.setCommentCount((cm == null || cm.getCnt() == null) ? 0L : cm.getCnt());

            return dto;
        });
    }

    // 특정 코스 상세
    public List<TourCoursePlaceResponseDTO> getCourseDetail(Long courseId) {
        return placeRepo.findByCourseId(courseId).stream()
                .map(TourCoursePlaceResponseDTO::fromEntity)
                .toList();
    }
}
