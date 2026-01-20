package vn.fpt.se18.MentorLinking_BackEnd.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends AbstractEntity<Long> implements UserDetails, Serializable {
    @Column(nullable = false, unique = true)
    private String username;

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    @Column(name = "password", nullable = false)
    private String password;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "full_name")
    private String fullname;

    @Column(name = "dob")
    private java.time.LocalDate dob;

    @Column(name = "phone")
    private String phone;

    @Column(name = "gender")
    private String gender;

    @Column(name = "address")
    private String address;

    @Column(name = "current_location")
    private String currentLocation;

    @Column(name = "title")
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "highest_degree_id")
    private HighestDegree highestDegree;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "intro", columnDefinition = "TEXT")
    private String intro;

    @Column(name = "rating")
    private Float rating;

    @Column(name = "number_of_booking")
    private Integer numberOfBooking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private Status status;

    @Column(name = "is_blocked", columnDefinition = "boolean default false")
    private Boolean isBlocked;

    @Column(name = "last_login")
    private java.time.LocalDateTime lastLogin;

    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Column(name = "bank_name")
    private String bankName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MentorService> mentorServices;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MentorEducation> mentorEducations;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MentorTest> mentorTests;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MentorExperience> mentorExperiences;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Schedule> schedules;

    @OneToMany(mappedBy = "mentor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MentorCountry> mentorCountries;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Trả về authorities dựa trên role của user
        if (role != null) {
            return List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.getName()));
        }
        return List.of();
    }


    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    // Convenience accessor expected by service code (maps to avatar_url column)
    public String getProfileImage() {
        return this.avatarUrl;
    }

    // Convenience accessor expected by service code (maps to intro column)
    public String getBio() {
        return this.intro;
    }
}
