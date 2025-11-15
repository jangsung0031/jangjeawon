package kr.co.pib.service;

import kr.co.pib.dto.NewRatingReq;
import kr.co.pib.dto.RatingSummaryDto;
import kr.co.pib.entity.CourseRating;
import kr.co.pib.repository.CourseRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CourseRatingService {

    private final CourseRatingRepository ratingRepo;

    @Transactional
    public void upsert(Long courseId, Long userId, NewRatingReq req) {
        int score = req.getScore();
        if (score < 1 || score > 5) throw new IllegalArgumentException("점수는 1~5 사이여야 합니다.");

        CourseRating r = ratingRepo.findByCourseIdAndUserId(courseId, userId).orElse(null);
        if (r == null) {
            r = CourseRating.builder()
                    .courseId(courseId)
                    .userId(userId)
                    .score(score)
                    .build();
            ratingRepo.save(r);
        } else {
            r.setScore(score);
            r.setUpdatedAt(LocalDateTime.now());
        }
    }

    @Transactional(readOnly = true)
    public RatingSummaryDto summary(Long courseId, Long maybeUserId) {
        Double avg = ratingRepo.findAvgByCourseId(courseId);
        Long cnt = ratingRepo.countByCourseId(courseId);
        int my = 0;
        if (maybeUserId != null) {
            my = ratingRepo.findByCourseIdAndUserId(courseId, maybeUserId).map(CourseRating::getScore).orElse(0);
        }

        RatingSummaryDto dto = new RatingSummaryDto();
        dto.setAvg(avg == null ? 0.0 : round2(avg));
        dto.setCount(cnt == null ? 0L : cnt);
        dto.setMy(my);
        return dto;
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
