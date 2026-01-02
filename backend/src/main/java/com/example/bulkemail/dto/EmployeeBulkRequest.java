package com.example.bulkemail.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class EmployeeBulkRequest {
    @NotEmpty
    private List<Long> ids;

    @NotNull
    private EmployeeBulkAction action;
}
