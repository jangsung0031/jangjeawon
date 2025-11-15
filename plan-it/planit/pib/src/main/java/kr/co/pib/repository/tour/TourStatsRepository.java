package kr.co.pib.repository.tour;

import jakarta.persistence.LockModeType;
import kr.co.pib.entity.tour.TourStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TourStatsRepository extends JpaRepository<TourStats, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ts FROM TourStats ts WHERE ts.id = :id")
    Optional<TourStats> findByIdWithLock(@Param("id") String id);
}