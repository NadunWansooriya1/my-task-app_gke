package com.example.todo_api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
public class Task {
    @Id @GeneratedValue
    private Long id;
    private String title;
    private boolean completed;
    private String userId;
    private LocalDate taskDate;
    @Column(length = 500) // Matches frontend maxLength
    private String description;
    private String priority;  // Added: low, medium, high
    private String category;  // Added: Work, Personal, Shopping, Health, Learning, Other
}