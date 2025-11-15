package kr.co.th.Service;

import kr.co.th.dto.NoticeDto;
import kr.co.th.Repository.NoticeRepository;
import kr.co.th.vo.Notice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepo;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public List<NoticeDto> getAll() {
        return noticeRepo.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())) // 최신순 정렬
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public NoticeDto getOne(Long id) {
        return noticeRepo.findById(id).map(this::toDto).orElse(null);
    }

    public void write(NoticeDto dto) {
        Notice notice = Notice.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .createdAt(LocalDateTime.now())
                .pinned(false)
                .build();
        noticeRepo.save(notice);
    }

    public void edit(Long id, NoticeDto dto) {
        Optional<Notice> optional = noticeRepo.findById(id);
        optional.ifPresent(notice -> {
            notice.setTitle(dto.getTitle());
            notice.setContent(dto.getContent());
            noticeRepo.save(notice);
        });
    }

    public void delete(Long id) {
        noticeRepo.deleteById(id);
    }

    private NoticeDto toDto(Notice entity) {
        return NoticeDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt().format(formatter))
                .build();
    }
}
