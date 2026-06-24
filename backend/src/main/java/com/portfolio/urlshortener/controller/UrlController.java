package com.portfolio.urlshortener.controller;

import com.portfolio.urlshortener.dto.UrlRequestDTO;
import com.portfolio.urlshortener.dto.UrlResponseDTO;
import com.portfolio.urlshortener.service.UrlShortenerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Managing URL operations and redirects.
 */
@RestController
@CrossOrigin(origins = "*") // Allow generic cross-origin requests for simple client deployment
public class UrlController {

    private final UrlShortenerService urlShortenerService;

    public UrlController(UrlShortenerService urlShortenerService) {
        this.urlShortenerService = urlShortenerService;
    }

    /**
     * Creates a shortened code mapping for the referenced URL.
     */
    @PostMapping("/api/urls")
    public ResponseEntity<UrlResponseDTO> shortenUrl(@Valid @RequestBody UrlRequestDTO request) {
        UrlResponseDTO response = urlShortenerService.shortenUrl(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Lists all shortened mappings generated inside the service database.
     */
    @GetMapping("/api/urls")
    public ResponseEntity<List<UrlResponseDTO>> getAllUrls() {
        List<UrlResponseDTO> urls = urlShortenerService.getAllUrls();
        return ResponseEntity.ok(urls);
    }

    /**
     * Redirects short URLs directly into their target URLs in the browser.
     */
    @GetMapping("/r/{shortKey}")
    public RedirectView redirectToOriginalUrl(@PathVariable String shortKey) {
        String originalUrl = urlShortenerService.getOriginalUrl(shortKey);
        RedirectView redirectView = new RedirectView();
        redirectView.setUrl(originalUrl);
        return redirectView;
    }

    /**
     * Local Exception Handler for binding arguments and runtime validation errors.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleInvalidArgument(IllegalArgumentException ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "An internal server error occurred: " + ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
