package com.hotel.auth.exception;

public class BadCredentialsAppException extends RuntimeException {
    public BadCredentialsAppException(String message) {
        super(message);
    }
}
