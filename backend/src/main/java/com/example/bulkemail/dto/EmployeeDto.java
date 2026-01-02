package com.example.bulkemail.dto;

import com.example.bulkemail.entity.EmployeeStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class EmployeeDto {
    @Schema(example = "42")
    private Long id;

    @Schema(example = "alex.chen@example.com")
    private String email;

    @Schema(example = "Alex Chen")
    private String fullName;

    @Schema(example = "Senior Engineer")
    private String title;

    @Schema(example = "+1-415-555-0101")
    private String whatsappNumber;

    private EmployeeStatus status;

    @Schema(example = "12")
    private Long departmentId;

    @Schema(example = "3")
    private Long locationId;

    @Schema(example = "EMP001")
    private String externalId;
}
