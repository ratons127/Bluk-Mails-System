package com.example.bulkemail.service;

import com.example.bulkemail.dto.AuthDtos;
import com.example.bulkemail.entity.AppUser;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AuthService {
    private final UserService userService;
    private final JwtEncoder jwtEncoder;

    public AuthService(UserService userService, JwtEncoder jwtEncoder) {
        this.userService = userService;
        this.jwtEncoder = jwtEncoder;
    }

    public AuthDtos.LoginResponse login(AuthDtos.LoginRequest request) {
        AppUser user = userService.authenticate(request.getEmail(), request.getPassword());
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(user.getEmail())
                .claim("email", user.getEmail())
                .claim("name", user.getFullName())
                .claim("roles", user.getRoles())
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.DAYS))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        AuthDtos.LoginResponse response = new AuthDtos.LoginResponse();
        response.setToken(token);
        response.setUser(userService.toResponse(user));
        return response;
    }
}
