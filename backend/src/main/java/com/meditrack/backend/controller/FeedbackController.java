package com.meditrack.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.meditrack.backend.model.Feedback;
import com.meditrack.backend.model.FeedbackRequest;
import com.meditrack.backend.service.FeedbackService;

@RestController
@RequestMapping("/feedback")
@CrossOrigin(origins = { "http://localhost:5173", "https://meditrack-frontend-p0sd.onrender.com"})
public class FeedbackController {
	
	@Autowired
    private FeedbackService feedbackService;

    @PostMapping
    public String submitFeedback(@RequestBody FeedbackRequest request) {
        return feedbackService.submitFeedback(request);
    }

    @GetMapping("/doctor")
    public List<Feedback> getDoctorFeedback(@RequestParam String email) {
        return feedbackService.getDoctorFeedback(email);
    }

    @GetMapping("/doctor/average")
    public double getDoctorAverageRating(@RequestParam String email) {
        return feedbackService.getAverageRating(email);
    }

    @GetMapping("/appointment/{id}")
    public Feedback getFeedbackByAppointment(@PathVariable Long id) {
        return feedbackService.getFeedbackByAppointment(id);
    }

}
