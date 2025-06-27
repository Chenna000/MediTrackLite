package com.meditrack.backend.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.meditrack.backend.model.ForgotPasswordRequest;
import com.meditrack.backend.model.OtpVerificationRequest;
import com.meditrack.backend.model.PasswordResetRequest;
import com.meditrack.backend.model.User;
import com.meditrack.backend.repository.UserRepository;

@Service
public class ForgotPasswordService {
	
	@Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    private Map<String, String> otpStorage = new HashMap<>();

    public ResponseEntity<?> sendOtpToBackupEmail(ForgotPasswordRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();
        if (!user.getBackupmail().equalsIgnoreCase(request.getBackupEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Backup email does not match");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(request.getEmail(), otp);

        String subject = "OTP for Password Reset - MediTrackLite";
        String body = "<p>Your OTP for password reset is: <strong>" + otp + "</strong></p>"
                    + "<p>This OTP is valid for 5 minutes.</p>";

        emailService.sendEmail(request.getBackupEmail(), subject, body);

        return ResponseEntity.ok("OTP sent to backup email");
    }

    public ResponseEntity<?> verifyOtp(OtpVerificationRequest request) {
        String storedOtp = otpStorage.get(request.getEmail());
        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid OTP");
        }
        return ResponseEntity.ok("OTP verified");
    }

    public ResponseEntity<?> resetPassword(PasswordResetRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpStorage.remove(request.getEmail());

        return ResponseEntity.ok("Password updated successfully");
    }
}
