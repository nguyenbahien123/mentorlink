package vn.fpt.se18.MentorLinking_BackEnd.config;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import vn.fpt.se18.MentorLinking_BackEnd.service.UserService;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

import org.springframework.http.HttpMethod;

@Configuration
@Profile({"dev", "test"})
@RequiredArgsConstructor
public class AppConfig {

    private final UserService userService;
    private final PreFilter preFilter;
    private final CorsConfigurationSource corsConfigurationSource;


    @Bean
    public PasswordEncoder getPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain configure(@NonNull HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource)) // Thêm cấu hình CORS
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET,
                            "/admin/**","/chat-websocket/**", "/api/chat-websocket/**",
                            "/api/chat/history/**",
                                "/mentors", "/mentors/**",
                                "/blogs", "/blogs/**",
                                "/mentor-policies/**", "/policies/active", "/customer-policies/**", "/banners/**", "/public/mentor-ads/active", "/blogs/**",
                                "/mentor-countries/**", "/faqs/**", "/schedules/**", "/public/mentor-ads/active",
                                "/countries/**", "/api/countries/popular", "/api/countries/search")
                        .permitAll()
                        .requestMatchers("/auth/**", "/profile/**", "/bookings/**", "/payments/**", "/comments/**", "/mentor-ads/upload",
                                "/mentor-ads/my-ads",
                                "/ratings/**","/chat-websocket/**", "/api/chat-websocket/**", "/chat/**", "/app/**", "/topic/**", "/queue/**", "/user/**", "/recommendations/**", "/chatbot/**", "/schedules/**", "/time-slots/**")
                        .permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(manager -> manager.sessionCreationPolicy(STATELESS))
                .authenticationProvider(provider())
                .addFilterBefore(preFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return webSecurity -> webSecurity.ignoring()
                .requestMatchers("/actuator/**", "/v3/**", "/webjars/**", "/swagger-ui*/*swagger-initializer.js",
                        "/swagger-ui*/**");
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider provider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userService.userDetailsService());
        provider.setPasswordEncoder(getPasswordEncoder());

        return provider;
    }

}
