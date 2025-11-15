package kr.co.th.Controller;

import kr.co.th.Repository.RoomRepository;
import kr.co.th.vo.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomRepository roomRepository;

    @GetMapping
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @GetMapping("/available")
    public List<Room> getAvailableRooms(@RequestParam String date) {
        LocalDate selectedDate = LocalDate.parse(date);
        return roomRepository.findAvailableRooms(selectedDate);
    }

}
