package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class FileUploadServiceImpl {

    private static final Logger logger = Logger.getLogger(FileUploadServiceImpl.class.getName());

    @Value("${file.upload.path}")
    private String uploadPath;

    @Value("${file.upload.url:http://localhost:8080/api/files}")
    private String fileServerUrl;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "pdf", "doc", "docx"};


    public String uploadFile(MultipartFile file, String folder) {
        try {
            validateFile(file);

            Path folderPath = Paths.get(uploadPath, folder);
            Files.createDirectories(folderPath);

            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID() + "." + fileExtension;

            Path filePath = folderPath.resolve(uniqueFilename);
            Files.write(filePath, file.getBytes());

            logger.info("File uploaded successfully: " + filePath);

            return fileServerUrl + "/" + folder + "/" + uniqueFilename;

        } catch (IOException e) {
            logger.severe("Error uploading file: " + e.getMessage());
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 10MB");
        }

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String extension = getFileExtension(file.getOriginalFilename());
        boolean isAllowed = false;
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (allowedExt.equalsIgnoreCase(extension)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            throw new IllegalArgumentException(
                    "File type not allowed. Allowed types: jpg, jpeg, png, pdf, doc, docx"
            );
        }
    }


    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            throw new IllegalArgumentException("Filename cannot be empty");
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }


    public boolean deleteFile(String fileUrl, String folder) {
        try {
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadPath, folder, filename);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("File deleted successfully: " + filePath);
                return true;
            } else {
                logger.warning("File not found: " + filePath);
                return false;
            }
        } catch (IOException e) {
            logger.severe("Error deleting file: " + e.getMessage());
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }
}
