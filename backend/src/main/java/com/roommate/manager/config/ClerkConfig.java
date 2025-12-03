package com.roommate.manager.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ClerkConfig {

    @Value("${clerk.webhook.secret}")
    private String signingSecret;

    public String getSigningSecret() {
        return signingSecret;
    }
}
