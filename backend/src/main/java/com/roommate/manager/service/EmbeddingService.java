package com.roommate.manager.service;

import com.google.cloud.aiplatform.v1.*;
import com.google.protobuf.Value;
import com.roommate.manager.config.VectorSearchConfig;
import com.roommate.manager.model.UserModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class EmbeddingService {

    @Autowired
    private VectorSearchConfig config;

    private static final String EMBEDDING_MODEL = "text-embedding-004";

    /**
     * Convert a user's PROFILE to a text description for embedding
     * This describes WHO the user IS
     */
    public String userProfileToText(UserModel user) {
        StringBuilder description = new StringBuilder();
        description.append("My profile: ");

        description.append(String.format("Age: %d, Gender: %s. ", user.getAge(), user.getGender()));

        if (user.getZipCode() != null) {
            description.append(String.format("Location: %s. ", user.getZipCode()));
        }

        // Budget information
        if (user.getBudget() != null) {
            description.append(String.format("Budget: $%d-$%d. ",
                user.getBudget().getMin(), user.getBudget().getMax()));
        }

        // Lifestyle information
        if (user.getLifestyle() != null) {
            description.append("My lifestyle: ");

            if (user.getLifestyle().isPetFriendly()) {
                description.append("Pet-friendly, ");
            } else {
                description.append("No pets, ");
            }

            if (user.getLifestyle().isSmoking()) {
                description.append("Smoker, ");
            } else {
                description.append("Non-smoker, ");
            }

            if (user.getLifestyle().isNightOwl()) {
                description.append("Night owl, ");
            } else {
                description.append("Early bird, ");
            }

            if (user.getLifestyle().getGuestFrequency() != null) {
                description.append(String.format("%s. ", user.getLifestyle().getGuestFrequency()));
            }
        }

        return description.toString().trim();
    }

    /**
     * Convert a user's PREFERENCES to a text description for embedding
     * This describes WHAT the user WANTS in a roommate
     */
    public String userPreferencesToText(UserModel user) {
        if (user.getPreferences() == null) {
            // If no preferences specified, assume they want someone similar to themselves
            return "Looking for: Someone with a similar lifestyle. " + userProfileToText(user);
        }

        StringBuilder description = new StringBuilder();
        description.append("Looking for: ");

        // Age preference
        if (user.getPreferences().getMinAge() != null || user.getPreferences().getMaxAge() != null) {
            if (user.getPreferences().getMinAge() != null && user.getPreferences().getMaxAge() != null) {
                description.append(String.format("Age %d-%d, ",
                    user.getPreferences().getMinAge(), user.getPreferences().getMaxAge()));
            } else if (user.getPreferences().getMinAge() != null) {
                description.append(String.format("Age %d+, ", user.getPreferences().getMinAge()));
            } else {
                description.append(String.format("Age up to %d, ", user.getPreferences().getMaxAge()));
            }
        }

        // Gender preference
        if (user.getPreferences().getGender() != null && !user.getPreferences().getGender().equalsIgnoreCase("no preference")) {
            description.append(String.format("Gender: %s, ", user.getPreferences().getGender()));
        }

        // Lifestyle preferences
        if (user.getPreferences().getPetFriendly() != null) {
            if (user.getPreferences().getPetFriendly()) {
                description.append("Pet-friendly, ");
            } else {
                description.append("No pets, ");
            }
        }

        if (user.getPreferences().getSmoking() != null) {
            if (user.getPreferences().getSmoking()) {
                description.append("Smoker okay, ");
            } else {
                description.append("Non-smoker, ");
            }
        }

        if (user.getPreferences().getIsNightOwl() != null) {
            if (user.getPreferences().getIsNightOwl()) {
                description.append("Night owl, ");
            } else {
                description.append("Early bird, ");
            }
        }

        if (user.getPreferences().getGuestFrequency() != null) {
            description.append(user.getPreferences().getGuestFrequency());
        }

        return description.toString().trim();
    }

    /**
     * Generate embedding vector for a user's PROFILE
     * @param user User profile
     * @return List of floats representing the profile embedding vector
     */
    public List<Float> generateProfileEmbedding(UserModel user) throws IOException {
        String text = userProfileToText(user);
        return generateEmbeddingFromText(text);
    }

    /**
     * Generate embedding vector for a user's PREFERENCES
     * @param user User with preferences
     * @return List of floats representing the preference embedding vector
     */
    public List<Float> generatePreferenceEmbedding(UserModel user) throws IOException {
        String text = userPreferencesToText(user);
        return generateEmbeddingFromText(text);
    }

    /**
     * Generate embedding vector from text
     * @param text Input text
     * @return List of floats representing the embedding vector (768 dimensions)
     */
    public List<Float> generateEmbeddingFromText(String text) throws IOException {
        String endpoint = String.format(
            "projects/%s/locations/%s/publishers/google/models/%s",
            config.getProjectId(),
            config.getLocation(),
            EMBEDDING_MODEL
        );

        try (PredictionServiceClient client = PredictionServiceClient.create()) {
            // Create the instance for text embedding
            Value.Builder instanceBuilder = Value.newBuilder();
            instanceBuilder.getStructValueBuilder()
                .putFields("content", Value.newBuilder().setStringValue(text).build());

            List<Value> instances = new ArrayList<>();
            instances.add(instanceBuilder.build());

            // Create parameters
            Value.Builder parametersBuilder = Value.newBuilder();
            parametersBuilder.getStructValueBuilder()
                .putFields("autoTruncate", Value.newBuilder().setBoolValue(true).build());

            PredictRequest request = PredictRequest.newBuilder()
                .setEndpoint(endpoint)
                .addAllInstances(instances)
                .setParameters(parametersBuilder.build())
                .build();

            PredictResponse response = client.predict(request);

            // Extract embeddings from response
            if (response.getPredictionsCount() > 0) {
                Value prediction = response.getPredictions(0);
                List<Value> embeddingsList = prediction.getStructValue()
                    .getFieldsMap()
                    .get("embeddings")
                    .getStructValue()
                    .getFieldsMap()
                    .get("values")
                    .getListValue()
                    .getValuesList();

                return embeddingsList.stream()
                    .map(Value::getNumberValue)
                    .map(Double::floatValue)
                    .toList();
            }

            throw new IOException("No embeddings returned from API");

        } catch (Exception e) {
            throw new IOException("Error generating embeddings: " + e.getMessage(), e);
        }
    }
}
