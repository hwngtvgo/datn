package com.hungtv.toeic.be.payload.response;

import java.util.Objects;

public class FileUploadResponse {
    private String fileName;
    private String fileDownloadUri;
    private String fileViewUri;
    private String fileType;
    private long size;
    private String filePath;
    private boolean success;
    private String message;
    
    // Default constructor
    public FileUploadResponse() {
    }
    
    // Full constructor
    public FileUploadResponse(String fileName, String fileDownloadUri, String fileViewUri, 
                              String fileType, long size, String filePath, 
                              boolean success, String message) {
        this.fileName = fileName;
        this.fileDownloadUri = fileDownloadUri;
        this.fileViewUri = fileViewUri;
        this.fileType = fileType;
        this.size = size;
        this.filePath = filePath;
        this.success = success;
        this.message = message;
    }
    
    // Constructor cho trường hợp upload thành công
    public FileUploadResponse(String fileName, String fileDownloadUri, String fileViewUri, 
                              String fileType, long size, String filePath) {
        this.fileName = fileName;
        this.fileDownloadUri = fileDownloadUri;
        this.fileViewUri = fileViewUri;
        this.fileType = fileType;
        this.size = size;
        this.filePath = filePath;
        this.success = true;
        this.message = "Upload thành công";
    }
    
    // Getter và Setter
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileDownloadUri() {
        return fileDownloadUri;
    }

    public void setFileDownloadUri(String fileDownloadUri) {
        this.fileDownloadUri = fileDownloadUri;
    }

    public String getFileViewUri() {
        return fileViewUri;
    }

    public void setFileViewUri(String fileViewUri) {
        this.fileViewUri = fileViewUri;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
    
    // equals và hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FileUploadResponse that = (FileUploadResponse) o;
        return size == that.size && 
               success == that.success && 
               Objects.equals(fileName, that.fileName) && 
               Objects.equals(fileDownloadUri, that.fileDownloadUri) && 
               Objects.equals(fileViewUri, that.fileViewUri) && 
               Objects.equals(fileType, that.fileType) && 
               Objects.equals(filePath, that.filePath) && 
               Objects.equals(message, that.message);
    }

    @Override
    public int hashCode() {
        return Objects.hash(fileName, fileDownloadUri, fileViewUri, fileType, size, filePath, success, message);
    }
    
    // toString
    @Override
    public String toString() {
        return "FileUploadResponse{" +
                "fileName='" + fileName + '\'' +
                ", fileDownloadUri='" + fileDownloadUri + '\'' +
                ", fileViewUri='" + fileViewUri + '\'' +
                ", fileType='" + fileType + '\'' +
                ", size=" + size +
                ", filePath='" + filePath + '\'' +
                ", success=" + success +
                ", message='" + message + '\'' +
                '}';
    }
}