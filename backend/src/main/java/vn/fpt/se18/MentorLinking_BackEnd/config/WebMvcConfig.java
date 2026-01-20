package vn.fpt.se18.MentorLinking_BackEnd.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC Configuration for handling response headers and other web-related
 * configurations
 */
@Configuration
@Profile("!prod")
public class WebMvcConfig implements WebMvcConfigurer {
    // Additional web mvc configurations can be added here if needed
}
