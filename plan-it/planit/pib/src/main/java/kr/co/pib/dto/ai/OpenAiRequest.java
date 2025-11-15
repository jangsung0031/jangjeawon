package kr.co.pib.dto.ai;

import lombok.Data;
import java.util.List;


@Data
public class OpenAiRequest {
    private String model;
    private List<Message> messages;

    @Data
    public static class Message {
        private String role;
        private String content;
    }
}