package com.roommate.manager.controller;

import com.roommate.manager.kafka.KafkaProducerService;
import com.roommate.manager.model.ConversationModel;
import com.roommate.manager.model.MessageModel;
import com.roommate.manager.model.events.MessageEvent;
import com.roommate.manager.model.events.MessageReadEvent;
import com.roommate.manager.model.events.MessageDeleteEvent;
import com.roommate.manager.repository.ConversationRepository;
import com.roommate.manager.repository.MessageRepository;
import com.roommate.manager.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private KafkaProducerService kafkaProducerService;

    /**
     * Send a message
     * POST /api/chat/send
     * Body: { "senderId": "user123", "recipientId": "user456", "content": "Hello!" }
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, String> request) {
        try {
            String senderId = request.get("senderId");
            String recipientId = request.get("recipientId");
            String content = request.get("content");

            // Validation
            if (senderId == null || recipientId == null || content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "senderId, recipientId, and content are required"));
            }

            if (senderId.equals(recipientId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot send message to yourself"));
            }

            // Check if users are matched
            if (!chatService.areUsersMatched(senderId, recipientId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Can only chat with matched users"));
            }

            // Get or create conversation
            ConversationModel conversation = chatService.getOrCreateConversation(senderId, recipientId);

            // Create message
            MessageModel message = new MessageModel();
            message.setConversationId(conversation.getId());
            message.setSenderId(senderId);
            message.setRecipientId(recipientId);
            message.setContent(content);
            message.setTimestamp(LocalDateTime.now());
            message.setRead(false);

            // Save message (also updates conversation)
            MessageModel savedMessage = chatService.saveMessage(message);

            // Publish to Kafka
            MessageEvent event = new MessageEvent();
            event.setMessageId(savedMessage.getId());
            event.setConversationId(savedMessage.getConversationId());
            event.setSenderId(savedMessage.getSenderId());
            event.setRecipientId(savedMessage.getRecipientId());
            event.setContent(savedMessage.getContent());
            event.setTimestamp(savedMessage.getTimestamp());

            kafkaProducerService.sendChatMessage(event);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", savedMessage,
                    "conversationId", conversation.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send message", "message", e.getMessage()));
        }
    }

    /**
     * Get message history for a conversation
     * GET /api/chat/history/{conversationId}
     */
    @GetMapping("/history/{conversationId}")
    public ResponseEntity<Map<String, Object>> getHistory(@PathVariable String conversationId) {
        try {
            List<MessageModel> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "messages", messages,
                    "count", messages.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch history", "message", e.getMessage()));
        }
    }

    /**
     * Mark messages as read
     * POST /api/chat/read
     * Body: { "messageIds": ["msg1", "msg2"], "userId": "user123" }
     */
    @PostMapping("/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<String> messageIds = (List<String>) request.get("messageIds");
            String userId = (String) request.get("userId");

            if (messageIds == null || messageIds.isEmpty() || userId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "messageIds and userId are required"));
            }

            // Mark messages as read
            List<MessageModel> updatedMessages = chatService.markMessagesAsRead(messageIds, userId);

            // Publish read receipt event
            if (!updatedMessages.isEmpty()) {
                MessageReadEvent event = new MessageReadEvent();
                event.setMessageIds(messageIds);
                event.setConversationId(updatedMessages.get(0).getConversationId());
                event.setUserId(userId);
                event.setReadAt(LocalDateTime.now());

                kafkaProducerService.sendMessageReadReceipt(event);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "updatedCount", updatedMessages.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to mark as read", "message", e.getMessage()));
        }
    }

    /**
     * Delete a message
     * DELETE /api/chat/message/{messageId}
     * Query param: userId (to verify sender)
     */
    @DeleteMapping("/message/{messageId}")
    public ResponseEntity<Map<String, Object>> deleteMessage(
            @PathVariable String messageId,
            @RequestParam String userId) {
        try {
            // Verify message exists and user is the sender
            Optional<MessageModel> messageOpt = messageRepository.findById(messageId);

            if (messageOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Message not found"));
            }

            MessageModel message = messageOpt.get();

            // Only sender can delete their own message
            if (!message.getSenderId().equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "You can only delete your own messages"));
            }

            // Delete the message
            messageRepository.deleteById(messageId);

            // Publish deletion event for real-time updates
            MessageDeleteEvent event = new MessageDeleteEvent();
            event.setMessageId(messageId);
            event.setConversationId(message.getConversationId());
            event.setDeletedBy(userId);
            event.setDeletedAt(LocalDateTime.now());

            kafkaProducerService.sendMessageDeleted(event);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "messageId", messageId
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete message", "message", e.getMessage()));
        }
    }

    /**
     * Get all conversations for a user
     * GET /api/chat/conversations/{userId}
     */
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<Map<String, Object>> getConversations(@PathVariable String userId) {
        try {
            List<ConversationModel> conversations = conversationRepository.findByUserId(userId);

            // Sort by last message timestamp (most recent first)
            conversations.sort((a, b) -> {
                if (a.getLastMessageTimestamp() == null) return 1;
                if (b.getLastMessageTimestamp() == null) return -1;
                return b.getLastMessageTimestamp().compareTo(a.getLastMessageTimestamp());
            });

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "conversations", conversations,
                    "count", conversations.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch conversations", "message", e.getMessage()));
        }
    }

    /**
     * Get unread counts for all conversations of a user
     * GET /api/chat/unread/{userId}
     */
    @GetMapping("/unread/{userId}")
    public ResponseEntity<Map<String, Object>> getUnreadCounts(@PathVariable String userId) {
        try {
            Map<String, Integer> unreadCounts = chatService.getUnreadCountsByConversation(userId);

            int totalUnread = unreadCounts.values().stream().mapToInt(Integer::intValue).sum();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "unreadCounts", unreadCounts,
                    "totalUnread", totalUnread
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch unread counts", "message", e.getMessage()));
        }
    }
}
