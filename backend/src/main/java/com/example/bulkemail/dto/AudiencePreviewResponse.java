package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
public class AudiencePreviewResponse {
    @Schema(example = "350")
    private long count;

    private List<EmployeeDto> sample;
}
