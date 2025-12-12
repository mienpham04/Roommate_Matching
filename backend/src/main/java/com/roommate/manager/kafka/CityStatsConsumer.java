package com.roommate.manager.kafka;

import com.roommate.manager.model.events.CityUpdateEvent;
import com.roommate.manager.service.CityStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class CityStatsConsumer {

    @Autowired
    private CityStatsService cityStatsService;

    @KafkaListener(topics = "city.updates", groupId = "city-stats-handler")
    public void handleCityUpdate(CityUpdateEvent event) {
        System.out.println("Received city update event: " + event.getEventType() +
                         " - Old: " + event.getOldCity() + ", New: " + event.getNewCity());

        switch (event.getEventType()) {
            case "USER_CREATED":
                cityStatsService.handleCityUpdate(null, event.getNewCity());
                break;

            case "USER_UPDATED":
                cityStatsService.handleCityUpdate(event.getOldCity(), event.getNewCity());
                break;

            case "USER_DELETED":
                cityStatsService.handleCityUpdate(event.getOldCity(), null);
                break;

            default:
                System.err.println("Unknown city update event type: " + event.getEventType());
        }
    }
}
