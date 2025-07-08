package com.meditrack.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.meditrack.backend.service.HistoryAnalyticsService;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = { "http://localhost:5173", "https://meditrack-frontend-p0sd.onrender.com"})
public class HistoryAnalyticsController {
	
	@Autowired
    private HistoryAnalyticsService historyService;

    @GetMapping("/patient-timeline")
    public ResponseEntity<?> getTimeline(@RequestParam String email) {
        return ResponseEntity.ok(historyService.getPatientTimeline(email));
    }

    @GetMapping("/doctor-analytics")
    public ResponseEntity<?> getDoctorStats(@RequestParam String email) {
        return ResponseEntity.ok(historyService.getDoctorAnalytics(email));
    }
}
