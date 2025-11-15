package kr.co.pib.service.tour;

import kr.co.pib.dto.tour.CommonItemDTO;
import kr.co.pib.entity.tour.TourStats;
import kr.co.pib.repository.tour.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class TourListService {

    // 6개 레포지토리 주입 (생략)
    private final TourListRepository tourListRepository;
    private final LeisureSportsListRepository leisureSportsListRepository;
    private final RestaurantListRepository restaurantListRepository;
    private final ShoppingListRepository shoppingListRepository;
    private final CultureListRepository cultureListRepository;
    private final AccommodationListRepository accommodationListRepository;
    private final TourStatsRepository tourStatsRepository;

    private static final int PAGE_SIZE = 100;

    // areaCode와 city 매핑
    private static final Map<Integer, String> AREA_CODE_MAP = Map.of(
            1, "서울특별시",
            39, "제주특별자치도",
            37, "전북특별자치도",
            6, "부산광역시",
            35, "경상북도",
            32, "강원특별자치도"
    );

    public Page<CommonItemDTO> getIntegratedItems(
            int pageNo,
            String category,
            int areaCode,
            String sigungu,
            String arrange) {
        List<CommonItemDTO> initialItems = buildFilteredStream(category, areaCode, sigungu).collect(Collectors.toList());

        if ("P".equalsIgnoreCase(arrange)) {
            // 모든 아이템의 uniqueKey 리스트 추출
            List<String> uniqueKeys = initialItems.stream()
                    .map(CommonItemDTO::getUniqueKey)
                    .collect(Collectors.toList());

            // uniqueKey 리스트를 이용해 TourStats를 단 하나의 쿼리로 한 번에 조회 (벌크 조회)
            List<TourStats> statsList = tourStatsRepository.findAllById(uniqueKeys);

            // 조회된 TourStats 리스트를 Map<uniqueKey, TourStats>으로 변환하여 O(1) 검색 준비
            Map<String, TourStats> statsMap = statsList.stream()
                    .collect(Collectors.toMap(TourStats::getId, Function.identity()));

            // 초기 아이템 리스트를 순회하며 likeCount를 Map에서 조회하여 DTO에 설정
            initialItems.forEach(item -> {
                TourStats stats = statsMap.get(item.getUniqueKey());
                // Map에서 데이터를 찾으면 likeCount 설정, 없으면 0L 설정
                item.setLikeCount(stats != null ? stats.getLikeCount() : 0L);
            });
        }

        // 정렬 방식에 따른 Comparator 정의
        Comparator<CommonItemDTO> comparator;
        if ("P".equalsIgnoreCase(arrange)) {
            // 인기순 정렬: likeCount 내림차순 정렬, 동점인 경우 name 오름차순
            comparator = Comparator
                    .comparing(CommonItemDTO::getLikeCount, Comparator.reverseOrder())
                    .thenComparing(CommonItemDTO::getName);
        } else if ("A".equalsIgnoreCase(arrange) || "D".equalsIgnoreCase(arrange)) {
            comparator = Comparator.comparing(CommonItemDTO::getName);
        } else {
            comparator = Comparator.comparing(CommonItemDTO::getName);
        }

        List<CommonItemDTO> allItems = initialItems.stream()
                .sorted(comparator)
                .collect(Collectors.toList());

        int start = pageNo * PAGE_SIZE;
        int end = Math.min((pageNo + 1) * PAGE_SIZE, allItems.size());

        if (start >= allItems.size()) {
            return new PageImpl<>(List.of(), PageRequest.of(pageNo, PAGE_SIZE), allItems.size());
        }

        List<CommonItemDTO> content = allItems.subList(start, end);

        return new PageImpl<>(content, PageRequest.of(pageNo, PAGE_SIZE), allItems.size());
    }

    // 카테고리 및 지역 조건에 따라 필터링된 엔티티 스트림을 생성
    private Stream<CommonItemDTO> buildFilteredStream(String category, int areaCode, String sigungu) {
        // areaCode를 city 이름으로 변환
        String targetCity = AREA_CODE_MAP.get(areaCode);

        // 쿼리 필터링 람다 함수 정의
        java.util.function.Predicate<CommonItemDTO> filter = item -> {
            boolean cityMatch = true;
            boolean sigunguMatch = true;

            // 지역코드 필터링 (areaCode != 0 혹은 targetCity != null 일 때)
            if (targetCity != null && !targetCity.isEmpty()) {
                cityMatch = item.getCity() != null && item.getCity().equals(targetCity);
            }
            // 시군구 필터링 (sigungu 파라미터가 있을 때)
            if (sigungu != null && !sigungu.equals("전체") && !sigungu.isEmpty()) {
                sigunguMatch = item.getSigungu() != null && item.getSigungu().equals(sigungu);
            }
            return cityMatch && sigunguMatch;
        };

        // 카테고리에 따라 조회할 엔티티 레포지토리를 선택하고, 필터링 후 DTO로 변환하는 로직
        Stream<CommonItemDTO> stream;

        switch (category) {
            case "관광지":
                stream = tourListRepository.findAll().stream()
                        .map(e -> CommonItemDTO.builder().name(e.getName()).intro(e.getIntro()).addr(e.getAddr()).city(e.getCity()).sigungu(e.getSigungu()).uniqueKey("TOUR-" + e.getId()).build());
                break;
            case "음식점":
                stream = restaurantListRepository.findAll().stream()
                        .map(e -> CommonItemDTO.builder().name(e.getName()).intro(e.getIntro()).addr(e.getAddr()).city(e.getCity()).sigungu(e.getSigungu()).uniqueKey("RESTAURANT-" + e.getId()).build());
                break;
            case "숙박":
                stream = accommodationListRepository.findAll().stream()
                        .map(e -> CommonItemDTO.builder().name(e.getName()).intro(e.getIntro()).addr(e.getAddr()).city(e.getCity()).sigungu(e.getSigungu()).uniqueKey("ACCOMMODATION-" + e.getId()).build());
                break;
            case "문화시설":
                stream = cultureListRepository.findAll().stream()
                        .map(e -> CommonItemDTO.builder().name(e.getName()).intro(e.getIntro()).addr(e.getAddr()).city(e.getCity()).sigungu(e.getSigungu()).uniqueKey("CULTURE-" + e.getId()).build());
                break;
            case "쇼핑":
                stream = shoppingListRepository.findAll().stream()
                        .map(e -> CommonItemDTO.builder().name(e.getName()).intro(e.getIntro()).addr(e.getAddr()).city(e.getCity()).sigungu(e.getSigungu()).uniqueKey("SHOPPING-" + e.getId()).build());
                break;
            case "레포츠":
                stream = leisureSportsListRepository.findAll().stream()
                        .map(e -> CommonItemDTO.builder().name(e.getName()).intro(e.getIntro()).addr(e.getAddr()).city(e.getCity()).sigungu(e.getSigungu()).uniqueKey("LEISURE-" + e.getId()).build());
                break;
            case "전체":
            default:
                stream = Stream.of(
                        // TourList 스트림
                        tourListRepository.findAll().stream().map(e -> CommonItemDTO.builder().name(e.getName()).intro(e.getIntro()).addr(e.getAddr()).city(e.getCity()).sigungu(e.getSigungu()).uniqueKey("TOUR-" + e.getId()).build()),
                        // LeisureSportsList 스트림
                        leisureSportsListRepository.findAll().stream().map(e -> CommonItemDTO.builder().name(e.getName()).intro(e.getIntro()).addr(e.getAddr()).city(e.getCity()).sigungu(e.getSigungu()).uniqueKey("LEISURE-" + e.getId()).build()),
                        // RestaurantList 스트림
                        restaurantListRepository.findAll().stream().map(e -> CommonItemDTO.builder().name(e.getName()).intro(e.getIntro()).addr(e.getAddr()).city(e.getCity()).sigungu(e.getSigungu()).uniqueKey("RESTAURANT-" + e.getId()).build()),
                        // ShoppingList 스트림
                        shoppingListRepository.findAll().stream().map(e -> CommonItemDTO.builder().name(e.getName()).intro(e.getIntro()).addr(e.getAddr()).city(e.getCity()).sigungu(e.getSigungu()).uniqueKey("SHOPPING-" + e.getId()).build()),
                        //CultureList 스트림
                        cultureListRepository.findAll().stream().map(e -> CommonItemDTO.builder().name(e.getName()).intro(e.getIntro()).addr(e.getAddr()).city(e.getCity()).sigungu(e.getSigungu()).uniqueKey("CULTURE-" + e.getId()).build()),
                        // AccommodationList 스트림
                        accommodationListRepository.findAll().stream().map(e -> CommonItemDTO.builder().name(e.getName()).intro(e.getIntro()).addr(e.getAddr()).city(e.getCity()).sigungu(e.getSigungu()).uniqueKey("ACCOMMODATION-" + e.getId()).build())
                ).flatMap(s -> s);
        }

        // 필터링 조건을 적용하여 스트림을 반환
        return stream.filter(filter);
    }
}
