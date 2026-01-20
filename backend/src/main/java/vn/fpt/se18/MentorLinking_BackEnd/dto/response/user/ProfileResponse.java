package vn.fpt.se18.MentorLinking_BackEnd.dto.response.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class ProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String fullname;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dob;

    private String phone;
    private String gender;
    private String address;
    private String currentLocation;
    private String title;
    private String linkedinUrl;
    private String avatarUrl;
    private String intro;
    private Float rating;
    private Integer numberOfBooking;
    private String bankAccountNumber;
    private String bankName;
}

