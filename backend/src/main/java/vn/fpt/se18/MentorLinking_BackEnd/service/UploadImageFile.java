package vn.fpt.se18.MentorLinking_BackEnd.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public interface UploadImageFile {
    String uploadImage(MultipartFile file) throws IOException;
}
