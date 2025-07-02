package com.meditrack.backend.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.HttpTransport;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Collections;
import java.util.UUID;
import java.util.Base64;

@Service
public class FileStorageService {

    private final Drive driveService;

    

    public FileStorageService() {
        try {
            String credentialsBase64 = System.getenv("GOOGLE_CREDENTIALS_BASE64");

            if (credentialsBase64 == null || credentialsBase64.isEmpty()) {
                throw new RuntimeException("Missing GOOGLE_CREDENTIALS_BASE64 environment variable.");
            }

            byte[] decodedBytes = Base64.getDecoder().decode(credentialsBase64);
            InputStream credentialsStream = new ByteArrayInputStream(decodedBytes);

            GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream)
                    .createScoped(Collections.singleton("https://www.googleapis.com/auth/drive.file"));

            HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);
            HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();

            this.driveService = new Drive.Builder(httpTransport, GsonFactory.getDefaultInstance(), requestInitializer)
                    .setApplicationName("MediTrackLite")
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize Google Drive service", e);
        }
    }


    public String saveFile(MultipartFile file) {
        try {
            // Create Google Drive file metadata
            File fileMetadata = new File();
            String uniqueFilename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            fileMetadata.setName(uniqueFilename);
            fileMetadata.setParents(Collections.singletonList("1BCUB384iZnOsYG-SoZUJ1zFAZjvfaGcS"));

            // Upload the file to Drive
            File uploadedFile = driveService.files().create(fileMetadata,
                    new com.google.api.client.http.InputStreamContent(
                            file.getContentType(),
                            file.getInputStream()
                    ))
                    .setFields("id, webViewLink, webContentLink")
                    .execute();

            // Make the file public (anyone with the link can view/download)
            Permission permission = new Permission()
                    .setType("anyone")
                    .setRole("reader");
            driveService.permissions().create(uploadedFile.getId(), permission).execute();

            // Return the web content link (direct download)
            return uploadedFile.getWebContentLink();

        } catch (Exception e) {
            throw new RuntimeException("File upload to Google Drive failed", e);
        }
    }

    public String getFileUrl(String driveUrl) {
        return driveUrl;
    }
    
    public byte[] downloadFile(String fileId) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            driveService.files().get(fileId)
                    .executeMediaAndDownloadTo(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to download file from Google Drive", e);
        }
    }

}