package com.example.bulkemail.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

public final class SecurityUtil {
    private SecurityUtil() {
    }

    public static String currentEmail() {
        Jwt jwt = currentJwt();
        if (jwt == null) {
            return "unknown";
        }
        String email = jwt.getClaimAsString("email");
        return email != null ? email : jwt.getSubject();
    }

    public static String currentName() {
        Jwt jwt = currentJwt();
        if (jwt == null) {
            return null;
        }
        String name = jwt.getClaimAsString("name");
        return name != null ? name : jwt.getClaimAsString("preferred_username");
    }

    public static List<String> currentRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return List.of();
        }
        return auth.getAuthorities().stream().map(a -> a.getAuthority().replace("ROLE_", "")).toList();
    }

    private static Jwt currentJwt() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt;
        }
        return null;
    }
}
