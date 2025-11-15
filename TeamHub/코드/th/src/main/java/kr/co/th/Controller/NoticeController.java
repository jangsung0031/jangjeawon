package kr.co.th.Controller;

import kr.co.th.Service.NoticeService;
import kr.co.th.dto.NoticeDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notice")
@CrossOrigin(origins = {
        "http://localhost:3000", "http://127.0.0.1:3000"
}, allowCredentials = "true")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @GetMapping
    public List<NoticeDto> getAll() {
        return noticeService.getAll();
    }

    @GetMapping("/{id}")
    public NoticeDto getOne(@PathVariable Long id) {
        return noticeService.getOne(id);
    }

    @PostMapping
    public String write(@RequestBody NoticeDto dto) {
        noticeService.write(dto);
        return "작성 완료";
    }

    @PutMapping("/{id}")
    public String edit(@PathVariable Long id, @RequestBody NoticeDto dto) {
        noticeService.edit(id, dto);
        return "수정 완료";
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        noticeService.delete(id);
        return "삭제 완료";
    }
}
