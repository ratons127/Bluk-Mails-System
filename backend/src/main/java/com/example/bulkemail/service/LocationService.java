package com.example.bulkemail.service;

import com.example.bulkemail.dto.LocationDto;
import com.example.bulkemail.entity.Location;
import com.example.bulkemail.repo.LocationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationService {
    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public LocationDto create(LocationDto dto) {
        Location location = new Location();
        location.setName(dto.getName());
        Location saved = locationRepository.save(location);
        return toDto(saved);
    }

    public LocationDto update(Long id, LocationDto dto) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Location not found"));
        location.setName(dto.getName());
        return toDto(locationRepository.save(location));
    }

    public void delete(Long id) {
        locationRepository.deleteById(id);
    }

    public List<LocationDto> list() {
        return locationRepository.findAll().stream().map(this::toDto).toList();
    }

    public LocationDto toDto(Location location) {
        LocationDto dto = new LocationDto();
        dto.setId(location.getId());
        dto.setName(location.getName());
        return dto;
    }
}
