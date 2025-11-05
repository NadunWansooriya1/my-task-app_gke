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
}