package kr.co.pib.service.ai;

import kr.co.pib.dto.ai.PlaceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MapService {

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    private final RestTemplate restTemplate;

    private static final String DIRECTIONS_URL = "https://apis-navi.kakaomobility.com/v1/directions";

    public String getCarDirections(List<PlaceDto> places) {
        if (places == null || places.size() < 2) {
            return null;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "KakaoAK " + kakaoApiKey);

        String origin = places.get(0).getMapx() + "," + places.get(0).getMapy();
        String destination = places.get(places.size() - 1).getMapx() + "," + places.get(places.size() - 1).getMapy();

        String waypoints = "";
        if (places.size() > 2) {
            waypoints = places.subList(1, places.size() - 1).stream()
                    .map(p -> p.getMapx() + "," + p.getMapy())
                    .collect(Collectors.joining("|"));
        }

        String url = DIRECTIONS_URL + "?origin=" + origin + "&destination=" + destination;
        if (!waypoints.isEmpty()) {
            url += "&waypoints=" + waypoints;
        }

        HttpEntity<String> entity = new HttpEntity<>(headers);
        log.info("카카오 길찾기 API 호출: {}", url);
        return restTemplate.exchange(url, HttpMethod.GET, entity, String.class).getBody();
    }
}