package kr.co.pib.controller;


import kr.co.pib.dto.ai.PlaceDto;
import kr.co.pib.service.ai.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    @PostMapping("/directions")
    public ResponseEntity<String> getDirections(@RequestBody List<PlaceDto> places) {
        try {
            String directions = mapService.getCarDirections(places);
            if (directions == null) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(directions);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("경로를 찾는 데 실패했습니다: " + e.getMessage());
        }
    }
}