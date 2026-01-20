package vn.fpt.se18.MentorLinking_BackEnd.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SignUpMentorWithOtpRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    private String email;

    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    private String confirmPassword;

    @NotBlank(message = "Mã OTP không được để trống")
    private String otpCode;

    // Mentor specific fields
    private LocalDate dob;
    private String phone;
    private String address;
    private String title;
    private String levelOfEducation;
    private String linkedUrl;
    private MultipartFile avatar;
    private String introduceYourself;

    // Collections for mentor data
    private List<MentorEducation> mentorEducations;
    private List<Experience> experiences;
    private List<Certificate> certificates;
    private List<MentorCountryRequest> mentorCountries;

    // Inner classes for nested data structures
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MentorEducation {
        private String schoolName;
        private String major;
        private LocalDate startDate;
        private LocalDate endDate;
        private MultipartFile degreesFile;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Experience {
        private String company;
        private String position;
        private LocalDate startDate;
        private LocalDate endDate;
        private MultipartFile experiencesFile;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Certificate {
        private String certificateName;
        private String score;
        private MultipartFile certificatesFile;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MentorCountryRequest {
        private String countryName;
        private String description;
    }
}
