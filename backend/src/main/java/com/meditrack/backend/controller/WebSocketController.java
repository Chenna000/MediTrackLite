package com.meditrack.backend.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.meditrack.backend.model.ChatMessage;

@Controller
@CrossOrigin(origins = { "http://localhost:5173", "https://meditrack-frontend-p0sd.onrender.com"})
public class WebSocketController {
	
	@Autowired
    private SimpMessagingTemplate messagingTemplate;
	
	@MessageMapping("/private-message")
	public void sendMessage(ChatMessage message, Principal principal){
		if (!principal.getName().equals(message.getSender())) {
	        throw new RuntimeException("Unauthorized message sender!");
	    }
		messagingTemplate.convertAndSendToUser(message.getReceiver(), "/queue/messages", message);
	}

}
