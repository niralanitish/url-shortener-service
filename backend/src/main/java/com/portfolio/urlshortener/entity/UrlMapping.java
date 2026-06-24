package com.portfolio.urlshortener.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity class representing a shortened URL mapping in the database.
 */
@Entity
@Table(name = "url_mappings", indexes = {
    @Index(name = "idx_short_key", columnList = "shortKey", unique = true)
})
public class UrlMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String shortKey;

    @Column(nullable = false, length = 2083) // standard maximum URL length
    private String originalUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Default constructor (required by JPA)
    public UrlMapping() {
    }

    // Parameterized constructor
    public UrlMapping(String shortKey, String originalUrl) {
        this.shortKey = shortKey;
        this.originalUrl = originalUrl;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
