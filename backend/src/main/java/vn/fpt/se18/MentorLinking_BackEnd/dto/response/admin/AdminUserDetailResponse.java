package vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin;

import lombok.Builder;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@Getter
public class AdminUserDetailResponse implements Serializable {
    private Long id;
    
    private String email;
    
    private String fullName;
    
    private String roleName;
    
    private String status;
    
    private LocalDateTime createTime;
    
    // Thông tin bổ sung
    private LocalDate dob;
    
    private String phone;
    
    private String gender;
    
    private String address;
    
    private String currentLocation;
    
    private String title;
    
    private String highestDegree;
    
    private String linkedinUrl;
    
    private String avatarUrl;
    
    private String intro;
    
    private Float rating;
    
    private Integer numberOfBooking;
    
    private String bankName;
    
    private String bankAccountNumber;
    
    private LocalDateTime lastLogin;
    
    private Boolean isBlocked;
}
