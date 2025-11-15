package kr.co.pib.dto.ai;

import lombok.Data;
import java.util.List;


@Data
public class OpenAiResponse {
    private List<Choice> choices;

    @Data
    public static class Choice {
        private int index;
        private OpenAiRequest.Message message;
    }
}