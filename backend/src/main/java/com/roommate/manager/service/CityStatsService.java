package com.roommate.manager.service;

import com.roommate.manager.model.UserModel;
import com.roommate.manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class CityStatsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // In-memory city count storage
    private final ConcurrentHashMap<String, Integer> cityCounts = new ConcurrentHashMap<>();

    /**
     * Initialize city counts from database on startup
     */
    @PostConstruct
    public void initializeCityCounts() {
        System.out.println("Initializing city statistics...");
        List<UserModel> allUsers = userRepository.findAll();

        for (UserModel user : allUsers) {
            String city = user.getCity();
            if (city != null && !city.trim().isEmpty()) {
                cityCounts.merge(city, 1, Integer::sum);
            }
        }

        System.out.println("City statistics initialized: " + cityCounts.size() + " cities");
    }

    /**
     * Handle user city update (from Kafka event)
     */
    public void handleCityUpdate(String oldCity, String newCity) {
        boolean updated = false;

        // Decrement old city count
        if (oldCity != null && !oldCity.trim().isEmpty()) {
            cityCounts.computeIfPresent(oldCity, (k, v) -> {
                int newCount = v - 1;
                return newCount > 0 ? newCount : null; // Remove if count reaches 0
            });
            updated = true;
        }

        // Increment new city count
        if (newCity != null && !newCity.trim().isEmpty()) {
            cityCounts.merge(newCity, 1, Integer::sum);
            updated = true;
        }

        // Broadcast updated stats if changed
        if (updated) {
            broadcastCityStats();
        }
    }

    /**
     * Get top N cities by user count
     */
    public List<Map<String, Object>> getTopCities(int limit) {
        return cityCounts.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(limit)
            .map(entry -> Map.of(
                "city", (Object) entry.getKey(),
                "count", (Object) entry.getValue()
            ))
            .collect(Collectors.toList());
    }

    /**
     * Broadcast city statistics to all connected clients
     */
    public void broadcastCityStats() {
        List<Map<String, Object>> topCities = getTopCities(10);

        Map<String, Object> message = new HashMap<>();
        message.put("topCities", topCities);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/city-stats", message);
        System.out.println("Broadcasted city stats update: " + topCities.size() + " cities");
    }

    /**
     * Get current city counts (for API endpoint)
     */
    public Map<String, Integer> getAllCityCounts() {
        return new HashMap<>(cityCounts);
    }
}
