package com.sims.server.dto;

import java.util.List;

public class ImportResultDTO {

    private int successCount;
    private int errorCount;
    private List<String> errors;

    public ImportResultDTO(int successCount, int errorCount, List<String> errors) {
        this.successCount = successCount;
        this.errorCount = errorCount;
        this.errors = errors;
    }

    public int getSuccessCount() { return successCount; }
    public int getErrorCount() { return errorCount; }
    public List<String> getErrors() { return errors; }
}
