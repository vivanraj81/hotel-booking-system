package com.hotel.booking.service;

import com.hotel.booking.dto.BookingRequest;
import com.hotel.booking.dto.BookingResponse;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Hotel;
import com.hotel.booking.exception.BookingConflictException;
import com.hotel.booking.exception.InvalidBookingException;
import com.hotel.booking.exception.ResourceNotFoundException;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.HotelRepository;
import com.hotel.booking.repository.UserLookupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final UserLookupRepository userLookupRepository;

    public BookingService(BookingRepository bookingRepository,
                          HotelRepository hotelRepository,
                          UserLookupRepository userLookupRepository) {
        this.bookingRepository = bookingRepository;
        this.hotelRepository = hotelRepository;
        this.userLookupRepository = userLookupRepository;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String username) {
        // Validate date window: must be within the next 7 days (today .. today+6)
        LocalDate today = LocalDate.now();
        LocalDate maxDate = today.plusDays(6);
        if (request.getDate().isBefore(today) || request.getDate().isAfter(maxDate)) {
            throw new InvalidBookingException(
                    "Booking date must be within the next 7 days (" + today + " to " + maxDate + ")");
        }

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + request.getHotelId()));

        bookingRepository.findByHotelIdAndReservedDate(request.getHotelId(), request.getDate())
                .ifPresent(b -> {
                    throw new BookingConflictException("Date already booked for this hotel");
                });

        Long userId = userLookupRepository.findUserIdByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Booking booking = new Booking(
                hotel.getId(), userId, username, request.getDate(), hotel.getPrice()
        );
        Booking saved = bookingRepository.save(booking);

        String message = "Your booking for the Hotel " + hotel.getName() + " is successful";
        return new BookingResponse(
                saved.getId(), hotel.getId(), hotel.getName(), username,
                saved.getReservedDate(), saved.getAmountPaid(), true, message
        );
    }

    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllByOrderByReservedDateDesc();

        Map<Long, String> hotelNames = hotelRepository.findAll().stream()
                .collect(Collectors.toMap(Hotel::getId, Hotel::getName));

        return bookings.stream()
                .map(b -> new BookingResponse(
                        b.getId(),
                        b.getHotelId(),
                        hotelNames.getOrDefault(b.getHotelId(), "Unknown"),
                        b.getUsername(),
                        b.getReservedDate(),
                        b.getAmountPaid(),
                        true,
                        null
                ))
                .collect(Collectors.toList());
    }
}
