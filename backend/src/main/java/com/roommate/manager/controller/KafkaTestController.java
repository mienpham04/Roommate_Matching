package com.roommate.manager.controller;

import com.roommate.manager.kafka.KafkaProducerService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/kafka")
public class KafkaTestController {

    private final KafkaProducerService kafkaProducerService;
    // @Autowired
    // private KafkaTemplate<String, Object> kafkaTemplate;


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

    // @PostMapping("/send-score")
    // public String sendScoreTest(@RequestBody Map<String, Object> body) {
    //     kafkaTemplate.send("match.score.updated", body.get("userId").toString(), body);
    //     return "Test event sent!";
    // }
}
