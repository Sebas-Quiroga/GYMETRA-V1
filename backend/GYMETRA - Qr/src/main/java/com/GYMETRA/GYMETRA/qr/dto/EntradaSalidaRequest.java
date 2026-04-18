package com.GYMETRA.GYMETRA.qr.dto;

import lombok.Data;

/**
 * Data Transfer Object for entrance and exit requests.
 */
@Data
public class EntradaSalidaRequest {
    private Long userId;
    private Long branchId;
}
