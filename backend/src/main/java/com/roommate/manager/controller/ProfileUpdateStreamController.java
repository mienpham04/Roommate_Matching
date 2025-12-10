package com.roommate.manager.controller;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@Component
@RequestMapping("/api/profile-updates")
@CrossOrigin(originPatterns = "*", allowCredentials = "false")
public class ProfileUpdateStreamController {

    // Store active SSE connections
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamProfileUpdates() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); // No timeout

        emitters.add(emitter);
        System.out.println("✅ New SSE client connected. Total clients: " + emitters.size());

        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            System.out.println("🔌 SSE client disconnected (completion). Total clients: " + emitters.size());
        });
        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            System.out.println("⏰ SSE client disconnected (timeout). Total clients: " + emitters.size());
        });
        emitter.onError((e) -> {
            emitters.remove(emitter);
            System.out.println("❌ SSE client disconnected (error): " + e.getMessage() + ". Total clients: " + emitters.size());
        });

        return emitter;
    }

    /**
     * Broadcast profile update to all connected clients
     * Call this method when a user updates their profile
     */
    public void broadcastProfileUpdate(String userId, String firstName, String lastName, String updateType) {
        Map<String, String> update = Map.of(
            "userId", userId,
            "firstName", firstName,
            "lastName", lastName,
            "updateType", updateType,
            "timestamp", String.valueOf(System.currentTimeMillis())
        );

        System.out.println("📢 Broadcasting profile update to " + emitters.size() + " clients: " + update);

        int successCount = 0;
        int removedCount = 0;
        CopyOnWriteArrayList<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                    .name("profile-update")
                    .data(update));
                successCount++;
            } catch (IllegalStateException | IOException e) {
                // Connection is broken - mark for removal
                deadEmitters.add(emitter);
                removedCount++;
                // Only log if it's not a common disconnect error
                if (!e.getMessage().contains("Broken pipe") && !e.getMessage().contains("Connection reset")) {
                    System.out.println("⚠️ Failed to send to client: " + e.getMessage());
                }
            } catch (Exception e) {
                // Unexpected error
                deadEmitters.add(emitter);
                removedCount++;
                System.out.println("❌ Unexpected error sending to client: " + e.getMessage());
            }
        }

        // Remove dead emitters
        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
            System.out.println("🧹 Removed " + removedCount + " dead connections. Successfully sent to " + successCount + " clients. Active: " + emitters.size());
        } else if (successCount > 0) {
            System.out.println("✉️ Successfully sent update to " + successCount + " clients");
        }
    }

    public int getActiveConnections() {
        return emitters.size();
    }
}
