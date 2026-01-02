package com.example.bulkemail.api;

import com.example.bulkemail.dto.AuthDtos;
import com.example.bulkemail.service.AuthService;
import com.example.bulkemail.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/auth", "/public/auth"})
@Tag(name = "Auth")
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public AuthDtos.LoginResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/bootstrap")
    public AuthDtos.LoginResponse bootstrap(@Valid @RequestBody AuthDtos.UserCreateRequest request) {
        if (userService.hasAnyUser()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Users already exist");
        }
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            request.setRoles(java.util.Set.of("SUPER_ADMIN"));
        }
        userService.create(request);
        AuthDtos.LoginRequest loginRequest = new AuthDtos.LoginRequest();
        loginRequest.setEmail(request.getEmail());
        loginRequest.setPassword(request.getPassword());
        return authService.login(loginRequest);
    }

    @PostMapping("/forgot-password")
    public void forgotPassword(@Valid @RequestBody AuthDtos.ForgotPasswordRequest request) {
        userService.requestPasswordReset(request.getEmail());
    }

    @PostMapping("/reset-password")
    public void resetPassword(@Valid @RequestBody AuthDtos.ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
    }
}
