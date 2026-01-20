package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import lombok.*;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Role;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorDetailResponse implements Serializable {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private String fullname;
    private java.time.LocalDate dob;
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

    // Related data as Lists only
    private List<MentorEducationResponse> educations;
    private List<MentorExperienceResponse> experiences;
    private List<MentorServiceResponse> services;
    private List<MentorTestResponse> tests;
    private List<CountryResponse> approvedCountries;
}
