package vn.fpt.se18.MentorLinking_BackEnd.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Role;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.RoleRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;


/**
 * DataInitializer - Khởi tạo dữ liệu cơ bản khi ứng dụng khởi động
 * Tự động tạo các Role (ADMIN, MODERATOR, CUSTOMER, MENTOR) và admin user mặc định
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final StatusRepository statusRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🚀 Bắt đầu khởi tạo dữ liệu cơ bản...");

        // 1. Khởi tạo các Status
        initializeStatuses();

        // 2. Khởi tạo các Role
        initializeRoles();

        // 3. Khởi tạo admin user
        initializeAdminUser();

        log.info("✅ Hoàn thành khởi tạo dữ liệu cơ bản!");
    }

    /**
     * Khởi tạo các Status cơ bản trong hệ thống
     */
    private void initializeStatuses() {
        log.info("📋 Kiểm tra và khởi tạo các Status...");

        String[] statusCodes = {"ACTIVE", "INACTIVE", "PENDING", "APPROVED", "REJECTED", "SUCCESS", "CANCELLED", "CONFIRMED", "COMPLETED"};
        String[] statusNames = {"ACTIVE", "INACTIVE", "PENDING", "APPROVED", "REJECTED", "SUCCESS", "CANCELLED", "CONFIRMED", "COMPLETED"};

        for (int i = 0; i < statusCodes.length; i++) {
            String code = statusCodes[i];
            String name = statusNames[i];

            if (statusRepository.findByCode(code).isEmpty()) {
                Status status = Status.builder()
                        .code(code)
                        .name(name)
                        .build();
                statusRepository.save(status);
                log.info("✅ Đã tạo Status: {} (code: {})", name, code);
            } else {
                log.info("ℹ️ Status {} đã tồn tại, bỏ qua", code);
            }
        }
    }

    /**
     * Khởi tạo các Role cơ bản trong hệ thống
     */
    private void initializeRoles() {
        log.info("📋 Kiểm tra và khởi tạo các Role...");

        String[] roleCodes = {"ADMIN", "MODERATOR", "CUSTOMER", "MENTOR"};
        String[] roleNames = {"ADMIN", "MODERATOR", "CUSTOMER", "MENTOR"};

        for (int i = 0; i < roleCodes.length; i++) {
            String code = roleCodes[i];
            String name = roleNames[i];

            if (roleRepository.findByCode(code).isEmpty()) {
                Role role = Role.builder()
                        .code(code)
                        .name(name)
                        .build();
                roleRepository.save(role);
                log.info("✅ Đã tạo Role: {} (code: {})", name, code);
            } else {
                log.info("ℹ️ Role {} đã tồn tại, bỏ qua", code);
            }
        }
    }

    /**
     * Khởi tạo admin user mặc định
     * Email: vuhongthu13062004@gmail.com
     * Password: 123456
     * Role: ADMIN
     */
    private void initializeAdminUser() {
        log.info("👤 Kiểm tra và khởi tạo Admin user...");

        String adminEmail = "vuhongthu13062004@gmail.com";
        String adminPassword = "123456";

        // Kiểm tra xem admin user đã tồn tại chưa
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            log.info("ℹ️ Admin user {} đã tồn tại, bỏ qua", adminEmail);
            return;
        }

        // Lấy Role ADMIN
        Role adminRole = roleRepository.findByCode("ADMIN")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Role ADMIN. Vui lòng kiểm tra lại!"));

        // Lấy Status ACTIVE (nếu có)
        Status activeStatus = statusRepository.findByCode("ACTIVE").orElse(null);

        // Tạo admin user
        User adminUser = User.builder()
                .username("admin_" + System.currentTimeMillis()) // Username duy nhất
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(adminRole)
                .fullname("Administrator")
                .status(activeStatus)
                .isBlocked(false)
                .linkedinUrl("https://linkedin.com")
                .build();

        userRepository.save(adminUser);
        log.info("✅ Đã tạo Admin user: {} với mật khẩu mặc định", adminEmail);
        log.info("⚠️ LƯU Ý: Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu!");
    }
}

