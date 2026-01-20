package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.entity.Token;

public interface TokenService {
    Token getByUsername(String username);

    int save(Token token);

    void delete(String username);
}