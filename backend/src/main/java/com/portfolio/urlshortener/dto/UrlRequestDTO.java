package com.portfolio.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for shortening requests.
 */
public class UrlRequestDTO {

    @NotBlank(message = "Original URL cannot be blank")
    @Size(max = 2083, message = "URL is too long. Maximum allowed size is 2083 characters")
    private String originalUrl;

    // Constructors
    public UrlRequestDTO() {
    }

    public UrlRequestDTO(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    // Getters and Setters
    public String getOriginalUrl() {
        return originalUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }
}
