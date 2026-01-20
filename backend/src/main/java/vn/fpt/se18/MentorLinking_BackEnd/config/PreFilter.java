package vn.fpt.se18.MentorLinking_BackEnd.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.service.JwtService;
import vn.fpt.se18.MentorLinking_BackEnd.service.UserService;

import java.io.IOException;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static vn.fpt.se18.MentorLinking_BackEnd.util.TokenType.*;

@Component
@Slf4j
@RequiredArgsConstructor
public class PreFilter extends OncePerRequestFilter {

    private final UserService userService;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        log.info("---------- doFilterInternal ----------");

        String path = request.getRequestURI();
        String contextPath = request.getContextPath();

        // Remove context path if present
        if (StringUtils.isNotBlank(contextPath) && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }

        log.info("Processing path: {}", path);

        // Skip JWT validation for these endpoints
        if (path.equals("/auth/refresh-token") || path.equals("/auth/login") || path.equals("/auth/signup") ||
            path.equals("/auth/access-token") || path.startsWith("/auth/") ) {
            log.info("Skipping JWT validation for path: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

//        ||
//        path.startsWith("/api/mentors") || path.startsWith("/api/blogs")

        final String authorization = request.getHeader(AUTHORIZATION);

        if (StringUtils.isBlank(authorization) || !authorization.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authorization.substring("Bearer ".length());

        try {
            final String userName = jwtService.extractUsername(token, ACCESS_TOKEN);

            if (StringUtils.isNotEmpty(userName) && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userService.userDetailsService().loadUserByUsername(userName);
                if (jwtService.isValid(token, ACCESS_TOKEN, userDetails)) {
                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);
                }
            }
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
            sendErrorResponse(response, ErrorCode.JWT_EXPIRED);
            return;
        } catch (SignatureException e) {
            log.warn("JWT signature invalid: {}", e.getMessage());
            sendErrorResponse(response, ErrorCode.JWT_INVALID_SIGNATURE);
            return;
        } catch (MalformedJwtException e) {
            log.warn("JWT token malformed: {}", e.getMessage());
            sendErrorResponse(response, ErrorCode.JWT_MALFORMED);
            return;
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token unsupported: {}", e.getMessage());
            sendErrorResponse(response, ErrorCode.JWT_UNSUPPORTED);
            return;
        } catch (IllegalArgumentException e) {
            log.warn("JWT illegal argument: {}", e.getMessage());
            sendErrorResponse(response, ErrorCode.JWT_ILLEGAL_ARGUMENT);
            return;
        } catch (Exception e) {
            log.error("Unexpected error processing JWT token: ", e);
            // Các exception khác vẫn được catch để không ảnh hưởng đến filter chain
        }

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, ErrorCode errorCode) throws IOException {
        BaseResponse<Object> errorResponse = new BaseResponse<>();
        errorResponse.setRespCode(String.valueOf(errorCode.getCode()));
        errorResponse.setDescription(errorCode.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(errorCode.getHttpStatus().value());
        response.setCharacterEncoding("UTF-8");

        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }
}
