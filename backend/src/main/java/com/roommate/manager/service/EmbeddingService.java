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
     * Convert a user profile to a text description for embedding
     */
    public String userProfileToText(UserModel user) {
        StringBuilder description = new StringBuilder();

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
            description.append("Lifestyle: ");

            // if (user.getLifestyle().isPetFriendly()) {
            //     description.append("Pet-friendly, ");
            // } else {
            //     description.append("No pets, ");
            // }

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
                description.append(String.format("Has guests %s. ",
                    user.getLifestyle().getGuestFrequency()));
            }
        }

        return description.toString().trim();
    }

    /**
     * Generate embedding vector for a user profile
     * @param user User profile
     * @return List of floats representing the embedding vector
     */
    public List<Float> generateEmbedding(UserModel user) throws IOException {
        String text = userProfileToText(user);
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
