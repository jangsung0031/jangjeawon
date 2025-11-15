package kr.co.pib.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/kcisa")
@CrossOrigin(origins = "http://localhost") // React 접근 허용
@Slf4j
public class KcisaApiController {

    @Value("${kcisa.key}") // application.properties에 kcisa.key 등록 필요
    private String serviceKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * KCISA 검색 API (페이지당 10개 고정 가능)
     * - pageNo: 1부터 시작
     * - numOfRows: 기본 10
     * - 응답: items[], pageNo, numOfRows, totalCount(있으면), rawTotalCount(원본 값)
     */
    @GetMapping("/search")
    public ResponseEntity<JsonNode> searchPlaces(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int numOfRows
    ) throws Exception {

        String apiUrl = "https://api.kcisa.kr/openapi/service/rest/convergence/conver8";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/xml");

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .queryParam("serviceKey", serviceKey)
                .queryParam("pageNo", pageNo)
                .queryParam("numOfRows", numOfRows) // ✅ 페이지당 문서 수
                .queryParam("keyword", keyword);

        String url = builder.build(false).toUriString();
        log.info("KCISA 호출 URL = {}", url);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class
        );

        XmlMapper xmlMapper = new XmlMapper();
        JsonNode root = xmlMapper.readTree(response.getBody());

        JsonNode body = root.path("body");
        JsonNode itemsNode = body.path("items").path("item");

        ObjectMapper mapper = new ObjectMapper();
        ArrayNode items = mapper.createArrayNode();

        if (itemsNode.isArray()) {
            itemsNode.forEach(items::add);
        } else if (!itemsNode.isMissingNode() && !itemsNode.isNull()) {
            items.add(itemsNode);
        }

        // totalCount가 제공되면 전달 (없으면 null)
        JsonNode totalCountNode = body.path("totalCount");
        Integer totalCount = totalCountNode.isNumber() ? totalCountNode.asInt() : null;

        ObjectNode result = mapper.createObjectNode();
        result.set("items", items);
        result.put("pageNo", pageNo);
        result.put("numOfRows", numOfRows);
        if (totalCount != null) {
            result.put("totalCount", totalCount);
        } else {
            result.putNull("totalCount");
        }
        // 원본 값 그대로도 넘겨주고 싶다면
        result.set("rawTotalCount", totalCountNode.isMissingNode() ? null : totalCountNode);

        return ResponseEntity.ok(result);
    }
}
