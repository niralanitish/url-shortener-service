package com.portfolio.urlshortener.repository;

import com.portfolio.urlshortener.entity.UrlMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for database transactions on the {@link UrlMapping} entity.
 */
@Repository
public interface UrlRepository extends JpaRepository<UrlMapping, Long> {

    /**
     * Finds a URL mapping by its unique short alphanumeric key.
     * @param shortKey the short key to lookup
     * @return an Optional holding the mapping if found, or empty
     */
    Optional<UrlMapping> findByShortKey(String shortKey);

    /**
     * Checks if a specific short key already exists in the database.
     * @param shortKey the short key to check
     * @return true if the key exists, false otherwise
     */
    boolean existsByShortKey(String shortKey);

    /**
     * Retrieves all URL mappings ordered by creation date descending.
     * This is useful for exhibiting the latest shortened URLs on the dashboard.
     * @return list of URL mappings sorted latest first
     */
    List<UrlMapping> findAllByOrderByCreatedAtDesc();
}
