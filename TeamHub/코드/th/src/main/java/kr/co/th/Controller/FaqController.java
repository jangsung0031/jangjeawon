package kr.co.th.Controller;

import kr.co.th.Repository.FaqRepository;
import kr.co.th.vo.Faq;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/faq")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://127.0.0.1:3000"
}, allowCredentials = "true")
public class FaqController {

    @Autowired
    private FaqRepository faqRepo;

    @GetMapping
    public List<Faq> getAllFaqs() {
        return faqRepo.findAll();
    }

    @GetMapping("/{id}")
    public Faq getFaq(@PathVariable Long id) {
        return faqRepo.findById(id).orElse(null);
    }

    @PostMapping
    public String createFaq(@RequestBody Faq faq) {
        faq.setCreatedAt(LocalDateTime.now());
        faqRepo.save(faq);
        return "등록 성공";
    }

    @PutMapping("/{id}")
    public String updateFaq(@PathVariable Long id, @RequestBody Faq updatedFaq) {
        Optional<Faq> optionalFaq = faqRepo.findById(id);
        if (optionalFaq.isPresent()) {
            Faq faq = optionalFaq.get();
            faq.setCategory(updatedFaq.getCategory());
            faq.setTitle(updatedFaq.getTitle());
            faq.setContent(updatedFaq.getContent());
            faqRepo.save(faq);
            return "수정 완료";
        } else {
            return "FAQ를 찾을 수 없습니다.";
        }
    }

    @DeleteMapping("/{id}")
    public String deleteFaq(@PathVariable Long id) {
        faqRepo.deleteById(id);
        return "삭제 완료";
    }
}
