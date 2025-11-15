package kr.co.pib.controller;

import kr.co.pib.entity.Festival;
import kr.co.pib.service.FestivalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/festival")
@RequiredArgsConstructor
public class FestivalController {

    private final FestivalService festivalService;

    // ✅ 서버에서 카카오 로컬 API를 호출하기 위한 RestTemplate (WebConfig에 @Bean 등록함)
    private final RestTemplate restTemplate;

    // ✅ application.properties 에서 주입 (예: kakao.rest.key=7bxxxx...)
    @Value("${kakao.rest.key:}")
    private String kakaoRestKey;

    // == 기존 목록 ==
    @GetMapping("/list")
    public ResponseEntity<List<Festival>> getFestivalList() {
        log.info("[LIST] fetching all festivals");
        List<Festival> festivals = festivalService.getAllFestivals();
        for (Festival f : festivals) {
            if (f.getImagePath() == null || f.getImagePath().isEmpty()) {
                f.setImagePath("default_img.png");
            }
        }
        log.info("[LIST] size={}", festivals.size());
        return ResponseEntity.ok(festivals);
    }

    // == 기존: 인기/추천/도시 ==
    @GetMapping("/highlights")
    public ResponseEntity<List<Festival>> highlights() {
        log.info("[HIGHLIGHTS] fetching highlights");
        List<Festival> list = festivalService.getHighlights();
        list.forEach(f -> {
            if (f.getImagePath() == null || f.getImagePath().isEmpty())
                f.setImagePath("default_img.png");
        });
        log.info("[HIGHLIGHTS] size={}", list.size());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/recommend")
    public ResponseEntity<List<Festival>> recommend() {
        log.info("[RECOMMEND] fetching recommendations");
        List<Festival> list = festivalService.getRecommend();
        list.forEach(f -> {
            if (f.getImagePath() == null || f.getImagePath().isEmpty())
                f.setImagePath("default_img.png");
        });
        log.info("[RECOMMEND] size={}", list.size());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/cities")
    public ResponseEntity<List<String>> cities() {
        log.info("[CITIES] fetching cities");
        List<String> cities = festivalService.getCities();
        log.info("[CITIES] size={}", cities.size());
        return ResponseEntity.ok(cities);
    }

    // == 기존: 통합 검색/필터 ==
    @GetMapping("/filter")
    public ResponseEntity<List<Festival>> filter(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String month
    ) {
        log.info("[FILTER] q={}, city={}, month={}", q, city, month);
        List<Festival> list = festivalService.searchFilter(q, city, month);
        list.forEach(f -> {
            if (f.getImagePath() == null || f.getImagePath().isEmpty())
                f.setImagePath("default_img.png");
        });
        log.info("[FILTER] result size={}", list.size());
        return ResponseEntity.ok(list);
    }

    // == 기존: 상세 ==
    @GetMapping("/{id}")
    public ResponseEntity<Festival> getFestivalDetail(@PathVariable Integer id) {
        log.info("[DETAIL] id={}", id);
        Festival festival = festivalService.getFestivalById(id);
        if (festival == null) {
            log.warn("[DETAIL] not found id={}", id);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(festival);
    }

    // == 기존: 검색 ==
    @GetMapping("/search")
    public ResponseEntity<List<Festival>> searchFestival(@RequestParam String keyword) {
        log.info("[SEARCH] keyword={}", keyword);
        List<Festival> list = festivalService.searchByName(keyword);
        log.info("[SEARCH] result size={}", list.size());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/city")
    public ResponseEntity<List<Festival>> searchByCity(@RequestParam String city) {
        log.info("[SEARCH_CITY] city={}", city);
        List<Festival> list = festivalService.searchByCity(city);
        log.info("[SEARCH_CITY] result size={}", list.size());
        return ResponseEntity.ok(list);
    }

    // ----------------------------------------------------------------------
    // ✅ 추가: 카카오 맛집 검색 서버 프록시 (클라이언트 403 방지)
    // 프론트: /api/festival/nearby?lat=..&lng=..&keyword=..&radius=2000&size=5
    // 기본값: keyword=맛집, radius=2000, size=5, sort=distance
    // 반환: 카카오의 원본 JSON 그대로 (documents, meta 등)
    // ----------------------------------------------------------------------
    @GetMapping("/nearby")
    public ResponseEntity<?> searchNearbyRestaurants(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(required = false, defaultValue = "맛집") String keyword,
            @RequestParam(required = false, defaultValue = "2000") int radius,
            @RequestParam(required = false, defaultValue = "5") int size,
            @RequestParam(required = false, defaultValue = "distance") String sort
    ) {
        log.info("[NEARBY] lat={}, lng={}, keyword='{}', radius={}, size={}, sort={}",
                lat, lng, keyword, radius, size, sort);

        if (kakaoRestKey == null || kakaoRestKey.isBlank()) {
            log.error("[NEARBY] Kakao REST API key not configured");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Kakao REST API key not configured (kakao.rest.key)"));
        }

        /* 추가_cym 에러 수정 20251013일 */
        String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8);

        URI uri = UriComponentsBuilder
                .fromHttpUrl("https://dapi.kakao.com/v2/local/search/keyword.json")
                .queryParam("query", encodedKeyword)  // 수정_cym 에러 수정 20251013일
                .queryParam("x", String.valueOf(lng)) // Kakao: x=lng
                .queryParam("y", String.valueOf(lat)) // Kakao: y=lat
                .queryParam("radius", radius)
                .queryParam("size", size)
                .queryParam("sort", sort)
                .build(true) // 이미 인코딩된 파라미터 보존
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "KakaoAK " + kakaoRestKey);
        headers.setContentType(new MediaType("application", "json", StandardCharsets.UTF_8));

        HttpEntity<Void> httpEntity = new HttpEntity<>(headers);

        try {
            log.debug("[NEARBY] calling Kakao API uri={}", uri);
            ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
                    uri, HttpMethod.GET, httpEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            log.info("[NEARBY] Kakao status={} docs={}",
                    resp.getStatusCodeValue(),
                    ((resp.getBody() != null && resp.getBody().get("documents") instanceof List)
                            ? ((List<?>) resp.getBody().get("documents")).size() : 0));
            return ResponseEntity.status(resp.getStatusCode()).body(resp.getBody());
        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            String body = ex.getResponseBodyAsString(StandardCharsets.UTF_8);
            log.error("[NEARBY] Kakao error status={} body={}", ex.getStatusCode().value(), body);
            HttpHeaders respHeaders = new HttpHeaders();
            respHeaders.setContentType(MediaType.APPLICATION_JSON);
            return new ResponseEntity<>(body, respHeaders, ex.getStatusCode());
        } catch (Exception ex) {
            log.error("[NEARBY] internal error: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }
}
