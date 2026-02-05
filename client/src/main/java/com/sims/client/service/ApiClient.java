package com.sims.client.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

public class ApiClient {

    private static final String BASE_URL = "http://localhost:8080/api";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ApiClient() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    public CompletableFuture<Boolean> login(String username, String password) {
        try {
            String jsonBody = objectMapper.writeValueAsString(Map.of(
                    "username", username,
                    "password", password));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/auth/login"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenApply(response -> {
                        if (response.statusCode() == 200) {
                            System.out.println("Login Success: " + response.body());
                            return true;
                        } else {
                            System.out.println("Login Failed: " + response.statusCode());
                            return false;
                        }
                    })
                    .exceptionally(e -> {
                        e.printStackTrace();
                        return false;
                    });

        } catch (Exception e) {
            e.printStackTrace();
            return CompletableFuture.completedFuture(false);
        }
    }

    public CompletableFuture<java.util.List<com.sims.client.model.StudentDTO>> getStudents() {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/students"))
                .GET()
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> {
                    if (response.statusCode() == 200) {
                        try {
                            return objectMapper.readValue(response.body(),
                                    new com.fasterxml.jackson.core.type.TypeReference<java.util.List<com.sims.client.model.StudentDTO>>() {
                                    });
                        } catch (Exception e) {
                            e.printStackTrace();
                            return java.util.Collections.<com.sims.client.model.StudentDTO>emptyList();
                        }
                    } else {
                        return java.util.Collections.<com.sims.client.model.StudentDTO>emptyList();
                    }
                });
    }

    public CompletableFuture<Boolean> addStudent(com.sims.client.model.StudentDTO student) {
        try {
            String jsonBody = objectMapper.writeValueAsString(student);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/students"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenApply(response -> {
                        System.out.println("Add Student Response Code: " + response.statusCode());
                        System.out.println("Add Student Response Body: " + response.body());
                        return response.statusCode() == 200 || response.statusCode() == 201;
                    });
        } catch (Exception e) {
            e.printStackTrace();
            return CompletableFuture.completedFuture(false);
        }
    }

    public CompletableFuture<Boolean> updateStudent(Long id, com.sims.client.model.StudentDTO student) {
        try {
            String jsonBody = objectMapper.writeValueAsString(student);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/students/" + id))
                    .header("Content-Type", "application/json")
                    .PUT(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenApply(response -> response.statusCode() == 200);
        } catch (Exception e) {
            e.printStackTrace();
            return CompletableFuture.completedFuture(false);
        }
    }

    public CompletableFuture<Boolean> deleteStudent(Long id) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/students/" + id))
                .DELETE()
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> response.statusCode() == 200 || response.statusCode() == 204);
    }
}
