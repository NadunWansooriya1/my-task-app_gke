package com.example.todo_api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Health check endpoints for Kubernetes probes and monitoring
 */
@RestController
public class HealthController {
    
    /**
     * Root endpoint - basic health check
     * @return Simple status message
     */
    @GetMapping("/")
    public String home() {
        return "Todo API is running! Version 2.0 - GKE Deployment";
    }
    
    /**
     * Detailed health endpoint for Kubernetes liveness/readiness probes
     * @return Health status with timestamp
     */
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now().toString(),
            "service", "todo-api",
            "environment", "production",
            "version", "2.0.0"
        );
    }
}
