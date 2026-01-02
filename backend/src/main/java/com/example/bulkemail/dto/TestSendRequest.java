package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class TestSendRequest {
    @NotEmpty
    @Schema(example = "[\"test1@example.com\",\"test2@example.com\"]")
    private List<String> recipients;
}
