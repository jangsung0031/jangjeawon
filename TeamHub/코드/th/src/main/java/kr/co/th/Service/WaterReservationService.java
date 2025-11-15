package kr.co.th.Service;

import kr.co.th.Repository.WaterRepository;
import kr.co.th.dto.WaterReservationDTO;
import kr.co.th.vo.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaterReservationService {

    private final WaterRepository waterRepository;

    public List<WaterReservationDTO> getReservationsByUser(User user) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        return waterRepository.findByUser(user)
                .stream()
                .map(r -> WaterReservationDTO.builder()
                        .id(r.getId())
                        .reservationDate(r.getReservationDate().format(formatter))
                        .peopleCount(r.getPeopleCount())
                        .ticketType(r.getTicketType())
                        .status(r.getStatus())
                        .username(user.getUsername())
                        .tel(user.getTel())
                        .build())
                .toList();
    }
}