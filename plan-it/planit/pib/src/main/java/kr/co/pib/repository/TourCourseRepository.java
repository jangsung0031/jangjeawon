package kr.co.pib.repository;

import kr.co.pib.entity.TourCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TourCourseRepository extends JpaRepository<TourCourse, Long> {
    List<TourCourse> findByUserId(Long userId);
    @Query("select c.courseTitle from TourCourse c where c.id = :id")
    Optional<String> findTitleById(Long id);

    // 코스 ID와 사용자 ID로 코스를 조회하는 메소드 (소유권 확인용)
    Optional<TourCourse> findByIdAndUserId(Long id, Long userId);

    // '내 코스' 목록 조회를 위해 관련된 장소(places)까지 한 번에 가져오는 최종 메소드
    @Query("select c from TourCourse c left join fetch c.places where c.userId = :userId order by c.id desc")
    List<TourCourse> findByUserIdWithPlaces(@Param("userId") Long userId);

    @Query("select c.id from TourCourse c where c.userId = :uid")
    List<Long> findIdsByAuthorUid(@Param("uid") Long uid);

    // ✅ 회원 탈퇴 시 사용: 내가 만든 코스 전부 삭제
    @Modifying
    @Query("delete from TourCourse c where c.userId = :uid")
    void deleteByAuthorUid(@Param("uid") Long uid);
}
