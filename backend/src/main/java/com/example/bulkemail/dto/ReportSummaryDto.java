package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class ReportSummaryDto {
    @Schema(example = "2500")
    private long queued;

    @Schema(example = "2000")
    private long sent;

    @Schema(example = "50")
    private long failed;
}
