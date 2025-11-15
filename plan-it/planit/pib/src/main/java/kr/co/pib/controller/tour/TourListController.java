package kr.co.pib.controller.tour;

import kr.co.pib.dto.tour.CommonItemDTO;
import kr.co.pib.dto.tour.TourImageRequestDTO;
import kr.co.pib.service.tour.TourListService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tour")
@RequiredArgsConstructor
public class TourListController {

    private final TourListService tourListService;
    private static final String BASE_URL_PATH = "/static/images/";
    private static final String BASE_STORAGE_PATH = "C:/tour_image/";

    @GetMapping("/list")
    public ResponseEntity<Page<CommonItemDTO>> getIntegratedItems(
            @RequestParam int pageNo,
            @RequestParam String arrange,
            @RequestParam int areaCode,
            @RequestParam String sigungu,
            @RequestParam String category
    ) {
        Page<CommonItemDTO> itemsPage = tourListService.getIntegratedItems(
                pageNo,
                category,
                areaCode,
                sigungu,
                arrange
        );

        return ResponseEntity.ok(itemsPage);
    }

    @PostMapping("/image-urls")
    public Map<String, Object> getImageUrls(@RequestBody List<TourImageRequestDTO> requests) {

        Map<String, List<String>> responseData = new HashMap<>();

        for (TourImageRequestDTO req : requests) {
            String name = req.getName();
            String city = req.getCity();
            String uniqueKey = req.getUniqueKey();

            // city 정보에 따라 검색 경로 설정
            // '강원특별자치도'면 /storage/Gangwon/, 그 외는 /storage/Others/
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

            // 실제 이미지를 검색할 디렉토리 경로
            String searchDirPath = BASE_STORAGE_PATH + cityDirName + categoryDirName;
            System.out.println("searchDirPath777: " + searchDirPath);
            File directory = new File(searchDirPath);

            // 2. 파일 목록 필터링 및 URL 변환
            List<String> urls = Arrays.stream(directory.listFiles())
                    .filter(file -> file.isFile() && file.getName().startsWith(name + "_1_"))
                    .map(file -> BASE_URL_PATH + cityDirName + categoryDirName + file.getName())
                    .collect(Collectors.toList());

            responseData.put(name, urls);
        }

        Map<String, Object> finalResponse = new HashMap<>();
        finalResponse.put("data", responseData);
        return finalResponse;
    }

}