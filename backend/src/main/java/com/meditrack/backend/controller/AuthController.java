package com.meditrack.backend.controller;

import com.meditrack.backend.model.ChangePasswordRequest;
import com.meditrack.backend.model.LoginRequest;
import com.meditrack.backend.model.Profile;
import com.meditrack.backend.model.RegisterRequest;
import com.meditrack.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http:localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request, HttpSession session) {
        return authService.login(request, session);
    }
    
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT', 'ADMIN')")
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        return authService.getCurrentUser(session);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        return authService.logout(session);
    }
    
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT','ADMIN')")
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request,HttpServletRequest req) {
        return authService.changePassword(request,req);
    }
    
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT','ADMIN')")
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile( HttpServletRequest request){
    	try {
    	Profile profile = authService.getuserProfile(request);
    	return ResponseEntity.ok(profile);
    	}catch(RuntimeException e) {
    		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not Logges in");
    	}
    }
}
