package kr.co.pib.service;

import kr.co.pib.entity.Festival;
import kr.co.pib.repository.FestivalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FestivalService {

    private final FestivalRepository festivalRepository;

    public List<Festival> getAllFestivals() { return festivalRepository.findAll(); }
    public Festival getFestivalById(Integer id) { return festivalRepository.findById(id).orElse(null); }
    public List<Festival> searchByName(String name) { return festivalRepository.findByNameContaining(name); }
    public List<Festival> searchByCity(String city) { return festivalRepository.findByCityContaining(city); }

    // === new ===
    public List<Festival> getHighlights() { return festivalRepository.findTop4Highlights(); }
    public List<Festival> getRecommend() { return festivalRepository.findTop10Recommend(); }
    public List<String> getCities() { return festivalRepository.findDistinctCities(); }

    public List<Festival> searchFilter(String q, String city, String month) {
        // month를 "1~12"로 받으면 "01~12" 포맷으로 보정
        String m = (month == null || month.isBlank()) ? "" :
                String.format("%02d", Integer.parseInt(month.replaceAll("\\D","")));
        return festivalRepository.searchFilter(q, city, m);
    }
}
