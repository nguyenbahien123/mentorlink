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
public class MentorResponse implements Serializable {
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

    private List<String> approvedCountries; // List of approved country names

}
