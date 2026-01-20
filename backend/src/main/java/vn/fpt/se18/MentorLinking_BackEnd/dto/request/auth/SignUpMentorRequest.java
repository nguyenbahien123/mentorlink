package vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignUpMentorRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    private LocalDate dob;

    private String address;

    private String phone;

    private String title;

    private String levelOfEducation;

    private String linkedUrl;

    private MultipartFile avatar;

    private String introduceYourself;

    private List<MentorEducation> mentorEducations;

    private List<Certificate> certificates;

    private List<Experience> experiences;

    private List<MentorCountryRequest> mentorCountries;

    @Getter
    @Setter
    public static class MentorCountryRequest {
        private String countryName;

        private String description;
    }

    @Getter
    @Setter
    public static class MentorEducation {
        @NotBlank(message = "School's name name is required")
        private String schoolName;

        @NotBlank(message = "Major description is required")
        private String major;

        private LocalDate startDate;

        private LocalDate endDate;

        @NotEmpty(message = "Degrees File is required")
        private MultipartFile degreesFile;
    }

    @Getter
    @Setter
    public static class Certificate {
        @NotBlank(message = "Certificate name name is required")
        private String certificateName;

        @NotBlank(message = "Score description is required")
        private String score;

        @NotEmpty(message = "Certificates File is required")
        private MultipartFile certificatesFile;
    }

    @Getter
    @Setter
    public static class Experience {
        @NotBlank(message = "Company name is required")
        private String company;

        @NotBlank(message = "Position description is required")
        private String position;

        private LocalDate startDate;

        private LocalDate endDate;

        @NotEmpty(message = "Experiences File is required")
        private MultipartFile experiencesFile;
    }
}


