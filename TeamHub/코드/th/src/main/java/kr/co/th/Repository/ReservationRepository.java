package kr.co.th.Repository;

import kr.co.th.vo.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserIdOrderByCheckInTimeDesc(Long userId);

    @Query("SELECT DISTINCT r.room.id FROM Reservation r " +
            "WHERE r.status = '예약완료' " +
            "AND r.checkInTime < :checkOut " +
            "AND r.checkOutTime > :checkIn " +
            "AND NOT (r.checkOutTime = :checkIn)")
    List<Long> findSoldOutRoomIds(@Param("checkIn") LocalDateTime checkIn,
                                  @Param("checkOut") LocalDateTime checkOut);

    @Query("""
    SELECT r FROM Reservation r
    WHERE (:search IS NULL OR r.username LIKE %:search%)
      AND (:status IS NULL OR r.status = :status)
      AND (:date IS NULL OR DATE(r.checkInTime) = :date)
""")
    Page<Reservation> findByFilters(
            @Param("search") String search,
            @Param("status") String status,
            @Param("date") LocalDate date,
            Pageable pageable
    );
}
