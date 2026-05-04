package com.hotel.booking.service;

import com.hotel.booking.dto.AvailabilityResponse;
import com.hotel.booking.dto.HotelDto;
import com.hotel.booking.entity.Hotel;
import com.hotel.booking.exception.ResourceNotFoundException;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.HotelRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class HotelService {

    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;

    public HotelService(HotelRepository hotelRepository, BookingRepository bookingRepository) {
        this.hotelRepository = hotelRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<HotelDto> getAllHotels() {
        return hotelRepository.findAll().stream()
                .map(h -> new HotelDto(h.getId(), h.getName(), h.getPrice()))
                .collect(Collectors.toList());
    }

    public AvailabilityResponse getAvailability(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + hotelId));

        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(6);

        List<LocalDate> next7Days = Stream.iterate(today, d -> d.plusDays(1))
                .limit(7)
                .collect(Collectors.toList());

        Set<LocalDate> bookedDates = bookingRepository
                .findByHotelIdAndReservedDateBetween(hotelId, today, end)
                .stream()
                .map(b -> b.getReservedDate())
                .collect(Collectors.toCollection(HashSet::new));

        List<LocalDate> available = next7Days.stream()
                .filter(d -> !bookedDates.contains(d))
                .collect(Collectors.toList());

        return new AvailabilityResponse(
                hotel.getId(), hotel.getName(), available, List.copyOf(bookedDates)
        );
    }
}
