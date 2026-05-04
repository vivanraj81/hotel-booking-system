package com.hotel.booking.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserLookupRepository {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public UserLookupRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<Long> findUserIdByUsername(String username) {
        try {
            Long id = jdbcTemplate.queryForObject(
                    "SELECT id FROM users WHERE username = ?",
                    Long.class, username);
            return Optional.ofNullable(id);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
