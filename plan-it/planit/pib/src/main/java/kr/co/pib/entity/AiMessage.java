package kr.co.pib.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class AiMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chatroom_id")
    private AiConversation conversation;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content; // 내용을 하나로 통합

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime datetime;

    @Column(nullable = false, length = 10)
    private String actor; // "user" 또는 "ai"
}