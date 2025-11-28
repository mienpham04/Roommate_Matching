package com.roommate.manager.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.roommate.manager.kafka.KafkaProducerService;
import com.roommate.manager.model.events.PreferenceUpdateEvent;

@RestController
@RequestMapping("/api/preferences")
public class PreferenceController {

    @Autowired
    private KafkaProducerService producerService;

    @PostMapping("/update")
    public ResponseEntity<?> updatePreferences(@RequestBody Map<String, Object> request) {

        String userId = request.get("userId").toString();
        Map<String, Object> prefs = (Map<String, Object>) request.get("preferences");

        PreferenceUpdateEvent event = new PreferenceUpdateEvent(userId, prefs);

        producerService.sendPreferenceUpdated(event);

        return ResponseEntity.ok("Preferences updated + event published");
    }
}
