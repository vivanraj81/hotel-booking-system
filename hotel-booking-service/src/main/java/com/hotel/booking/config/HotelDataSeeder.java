package com.hotel.booking.config;

import com.hotel.booking.entity.Hotel;
import com.hotel.booking.repository.HotelRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class HotelDataSeeder implements CommandLineRunner {

    private final HotelRepository hotelRepository;

    public HotelDataSeeder(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    @Override
    public void run(String... args) {
        if (hotelRepository.count() == 0) {
            List<Hotel> hotels = List.of(
                    new Hotel("Grand Marquis Resort", 8500.00),
                    new Hotel("The Velvet Orchid", 12200.00),
                    new Hotel("Skyline Suites", 5400.00),
                    new Hotel("Ocean Pearl Hotel", 9750.00),
                    new Hotel("Mountain Mirage Lodge", 6300.00),
                    new Hotel("The Brass Compass Inn", 4200.00)
            );
            hotelRepository.saveAll(hotels);
            System.out.println(">> Seeded " + hotels.size() + " hotels");
        }
    }
}
