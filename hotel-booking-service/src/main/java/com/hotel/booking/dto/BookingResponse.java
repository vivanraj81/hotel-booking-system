package com.hotel.booking.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

public class BookingResponse {
    private Long id;
    private Long hotelId;
    private String hotelName;
    private String username;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reservedDate;

    private Double amountPaid;
    private boolean success;
    private String message;

    public BookingResponse() {}

    public BookingResponse(Long id, Long hotelId, String hotelName, String username,
                           LocalDate reservedDate, Double amountPaid, boolean success, String message) {
        this.id = id;
        this.hotelId = hotelId;
        this.hotelName = hotelName;
        this.username = username;
        this.reservedDate = reservedDate;
        this.amountPaid = amountPaid;
        this.success = success;
        this.message = message;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }
    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public LocalDate getReservedDate() { return reservedDate; }
    public void setReservedDate(LocalDate reservedDate) { this.reservedDate = reservedDate; }
    public Double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(Double amountPaid) { this.amountPaid = amountPaid; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
