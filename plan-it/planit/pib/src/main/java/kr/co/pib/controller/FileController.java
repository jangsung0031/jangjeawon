package kr.co.pib.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Value("${file.upload.dir}")
    private String uploadDir;        // 예: C:/planit/uploads

    @Value("${file.access.prefix:/uploads}")
    private String accessPrefix;     // 예: /uploads

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "empty file"));
            }

            // 원본 확장자 유지
            String original = StringUtils.cleanPath(file.getOriginalFilename());
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot != -1) ext = original.substring(dot);

            // 저장 파일명: yyyyMMddHHmmssSSS_UUID.ext
            String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
            String stored = ts + "_" + UUID.randomUUID().toString().replace("-", "") + ext;

            File dir = new File(uploadDir);
            if (!dir.exists() && !dir.mkdirs()) {
                return ResponseEntity.internalServerError().body(Map.of("error", "cannot create upload dir"));
            }

            Path target = new File(dir, stored).toPath();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String url = accessPrefix + "/" + stored;  // 프론트에서 <img src={url}>

            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
