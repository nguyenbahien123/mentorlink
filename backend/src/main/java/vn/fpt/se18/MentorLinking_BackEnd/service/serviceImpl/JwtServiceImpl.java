package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.service.JwtService;
import vn.fpt.se18.MentorLinking_BackEnd.util.TokenType;

import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

import static vn.fpt.se18.MentorLinking_BackEnd.util.TokenType.*;


@Service
@Slf4j
public class JwtServiceImpl implements JwtService {

    @Value("${jwt.accessTokenExpiryMinutes:#{null}}")
    private Long accessTokenExpiryMinutes;

    @Value("${jwt.expiryHour:0}")
    private long expiryHour;

    @Value("${jwt.expiryDay}")
    private long expiryDay;

    @Value("${jwt.accessKey}")
    private String accessKey;

    @Value("${jwt.refreshKey}")
    private String refreshKey;

    @Value("${jwt.resetKey}")
    private String resetKey;

    @Override
    public String generateToken(UserDetails user) {
        return generateToken(new HashMap<>(), user);
    }

    @Override
    public String generateRefreshToken(UserDetails user) {
        return generateRefreshToken(new HashMap<>(), user);
    }

    @Override
    public String generateResetToken(UserDetails user) {
        return generateResetToken(new HashMap<>(), user);
    }

    @Override
    public String extractUsername(String token, TokenType type) {
        return extractClaim(token, type, Claims::getSubject);
    }

    @Override
    public boolean isValid(String token, TokenType type, UserDetails userDetails) {
        log.info("---------- isValid ----------");
        final String username = extractUsername(token, type);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token, type));
    }

    private String generateToken(Map<String, Object> claims, UserDetails userDetails) {
        log.info("---------- generateToken ----------");
        User user = (User) userDetails;
        claims.put("role", user.getRole().getName());
        claims.put("email", user.getEmail());
        // Include user id in token so frontend can read userId from access token
        try {
            if (user.getId() != null) {
                claims.put("userId", user.getId());
                claims.put("id", user.getId());
            }
        } catch (Exception e) {
            log.warn("Could not put user id into JWT claims", e);
        }
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + resolveAccessTokenExpiryMillis()))
                .signWith(getKey(ACCESS_TOKEN), SignatureAlgorithm.HS256)
                .compact();
    }

    private String generateRefreshToken(Map<String, Object> claims, UserDetails userDetails) {
        log.info("---------- generateRefreshToken ----------");
        String email = ((User) userDetails).getEmail();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * expiryDay))
                .signWith(getKey(REFRESH_TOKEN), SignatureAlgorithm.HS256)
                .compact();
    }

    private String generateResetToken(Map<String, Object> claims, UserDetails userDetails) {
        log.info("---------- generateResetToken ----------");
        String email = ((User) userDetails).getEmail();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(getKey(RESET_TOKEN), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getKey(TokenType type) {
        log.info("---------- getKey ----------");
        String keyStr;
        switch (type) {
            case ACCESS_TOKEN -> keyStr = accessKey;
            case REFRESH_TOKEN -> keyStr = refreshKey;
            case RESET_TOKEN -> keyStr = resetKey;
            default -> throw new AppException(ErrorCode.UNAUTHORIZED, "Invalid token type");
        }

        if (keyStr == null || keyStr.isBlank()) {
            throw new AppException(ErrorCode.UNCATEGORIZED, "JWT key is not configured for type: " + type);
        }

        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(keyStr);
        } catch (DecodingException | IllegalArgumentException e) {
            // Not a Base64 string: fall back to using plain UTF-8 bytes. Ensure key length is sufficient for HS256 (>=32 bytes).
            byte[] plain = keyStr.getBytes(StandardCharsets.UTF_8);
            if (plain.length < 32) {
                try {
                    MessageDigest digest = MessageDigest.getInstance("SHA-256");
                    keyBytes = digest.digest(plain);
                } catch (NoSuchAlgorithmException ex) {
                    throw new AppException(ErrorCode.UNCATEGORIZED, "Cannot generate JWT key bytes");
                }
            } else {
                keyBytes = Arrays.copyOf(plain, plain.length);
            }
        }

        return Keys.hmacShaKeyFor(keyBytes);

    }

    private <T> T extractClaim(String token, TokenType type, Function<Claims, T> claimResolver) {
        final Claims claims = extraAllClaim(token, type);
        return claimResolver.apply(claims);
    }

    private Claims extraAllClaim(String token, TokenType type) {
        return Jwts.parserBuilder().setSigningKey(getKey(type)).build().parseClaimsJws(token).getBody();
    }

    private boolean isTokenExpired(String token, TokenType type) {
        return extractExpiration(token, type).before(new Date());
    }

    private Date extractExpiration(String token, TokenType type) {
        return extractClaim(token, type, Claims::getExpiration);
    }

    private long resolveAccessTokenExpiryMillis() {
        if (accessTokenExpiryMinutes != null && accessTokenExpiryMinutes > 0) {
            return TimeUnit.MINUTES.toMillis(accessTokenExpiryMinutes);
        }

        if (expiryHour > 0) {
            return TimeUnit.HOURS.toMillis(expiryHour);
        }

        return TimeUnit.MINUTES.toMillis(15);
    }
}
