package com.hotel.booking.dto;

import java.time.LocalDate;
import java.util.List;

public class AvailabilityResponse {
    private Long hotelId;
    private String hotelName;
    private List<LocalDate> availableDates;
    private List<LocalDate> bookedDates;

    public AvailabilityResponse() {}

    public AvailabilityResponse(Long hotelId, String hotelName, List<LocalDate> availableDates, List<LocalDate> bookedDates) {
        this.hotelId = hotelId;
        this.hotelName = hotelName;
        this.availableDates = availableDates;
        this.bookedDates = bookedDates;
    }

    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }
    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }
    public List<LocalDate> getAvailableDates() { return availableDates; }
    public void setAvailableDates(List<LocalDate> availableDates) { this.availableDates = availableDates; }
    public List<LocalDate> getBookedDates() { return bookedDates; }
    public void setBookedDates(List<LocalDate> bookedDates) { this.bookedDates = bookedDates; }
}
