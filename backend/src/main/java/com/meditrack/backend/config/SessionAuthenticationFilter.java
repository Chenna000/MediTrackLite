package com.meditrack.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.meditrack.backend.model.User;

import java.io.IOException;
import java.util.List;

@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        if (session != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Object user = session.getAttribute("user");
            if (user instanceof User) {
                User u = (User) user;
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        u.getEmail(), null, List.of() 
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        filterChain.doFilter(request, response);
    }
}