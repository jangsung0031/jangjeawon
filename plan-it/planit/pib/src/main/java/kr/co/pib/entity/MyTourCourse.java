package kr.co.pib.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MyTourCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String title;
    private String addr;
    private String imageUrl;
    private String contentId;
    private String mapx;
    private String mapy;

    private LocalDateTime regDate = LocalDateTime.now();
}
