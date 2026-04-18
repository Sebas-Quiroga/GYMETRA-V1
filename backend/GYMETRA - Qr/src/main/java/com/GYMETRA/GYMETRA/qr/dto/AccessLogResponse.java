package com.GYMETRA.GYMETRA.qr.dto;

import com.GYMETRA.GYMETRA.qr.entity.AccessLog;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for AccessLog responses.
 */
@Data
@NoArgsConstructor
public class AccessLogResponse {
    private Long logId;
    private Long userId;
    private Long qrId;
    private Long branchId;
    private String result;
    private String notes;
    private LocalDateTime eventTs;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private Long durationInHours;

    public AccessLogResponse(AccessLog log) {
        this.logId = log.getLogId();
        this.userId = log.getUserId();
        this.qrId = log.getQrId();
        this.branchId = log.getBranchId();
        this.result = log.getResult();
        this.notes = log.getNotes();
        this.eventTs = log.getEventTs();
        this.entryTime = log.getEntryTime();
        this.exitTime = log.getExitTime();
        this.durationInHours = log.getDurationInHours();
    }
}
