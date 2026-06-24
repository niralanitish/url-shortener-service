package com.portfolio.urlshortener.service;

import com.portfolio.urlshortener.dto.UrlRequestDTO;
import com.portfolio.urlshortener.dto.UrlResponseDTO;
import com.portfolio.urlshortener.entity.UrlMapping;
import com.portfolio.urlshortener.repository.UrlRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;
import java.net.URL;
import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class implementing the core business logic for the URL shortener.
 */
@Service
public class UrlShortenerService {

    private final UrlRepository urlRepository;

    // Characters allowed in the short URL key (alphanumeric Base62 configuration)
    private static final String BASE62_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int SHORT_KEY_LENGTH = 6;
    private static final SecureRandom secureRandom = new SecureRandom();

    // The base domain deployed on Render or local, used to format full short URLs.
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public UrlShortenerService(UrlRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    /**
     * Creates a new shortened URL mapping.
     */
    @Transactional
    public UrlResponseDTO shortenUrl(UrlRequestDTO request) {
        String originalUrl = sanitizeAndValidateUrl(request.getOriginalUrl());

        // Generate a unique key with collision prevention
        String shortKey = generateUniqueShortKey();

        // Save mapping to repository
        UrlMapping mapping = new UrlMapping(shortKey, originalUrl);
        UrlMapping savedMapping = urlRepository.save(mapping);

        return convertToResponseDTO(savedMapping);
    }

    /**
     * Resolves a short key to its original URL.
     */
    @Transactional(readOnly = true)
    public String getOriginalUrl(String shortKey) {
        UrlMapping mapping = urlRepository.findByShortKey(shortKey)
                .orElseThrow(() -> new IllegalArgumentException("Short URL key not found: " + shortKey));
        return mapping.getOriginalUrl();
    }

    /**
     * Returns all shortened URLs, newest first.
     */
    @Transactional(readOnly = true)
    public List<UrlResponseDTO> getAllUrls() {
        return urlRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Generates a random Base62 alphanumeric string of standard length.
     * Checks database for collisions and retries if a match exists.
     */
    private String generateUniqueShortKey() {
        String shortKey;
        int attempts = 0;
        do {
            if (attempts > 10) {
                // Fail-safe to avoid infinite loops if constraints are overfilled
                throw new IllegalStateException("Unable to generate unique short key. Database namespace exhausted.");
            }
            StringBuilder sb = new StringBuilder(SHORT_KEY_LENGTH);
            for (int i = 0; i < SHORT_KEY_LENGTH; i++) {
                sb.append(BASE62_CHARS.charAt(secureRandom.nextInt(BASE62_CHARS.length())));
            }
            shortKey = sb.toString();
            attempts++;
        } while (urlRepository.existsByShortKey(shortKey));

        return shortKey;
    }

    /**
     * Normalizes and checks format of the URL to ensure it represents HTTP or HTTPS.
     */
    private String sanitizeAndValidateUrl(String rawUrl) {
        String urlString = rawUrl.trim();

        // Prepend http:// protocol if lacking to support direct browser usage
        if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
            urlString = "https://" + urlString;
        }

        try {
            // Check if string is a valid URL
            new URL(urlString);
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Invalid URL format: " + rawUrl);
        }

        return urlString;
    }

    /**
     * Converts a DB Entity to the responsive presentation-level DTO.
     */
    private UrlResponseDTO convertToResponseDTO(UrlMapping mapping) {
        // Construct the full short URL: base host URL append shortKey
        String fullShortUrl = baseUrl + "/r/" + mapping.getShortKey();
        return new UrlResponseDTO(
                mapping.getShortKey(),
                mapping.getOriginalUrl(),
                fullShortUrl,
                mapping.getCreatedAt()
        );
    }
}
