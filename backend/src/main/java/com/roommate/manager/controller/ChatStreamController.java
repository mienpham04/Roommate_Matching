package com.roommate.manager.controller;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@Component
@RequestMapping("/api/chat")
@CrossOrigin(originPatterns = "*", allowCredentials = "false")
public class ChatStreamController {

    // Map of userId -> list of SSE emitters for that user
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    /**
     * Subscribe to chat events for a specific user
     * GET /api/chat/stream/{userId}
     */
    @GetMapping(value = "/stream/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChatEvents(@PathVariable String userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); // No timeout

        // Add emitter to user's list
        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        System.out.println("✅ Chat SSE client connected for user: " + userId + ". Total connections: " + getTotalConnections());

        emitter.onCompletion(() -> {
            removeEmitter(userId, emitter);
            System.out.println("🔌 Chat SSE client disconnected (completion) for user: " + userId + ". Total: " + getTotalConnections());
        });
        emitter.onTimeout(() -> {
            removeEmitter(userId, emitter);
            System.out.println("⏰ Chat SSE client disconnected (timeout) for user: " + userId + ". Total: " + getTotalConnections());
        });
        emitter.onError((e) -> {
            removeEmitter(userId, emitter);
            System.out.println("❌ Chat SSE client disconnected (error) for user: " + userId + ": " + e.getMessage() + ". Total: " + getTotalConnections());
        });

        return emitter;
    }

    /**
     * Broadcast new message to specific user (recipient)
     */
    public void broadcastNewMessage(String recipientId, Map<String, Object> messageData) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(recipientId);
        if (emitters == null || emitters.isEmpty()) {
            System.out.println("📭 No active SSE connections for user: " + recipientId);
            return;
        }

        System.out.println("📢 Broadcasting new message to user " + recipientId + " (" + emitters.size() + " connections)");

        sendToEmitters(emitters, "new-message", messageData, recipientId);
    }

    /**
     * Broadcast read receipt to specific user (sender)
     */
    public void broadcastReadReceipt(String senderId, Map<String, Object> readReceiptData) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(senderId);
        if (emitters == null || emitters.isEmpty()) {
            System.out.println("📭 No active SSE connections for user: " + senderId);
            return;
        }

        System.out.println("📢 Broadcasting read receipt to user " + senderId + " (" + emitters.size() + " connections)");

        sendToEmitters(emitters, "message-read", readReceiptData, senderId);
    }

    /**
     * Broadcast message deletion to ALL users (they filter by conversationId on frontend)
     */
    public void broadcastMessageDeleted(String conversationId, Map<String, Object> deletionData) {
        System.out.println("📢 Broadcasting message deletion for conversation " + conversationId);

        int totalSent = 0;

        // Broadcast to all connected users (they'll filter by conversationId on frontend)
        for (Map.Entry<String, CopyOnWriteArrayList<SseEmitter>> entry : userEmitters.entrySet()) {
            String userId = entry.getKey();
            CopyOnWriteArrayList<SseEmitter> emitters = entry.getValue();

            if (emitters != null && !emitters.isEmpty()) {
                sendToEmitters(emitters, "message-deleted", deletionData, userId);
                totalSent += emitters.size();
            }
        }

        System.out.println("✉️ Broadcasted message deletion to " + totalSent + " total connections");
    }

    /**
     * Helper method to send events to emitters
     */
    private void sendToEmitters(CopyOnWriteArrayList<SseEmitter> emitters, String eventName, Map<String, Object> data, String userId) {
        int successCount = 0;
        CopyOnWriteArrayList<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
                successCount++;
            } catch (IllegalStateException | IOException e) {
                deadEmitters.add(emitter);
                if (!e.getMessage().contains("Broken pipe") && !e.getMessage().contains("Connection reset")) {
                    System.out.println("⚠️ Failed to send to client: " + e.getMessage());
                }
            } catch (Exception e) {
                deadEmitters.add(emitter);
                System.out.println("❌ Unexpected error sending to client: " + e.getMessage());
            }
        }

        // Remove dead emitters
        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
            if (emitters.isEmpty()) {
                userEmitters.remove(userId);
            }
            System.out.println("🧹 Removed " + deadEmitters.size() + " dead connections for user " + userId);
        }

        if (successCount > 0) {
            System.out.println("✉️ Successfully sent " + eventName + " to " + successCount + " clients");
        }
    }

    /**
     * Remove emitter from user's list
     */
    private void removeEmitter(String userId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                userEmitters.remove(userId);
            }
        }
    }

    /**
     * Get total number of active connections across all users
     */
    private int getTotalConnections() {
        return userEmitters.values().stream().mapToInt(CopyOnWriteArrayList::size).sum();
    }

    /**
     * Get number of active connections for a specific user
     */
    public int getUserConnections(String userId) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(userId);
        return emitters == null ? 0 : emitters.size();
    }
}
