package com.portfolio.urlshortener.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object containing URL details returned to the API clients.
 */
public class UrlResponseDTO {

    private String shortKey;
    private String originalUrl;
    private String shortUrl;
    private LocalDateTime createdAt;

    // Constructors
    public UrlResponseDTO() {
    }

    public UrlResponseDTO(String shortKey, String originalUrl, String shortUrl, LocalDateTime createdAt) {
        this.shortKey = shortKey;
        this.originalUrl = originalUrl;
        this.shortUrl = shortUrl;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getShortKey() {
        return shortKey;
    }

    public void setShortKey(String shortKey) {
        this.shortKey = shortKey;
    }

    public String getOriginalUrl() {
        return originalUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public String getShortUrl() {
        return shortUrl;
    }

    public void setShortUrl(String shortUrl) {
        this.shortUrl = shortUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
