package vn.fpt.se18.MentorLinking_BackEnd.config;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class ApplicationTimeZoneConfig {

    @Value("${app.timezone:Asia/Ho_Chi_Minh}")
    private String appTimeZone;

    @PostConstruct
    public void init() {
        TimeZone timeZone = TimeZone.getTimeZone(appTimeZone);
        TimeZone.setDefault(timeZone);
        log.info("Application default timezone set to {}", timeZone.getID());
    }
}