package vn.fpt.se18.MentorLinking_BackEnd.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * GeminiConfig placeholder when the Google Generative AI client library is not available.
 * To enable real Gemini integration, add the proper dependency and restore this class to create
 * a GenerativeModel bean.
 */
@Configuration
@Slf4j
public class GeminiConfig {

    @Value("${gemini.api-key:#{null}}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String modelName;

    // No bean is created in this environment. The application will use DB-based fallbacks instead.
}
