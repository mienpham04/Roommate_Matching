package com.roommate.manager.controller;

import com.roommate.manager.kafka.KafkaProducerService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/kafka")
public class KafkaTestController {

    private final KafkaProducerService kafkaProducerService;

    public KafkaTestController(KafkaProducerService kafkaProducerService) {
        this.kafkaProducerService = kafkaProducerService;
    }

    @PostMapping("/send")
    public String sendMessage(@RequestParam String topic, @RequestParam String message) {
        kafkaProducerService.sendMessage(topic, message);
        return "Message sent to topic: " + topic;
    }

    @PostMapping("/send-event")
    public String sendRoommateEvent(@RequestParam String userId, @RequestParam String action) {
        Map<String, String> event = new HashMap<>();
        event.put("userId", userId);
        event.put("action", action);
        event.put("timestamp", String.valueOf(System.currentTimeMillis()));

        kafkaProducerService.sendMessage("user_lifestyle", userId, event);
        return "Roommate event sent!";
    }
}
