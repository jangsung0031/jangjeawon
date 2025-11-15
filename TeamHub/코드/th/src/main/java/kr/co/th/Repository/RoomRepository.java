package kr.co.th.Repository;

import kr.co.th.vo.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query("SELECT r FROM Room r WHERE r.id NOT IN (" +
            "SELECT res.room.id FROM Reservation res " +
            "WHERE :date BETWEEN FUNCTION('DATE', res.checkInTime) AND FUNCTION('DATE', res.checkOutTime)" +
            ")")
    List<Room> findAvailableRooms(@Param("date") LocalDate date);
}
