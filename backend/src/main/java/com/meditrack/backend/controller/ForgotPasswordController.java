package com.meditrack.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.meditrack.backend.model.ForgotPasswordRequest;
import com.meditrack.backend.model.OtpVerificationRequest;
import com.meditrack.backend.model.PasswordResetRequest;
import com.meditrack.backend.service.ForgotPasswordService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "https://meditrack-frontend-p0sd.onrender.com")
public class ForgotPasswordController {
	
	@Autowired
    private ForgotPasswordService forgotPasswordService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> sendOtp(@RequestBody ForgotPasswordRequest request) {
        return forgotPasswordService.sendOtpToBackupEmail(request);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerificationRequest request) {
        return forgotPasswordService.verifyOtp(request);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequest request) {
        return forgotPasswordService.resetPassword(request);
    }
}
