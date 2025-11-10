package com.example.todo_api.controller;

import com.example.todo_api.model.Task;
import com.example.todo_api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @Autowired
    private TaskRepository repository;

    // ... (getAll, create, update, delete, analytics methods are unchanged) ...
    @GetMapping
    public List<Task> getAll(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return repository.findByTaskDate(date);
    }

    @PostMapping
    public Task create(@RequestBody Task task) {
        task.setUserId("admin");
        if (task.getTaskDate() == null) {
            task.setTaskDate(LocalDate.now());
        }
        return repository.save(task);
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable Long id, @RequestBody Task updatedTask) {
        Task task = repository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        
        // Update all fields that are provided
        if (updatedTask.getTitle() != null && !updatedTask.getTitle().trim().isEmpty()) {
            task.setTitle(updatedTask.getTitle().trim());
        }
        
        if (updatedTask.getDescription() != null) {
            task.setDescription(updatedTask.getDescription().trim());
        }
        
        if (updatedTask.getPriority() != null && !updatedTask.getPriority().isEmpty()) {
            task.setPriority(updatedTask.getPriority());
        }
        
        if (updatedTask.getCategory() != null && !updatedTask.getCategory().isEmpty()) {
            task.setCategory(updatedTask.getCategory());
        }
        
        // Always update completed status (boolean always has a value)
        task.setCompleted(updatedTask.isCompleted());
        
        // Update task date if provided
        if (updatedTask.getTaskDate() != null) {
            task.setTaskDate(updatedTask.getTaskDate());
        }
        
        return repository.save(task);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }

    @GetMapping("/analytics")
    public Map<String, Long> analytics(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        long total = repository.countByTaskDate(date);
        long completed = repository.countByTaskDateAndCompleted(date, true);
        return Map.of("total", total, "completed", completed, "pending", total - completed);
    }

    // *** ADD THIS NEW ENDPOINT ***
    @GetMapping("/pending-dates")
    public List<LocalDate> getPendingDates() {
        return repository.findPendingTaskDates();
    }
}