package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Token;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.repository.TokenRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.TokenService;

import java.util.Optional;

import static vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode.UNCATEGORIZED;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final TokenRepository tokenRepository;

    @Override
    public Token getByUsername(String username) {
        return tokenRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(UNCATEGORIZED, "Not found token"));
    }

    @Override
    public int save(Token token) {
        Optional<Token> optional = tokenRepository.findByUsername(token.getUsername());

        if (optional.isEmpty()) {
            tokenRepository.save(token);
            return token.getId();
        } else {
            Token existingToken = optional.get();

            // Update access token if present
            if (token.getAccessToken() != null) {
                existingToken.setAccessToken(token.getAccessToken());
            }

            // Update refresh token if present
            if (token.getRefreshToken() != null) {
                existingToken.setRefreshToken(token.getRefreshToken());
            }

            // Update reset token if present
            if (token.getResetToken() != null) {
                existingToken.setResetToken(token.getResetToken());
            }

            tokenRepository.save(existingToken);
            return existingToken.getId();
        }
    }

    @Override
    public void delete(String username) {
        Token token = getByUsername(username);
        tokenRepository.delete(token);
    }
}
