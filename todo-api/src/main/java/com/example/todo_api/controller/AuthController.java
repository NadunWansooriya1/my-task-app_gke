package com.example.todo_api.controller;

import com.example.todo_api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public String login(@RequestBody Map<String, String> credentials) {
        // Demo: Hardcoded user
        if ("admin".equals(credentials.get("username")) && "pass".equals(credentials.get("password"))) {
            return jwtUtil.generateToken("admin");
        }
        throw new RuntimeException("Invalid credentials");
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody Map<String, String> userData) {
        // Demo: Simplified registration (in production, hash password and save to database)
        String username = userData.get("username");
        String email = userData.get("email");
        
        // Basic validation
        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        
        // In production: Save user to database with proper password hashing
        // For demo: Just return success message
        return Map.of(
            "message", "Registration successful! Please login with your credentials.",
            "username", username
        );
    }
}