package com.roommate.manager.controller;

import com.roommate.manager.service.CityStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/city-stats")
@CrossOrigin(originPatterns = "*", allowCredentials = "false")
public class CityStatsController {

    @Autowired
    private CityStatsService cityStatsService;

    /**
     * Get top cities by user count
     */
    @GetMapping("/top")
    public ResponseEntity<Map<String, Object>> getTopCities(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Map<String, Object>> topCities = cityStatsService.getTopCities(limit);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "topCities", topCities,
                "count", topCities.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to fetch city statistics",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get all city counts
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllCityCounts() {
        try {
            Map<String, Integer> cityCounts = cityStatsService.getAllCityCounts();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "cityCounts", cityCounts,
                "totalCities", cityCounts.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to fetch city counts",
                "message", e.getMessage()
            ));
        }
    }
}
