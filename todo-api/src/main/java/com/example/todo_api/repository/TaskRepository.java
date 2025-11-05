package com.example.todo_api.repository;

import com.example.todo_api.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- 1. ADD THIS IMPORT

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // Finds all tasks for a specific date
    List<Task> findByTaskDate(LocalDate date);

    // Gets the total count for a specific date
    long countByTaskDate(LocalDate date);

    // Gets the completed count for a specific date
    long countByTaskDateAndCompleted(LocalDate date, boolean completed);

    // *** 2. ADD THIS NEW METHOD ***
    // This query finds all unique dates that have tasks which are not completed,
    // and returns them in ascending order.
    @Query("SELECT DISTINCT t.taskDate FROM Task t WHERE t.completed = false ORDER BY t.taskDate ASC")
    List<LocalDate> findPendingTaskDates();
}