package kr.co.pib.controller.tour;

import jakarta.persistence.EntityNotFoundException;
import kr.co.pib.dto.tour.*;
import kr.co.pib.service.tour.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tour/detail")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;
    private static final String BASE_URL_PATH = "/static/images/";
    private static final String BASE_STORAGE_PATH = "C:/tour_image/";

    @GetMapping("/data")
    public ResponseEntity<Object> getTourDetail(
            @RequestParam String uniqueKey
    ) {
        try {
            Object detailDto = tourService.getTourDetail(uniqueKey);

            return ResponseEntity.ok(detailDto);

        } catch (EntityNotFoundException e) {
            // 엔티티를 찾지 못한 경우 (ID 오류) -> 404 반환
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            // 잘못된 uniqueKey 형식이나 지원하지 않는 카테고리인 경우 -> 400 반환
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            // 그 외 예상치 못한 오류 -> 500 반환
            return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다.");
        }
    }

    @GetMapping("/checkData")
    public ResponseEntity<Boolean> checkData(
            @RequestParam String uniqueKey
    ) {
        boolean success = tourService.checkAndCreateTourData(uniqueKey);

        if (success) {
            return ResponseEntity.ok(true);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }

    // 조회수 증가, 총 조회수 즐겨찾기수, 좋아요수 반환
    @GetMapping("/view")
    public ResponseEntity<TourStatsResponseDTO> increaseView(
            @RequestParam String uniqueKey
    ) {
        TourStatsResponseDTO statsResponse = tourService.incrementView(uniqueKey);
        return ResponseEntity.ok(statsResponse);
    }

    // 추천 토글
    @PostMapping("/user/like")
    public ResponseEntity<LikeToggledResponseDTO> toggleLike(
            @AuthenticationPrincipal String userId,
            @RequestParam String uniqueKey
    ) {
        LikeToggledResponseDTO response = tourService.toggleLike(userId, uniqueKey);
        return ResponseEntity.ok(response);
    }

    // 즐겨찾기 토글
    @PostMapping("/user/favorite")
    public ResponseEntity<FavoriteToggledResponseDTO> toggleFavorite(
            @AuthenticationPrincipal String userId,
            @RequestParam String uniqueKey
    ) {
        FavoriteToggledResponseDTO response = tourService.toggleFavorite(userId, uniqueKey);
        return ResponseEntity.ok(response);
    }

    // 추천/즐겨찾기 상태 조회
    @GetMapping("/user/status")
    public ResponseEntity<TourStatusResponse> getStatus(
            @AuthenticationPrincipal String userId,
            @RequestParam String uniqueKey
    ) {
        boolean liked = tourService.hasLiked(userId, uniqueKey);
        boolean favorited = tourService.hasFavorited(userId, uniqueKey);

        return ResponseEntity.ok(new TourStatusResponse(liked, favorited));
    }

    // 이미지 조회
    @PostMapping("/image-urls")
    public Map<String, Object> getImageUrls(@RequestBody TourImageRequestDTO requests) {

        Map<String, List<String>> responseData = new HashMap<>();

        String name = requests.getName();
        String city = requests.getCity();
        String uniqueKey = requests.getUniqueKey();

        String cityDirName;
        String categoryPrefix;
        String categoryDirName;
        int hyphenIndex = uniqueKey.indexOf('-');

        if (hyphenIndex > 0) {
            categoryPrefix = uniqueKey.substring(0, hyphenIndex);
        } else {
            categoryPrefix = uniqueKey;
        }

        cityDirName = switch (city) {
            case "서울특별시" -> "seoul/";
            case "부산광역시" -> "busan/";
            case "강원특별자치도" -> "gangwon/";
            case "경상북도" -> "gyeongbuk/";
            case "전북특별자치도" -> "jeonbuk/";
            case "제주특별자치도" -> "jeju/";
            default -> "etc/";
        };

        categoryDirName = switch (categoryPrefix) {
            case "TOUR" -> "tour_list/";
            case "RESTAURANT" -> "restaurant_list/";
            case "ACCOMMODATION" -> "accommodation_list/";
            case "CULTURE" -> "culture_list/";
            case "SHOPPING" -> "shopping_list/";
            case "LEISURE" -> "leisure_sports_list/";
            default -> "etc/";
        };

        String searchDirPath = BASE_STORAGE_PATH + cityDirName + categoryDirName;

        File directory = new File(searchDirPath);

        List<String> urls = Arrays.stream(directory.listFiles())
                .filter(file -> file.isFile() && file.getName().startsWith(name + "_"))
                .map(file -> BASE_URL_PATH + cityDirName + categoryDirName + file.getName())
                .collect(Collectors.toList());

        responseData.put(name, urls);

        Map<String, Object> finalResponse = new HashMap<>();
        finalResponse.put("data", responseData);
        return finalResponse;
    }

    // 즐겨찾기 수 조회
    @GetMapping("/user/count")
    public ResponseEntity<TourActionCountDTO> getTotalActionCounts(
            @AuthenticationPrincipal String userId) {

        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        TourActionCountDTO response = tourService.getActionCountsByUserId(userId);

        return ResponseEntity.ok(response);
    }

    // record : 간단한 DTO를 짧게 만드는 문법. private final 필드, 생성자, getter 메서드 등 자동 생성
    public record TourStatusResponse(boolean liked, boolean favorited) {}
}

