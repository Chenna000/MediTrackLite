package com.meditrack.backend.service;

import com.meditrack.backend.config.SessionRegistry;
import com.meditrack.backend.model.ChangePasswordRequest;
import com.meditrack.backend.model.LoginRequest;
import com.meditrack.backend.model.Profile;
import com.meditrack.backend.model.RegisterRequest;
import com.meditrack.backend.model.User;
import com.meditrack.backend.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private SessionRegistry sessionRegistry;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Map<String, Integer> loginAttempts = new ConcurrentHashMap<>();
    private final Map<String, Long> lockoutTime = new ConcurrentHashMap<>();

    public ResponseEntity<String> register(RegisterRequest request) {
        if (!request.getEmail().endsWith("@meditrack.local")) {
            return ResponseEntity.badRequest().body("Email should end with @meditrack.local");
        }

        if (!isPasswordValid(request.getPassword())) {
            return ResponseEntity.badRequest().body("Password must be 8+ characters and include uppercase, lowercase, and special characters");
        }

        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(request.getName(), request.getEmail(), hashedPassword, request.getRole());
        userRepo.save(user);
        return ResponseEntity.ok("Registration Successful");
    }

    public ResponseEntity<String> login(LoginRequest request, HttpSession session) {
        String email = request.getEmail();

        if (lockoutTime.containsKey(email) && System.currentTimeMillis() - lockoutTime.get(email) < 300000) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Too many attempts. Try again after 5 minutes");
        }

        Optional<User> useOpt = userRepo.findByEmail(email);
        if (useOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), useOpt.get().getPassword())) {
            loginAttempts.put(email, loginAttempts.getOrDefault(email, 0) + 1);
            if (loginAttempts.get(email) >= 5) {
                lockoutTime.put(email, System.currentTimeMillis());
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Credentials");
        }

        loginAttempts.remove(email);
        lockoutTime.remove(email);

        sessionRegistry.registerSession(email, session);
        session.setAttribute("user", useOpt.get());
        //  Tell Spring Security the user is authenticated
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
            useOpt.get().getEmail(), null, List.of() 
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        return ResponseEntity.ok("Login Successful " + useOpt.get().getRole());
    }

    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        var user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        }
        return ResponseEntity.ok(user);
    }

    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out");
    }

    public ResponseEntity<String> changePassword(ChangePasswordRequest req,HttpServletRequest request) {
    	HttpSession session = request.getSession(false);
    	User user1 = (User)session.getAttribute("user");
        Optional<User> useOpt = userRepo.findByEmail(user1.getEmail());
        if (useOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = useOpt.get();
        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Old password incorrect");
        }

        if (!isPasswordValid(req.getNewPassword())) {
            return ResponseEntity.badRequest().body("Weak password");
        }

        if (req.getNewPassword().equals(req.getOldPassword())) {
            return ResponseEntity.badRequest().body("New password is same as old password. Please use a different one.");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(user);
        sessionRegistry.invalidateSessions(user.getEmail());

        return ResponseEntity.ok("Password changed. Please log in again.");
    }

    private boolean isPasswordValid(String password) {
        return password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");
    }

	public Profile getuserProfile(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		//System.out.println("In Profile service");
		if(session==null||session.getAttribute("user")==null) {
			throw new RuntimeException("User Not Found");
		}
		User user = (User) session.getAttribute("user");
		Profile profile = new Profile(user.getName(), user.getEmail(),user.getRole());
		
		return profile;
	}
}
