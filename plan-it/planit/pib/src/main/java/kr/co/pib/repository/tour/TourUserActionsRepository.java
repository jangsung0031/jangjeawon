package kr.co.pib.repository.tour;

import kr.co.pib.entity.tour.TourUserActions;
import kr.co.pib.entity.tour.TourUserActionsId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TourUserActionsRepository extends JpaRepository<TourUserActions, TourUserActionsId> {
    long countById_UserIdAndFavoritedIsTrue(long userId);
    long countById_UserIdAndLikedIsTrue(long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM TourUserActions a WHERE a.user.uid = :userUid")
    void deleteByUserUid(@Param("userUid") Long userUid);
}