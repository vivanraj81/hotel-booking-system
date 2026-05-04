package com.hotel.booking.controller;

import com.hotel.booking.dto.AvailabilityResponse;
import com.hotel.booking.dto.HotelDto;
import com.hotel.booking.service.HotelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hotels")
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @GetMapping
    public ResponseEntity<List<HotelDto>> getAllHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<AvailabilityResponse> getAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getAvailability(id));
    }
}
