package com.meditrack.backend.config;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class SessionRegistry implements HttpSessionListener {

    private static final Map<String, HttpSession> sessionMap = new HashMap<>();
    private static final Map<String, List<String>> userSessionIds = new HashMap<>();

    @Override
    public void sessionCreated(HttpSessionEvent event) {
        sessionMap.put(event.getSession().getId(), event.getSession());
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent event) {
        sessionMap.remove(event.getSession().getId());
        // Remove from userSessionIds map too
        String email = (String) event.getSession().getAttribute("email");
        if (email != null && userSessionIds.containsKey(email)) {
            userSessionIds.get(email).remove(event.getSession().getId());
        }
    }

    public void registerSession(String email, HttpSession session) {
        sessionMap.put(session.getId(), session);
        session.setAttribute("email", email);
        userSessionIds.computeIfAbsent(email, k -> new ArrayList<>()).add(session.getId());
    }

    public void invalidateSessions(String email) {
        if (userSessionIds.containsKey(email)) {
            for (String sessionId : userSessionIds.get(email)) {
                HttpSession session = sessionMap.get(sessionId);
                if (session != null) {
                    session.invalidate();
                }
            }
            userSessionIds.remove(email); // Clear after invalidation
        }
    }
}

