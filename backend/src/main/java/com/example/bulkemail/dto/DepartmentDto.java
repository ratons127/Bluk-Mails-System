package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class DepartmentDto {
    @Schema(example = "12")
    private Long id;

    @Schema(example = "Engineering")
    private String name;

    @Schema(example = "3")
    private Long parentId;
}
