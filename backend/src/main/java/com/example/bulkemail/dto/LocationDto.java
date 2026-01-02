package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class LocationDto {
    @Schema(example = "2")
    private Long id;

    @Schema(example = "New York")
    private String name;
}
