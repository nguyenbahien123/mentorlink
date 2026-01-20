package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl.adminImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.GetMentorRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorEducationAdminResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorExperienceAdminResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorServiceAdminResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorTestAdminResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorCountryAdminResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.MentorManagementResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorEducation;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorExperience;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorTest;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Role;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorEducationRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorExperienceRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorServiceRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorTestRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.RoleRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.MentorService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MentorAdminServiceImpl implements MentorService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StatusRepository statusRepository;
    private final MentorEducationRepository mentorEducationRepository;
    private final MentorExperienceRepository mentorExperienceRepository;
    private final MentorTestRepository mentorTestRepository;
    private final MentorServiceRepository mentorServiceRepository;

    @Override
    public List<MentorManagementResponse> getAllMentors() {
        // Get all users with MENTOR role
        Optional<Role> mentorRole = roleRepository.findByName("MENTOR");
        if (mentorRole.isEmpty()) {
            return List.of();
        }

        List<User> mentors = userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && user.getRole().getId().equals(mentorRole.get().getId()))
                .collect(Collectors.toList());

        return mentors.stream()
                .map(MentorManagementResponse::new)
                .collect(Collectors.toList());
    }

    public BaseResponse<PageResponse<MentorManagementResponse>> getAllMentorsWithCondition(BaseRequest<GetMentorRequest> request) {
        GetMentorRequest data = request.getData();

        // Get MENTOR role ID
        Optional<Role> mentorRole = roleRepository.findByName("MENTOR");
        if (mentorRole.isEmpty()) {
            return BaseResponse.<PageResponse<MentorManagementResponse>>builder()
                    .respCode("1")
                    .description("MENTOR role not found")
                    .build();
        }

        Pageable pageable = PageRequest.of(
                data.getPage() - 1,
                data.getSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        // Use existing method but filter for MENTOR role
        Page<User> mentorPage = userRepository.findAllWithCondition(
                data.getKeySearch(),
                mentorRole.get().getId(),
                data.getStatus() != null ? data.getStatus().longValue() : null,
                pageable
        );

        List<MentorManagementResponse> mentorResponses = mentorPage.getContent().stream()
                .map(MentorManagementResponse::new)
                .collect(Collectors.toList());

        PageResponse<MentorManagementResponse> pageResponse = PageResponse.<MentorManagementResponse>builder()
                .content(mentorResponses)
                .totalElements(mentorPage.getTotalElements())
                .totalPages(mentorPage.getTotalPages())
                .currentPage(data.getPage())
                .pageSize(data.getSize())
                .build();

        return BaseResponse.<PageResponse<MentorManagementResponse>>builder()
                .respCode("0")
                .description("Success")
                .data(pageResponse)
                .build();
    }

    public BaseResponse<MentorManagementResponse> getMentorById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return BaseResponse.<MentorManagementResponse>builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        User user = userOpt.get();
        // Verify this is a mentor
        Optional<Role> mentorRole = roleRepository.findByName("MENTOR");
        if (mentorRole.isEmpty() || !user.getRole().getId().equals(mentorRole.get().getId())) {
            return BaseResponse.<MentorManagementResponse>builder()
                    .respCode("1")
                    .description("User is not a mentor")
                    .build();
        }

        return BaseResponse.<MentorManagementResponse>builder()
                .respCode("0")
                .description("Success")
                .data(new MentorManagementResponse(user))
                .build();
    }

    @Override
    @Transactional
    public BaseResponse<Void> approveMentor(Long id) {
        log.info("Approving mentor with id: {}", id);
        
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        User user = userOpt.get();
        Optional<Status> approvedStatus = statusRepository.findByCode("APPROVED");
        if (approvedStatus.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("APPROVED status not found")
                    .build();
        }

        try {
            // 1. Approve mentor
            user.setStatus(approvedStatus.get());
            userRepository.save(user);
            log.info("Mentor {} approved", id);

            // 2. Auto-approve all related education records
            List<MentorEducation> educations = mentorEducationRepository.findByUserId(id);
            if (!educations.isEmpty()) {
                educations.forEach(education -> education.setStatus(approvedStatus.get()));
                mentorEducationRepository.saveAll(educations);
                log.info("Approved {} education records for mentor {}", educations.size(), id);
            }

            // 3. Auto-approve all related experience records
            List<MentorExperience> experiences = mentorExperienceRepository.findByUserId(id);
            if (!experiences.isEmpty()) {
                experiences.forEach(experience -> experience.setStatus(approvedStatus.get()));
                mentorExperienceRepository.saveAll(experiences);
                log.info("Approved {} experience records for mentor {}", experiences.size(), id);
            }

            // 4. Auto-approve all related certificates/tests
            List<MentorTest> tests = mentorTestRepository.findByUserId(id);
            if (!tests.isEmpty()) {
                tests.forEach(test -> test.setStatus(approvedStatus.get()));
                mentorTestRepository.saveAll(tests);
                log.info("Approved {} certificate/test records for mentor {}", tests.size(), id);
            }

            // 5. Auto-approve all related services
            List<vn.fpt.se18.MentorLinking_BackEnd.entity.MentorService> services = mentorServiceRepository.findByMentorIdAndStatusCode(id, "PENDING");
            if (!services.isEmpty()) {
                services.forEach(service -> service.setStatus(approvedStatus.get()));
                mentorServiceRepository.saveAll(services);
                log.info("Approved {} service records for mentor {}", services.size(), id);
            }

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Mentor and all related information approved successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error approving mentor {}: {}", id, e.getMessage(), e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error approving mentor: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> rejectMentor(Long id) {
        log.info("Rejecting mentor with id: {}", id);
        
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        User user = userOpt.get();
        Optional<Status> rejectedStatus = statusRepository.findByCode("REJECTED");
        if (rejectedStatus.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("REJECTED status not found")
                    .build();
        }

        try {
            // 1. Reject mentor
            user.setStatus(rejectedStatus.get());
            userRepository.save(user);
            log.info("Mentor {} rejected", id);

            // 2. Auto-reject all related education records
            List<MentorEducation> educations = mentorEducationRepository.findByUserId(id);
            if (!educations.isEmpty()) {
                educations.forEach(education -> education.setStatus(rejectedStatus.get()));
                mentorEducationRepository.saveAll(educations);
                log.info("Rejected {} education records for mentor {}", educations.size(), id);
            }

            // 3. Auto-reject all related experience records
            List<MentorExperience> experiences = mentorExperienceRepository.findByUserId(id);
            if (!experiences.isEmpty()) {
                experiences.forEach(experience -> experience.setStatus(rejectedStatus.get()));
                mentorExperienceRepository.saveAll(experiences);
                log.info("Rejected {} experience records for mentor {}", experiences.size(), id);
            }

            // 4. Auto-reject all related certificates/tests
            List<MentorTest> tests = mentorTestRepository.findByUserId(id);
            if (!tests.isEmpty()) {
                tests.forEach(test -> test.setStatus(rejectedStatus.get()));
                mentorTestRepository.saveAll(tests);
                log.info("Rejected {} certificate/test records for mentor {}", tests.size(), id);
            }

            // 5. Auto-reject all related services
            List<vn.fpt.se18.MentorLinking_BackEnd.entity.MentorService> services = mentorServiceRepository.findByMentorIdAndStatusCode(id, "PENDING");
            if (!services.isEmpty()) {
                services.forEach(service -> service.setStatus(rejectedStatus.get()));
                mentorServiceRepository.saveAll(services);
                log.info("Rejected {} service records for mentor {}", services.size(), id);
            }

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Mentor and all related information rejected successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error rejecting mentor {}: {}", id, e.getMessage(), e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error rejecting mentor: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> bulkApproveMentors(List<Long> mentorIds) {
        log.info("Bulk approving {} mentors", mentorIds.size());
        
        Optional<Status> approvedStatus = statusRepository.findByCode("APPROVED");
        if (approvedStatus.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("APPROVED status not found")
                    .build();
        }

        try {
            List<User> mentors = userRepository.findAllById(mentorIds);
            mentors.forEach(mentor -> mentor.setStatus(approvedStatus.get()));
            userRepository.saveAll(mentors);

            // Auto-approve all related information for each mentor
            for (Long mentorId : mentorIds) {
                // Approve education
                List<MentorEducation> educations = mentorEducationRepository.findByUserId(mentorId);
                if (!educations.isEmpty()) {
                    educations.forEach(education -> education.setStatus(approvedStatus.get()));
                    mentorEducationRepository.saveAll(educations);
                }

                // Approve experience
                List<MentorExperience> experiences = mentorExperienceRepository.findByUserId(mentorId);
                if (!experiences.isEmpty()) {
                    experiences.forEach(experience -> experience.setStatus(approvedStatus.get()));
                    mentorExperienceRepository.saveAll(experiences);
                }

                // Approve certificates/tests
                List<MentorTest> tests = mentorTestRepository.findByUserId(mentorId);
                if (!tests.isEmpty()) {
                    tests.forEach(test -> test.setStatus(approvedStatus.get()));
                    mentorTestRepository.saveAll(tests);
                }

                // Approve services
                List<vn.fpt.se18.MentorLinking_BackEnd.entity.MentorService> services = mentorServiceRepository.findByMentorIdAndStatusCode(mentorId, "PENDING");
                if (!services.isEmpty()) {
                    services.forEach(service -> service.setStatus(approvedStatus.get()));
                    mentorServiceRepository.saveAll(services);
                }
            }

            log.info("Successfully bulk approved {} mentors and their related information", mentorIds.size());
            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("All mentors and their related information approved successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error bulk approving mentors: {}", e.getMessage(), e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error approving mentors: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> bulkRejectMentors(List<Long> mentorIds) {
        log.info("Bulk rejecting {} mentors", mentorIds.size());
        
        Optional<Status> rejectedStatus = statusRepository.findByCode("REJECTED");
        if (rejectedStatus.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("REJECTED status not found")
                    .build();
        }

        try {
            List<User> mentors = userRepository.findAllById(mentorIds);
            mentors.forEach(mentor -> mentor.setStatus(rejectedStatus.get()));
            userRepository.saveAll(mentors);

            // Auto-reject all related information for each mentor
            for (Long mentorId : mentorIds) {
                // Reject education
                List<MentorEducation> educations = mentorEducationRepository.findByUserId(mentorId);
                if (!educations.isEmpty()) {
                    educations.forEach(education -> education.setStatus(rejectedStatus.get()));
                    mentorEducationRepository.saveAll(educations);
                }

                // Reject experience
                List<MentorExperience> experiences = mentorExperienceRepository.findByUserId(mentorId);
                if (!experiences.isEmpty()) {
                    experiences.forEach(experience -> experience.setStatus(rejectedStatus.get()));
                    mentorExperienceRepository.saveAll(experiences);
                }

                // Reject certificates/tests
                List<MentorTest> tests = mentorTestRepository.findByUserId(mentorId);
                if (!tests.isEmpty()) {
                    tests.forEach(test -> test.setStatus(rejectedStatus.get()));
                    mentorTestRepository.saveAll(tests);
                }

                // Reject services
                List<vn.fpt.se18.MentorLinking_BackEnd.entity.MentorService> services = mentorServiceRepository.findByMentorIdAndStatusCode(mentorId, "PENDING");
                if (!services.isEmpty()) {
                    services.forEach(service -> service.setStatus(rejectedStatus.get()));
                    mentorServiceRepository.saveAll(services);
                }
            }

            log.info("Successfully bulk rejected {} mentors and their related information", mentorIds.size());
            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("All mentors and their related information rejected successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error bulk rejecting mentors: {}", e.getMessage(), e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error rejecting mentors: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> deleteMentor(Long id) {
        log.info("Deleting mentor with id: {}", id);
        
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        User user = userOpt.get();
        
        // Verify this is a mentor
        Optional<Role> mentorRole = roleRepository.findByName("MENTOR");
        if (mentorRole.isEmpty() || !user.getRole().getId().equals(mentorRole.get().getId())) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("User is not a mentor")
                    .build();
        }

        try {
            // Delete all related records first (cascade delete)
            // 1. Delete education records
            List<MentorEducation> educations = mentorEducationRepository.findByUserId(id);
            if (!educations.isEmpty()) {
                mentorEducationRepository.deleteAll(educations);
                log.info("Deleted {} education records for mentor {}", educations.size(), id);
            }

            // 2. Delete experience records
            List<MentorExperience> experiences = mentorExperienceRepository.findByUserId(id);
            if (!experiences.isEmpty()) {
                mentorExperienceRepository.deleteAll(experiences);
                log.info("Deleted {} experience records for mentor {}", experiences.size(), id);
            }

            // 3. Delete certificates/tests
            List<MentorTest> tests = mentorTestRepository.findByUserId(id);
            if (!tests.isEmpty()) {
                mentorTestRepository.deleteAll(tests);
                log.info("Deleted {} certificate/test records for mentor {}", tests.size(), id);
            }

            // 4. Delete services (all statuses)
            List<vn.fpt.se18.MentorLinking_BackEnd.entity.MentorService> allServices = user.getMentorServices();
            if (allServices != null && !allServices.isEmpty()) {
                mentorServiceRepository.deleteAll(allServices);
                log.info("Deleted {} service records for mentor {}", allServices.size(), id);
            }

            // 5. Finally delete the mentor user
            userRepository.delete(user);
            log.info("Mentor {} and all related information deleted successfully", id);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Mentor deleted successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error deleting mentor {}: {}", id, e.getMessage(), e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error deleting mentor: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<MentorStatisticsResponse> getMentorStatistics() {
        // Get MENTOR role
        Optional<Role> mentorRole = roleRepository.findByName("MENTOR");
        if (mentorRole.isEmpty()) {
            return BaseResponse.<MentorStatisticsResponse>builder()
                    .respCode("1")
                    .description("MENTOR role not found")
                    .build();
        }

        // Get all mentors
        List<User> allMentors = userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && user.getRole().getId().equals(mentorRole.get().getId()))
                .toList();

        // Count by status
        long pendingCount = allMentors.stream()
                .filter(mentor -> mentor.getStatus() != null && "PENDING".equals(mentor.getStatus().getCode()))
                .count();

        long approvedCount = allMentors.stream()
                .filter(mentor -> mentor.getStatus() != null && "ACTIVE".equals(mentor.getStatus().getCode()))
                .count();

        long rejectedCount = allMentors.stream()
                .filter(mentor -> mentor.getStatus() != null && "INACTIVE".equals(mentor.getStatus().getCode()))
                .count();

        long totalCount = allMentors.size();

        MentorStatisticsResponse statistics = MentorStatisticsResponse.builder()
                .pending(pendingCount)
                .approved(approvedCount)
                .rejected(rejectedCount)
                .total(totalCount)
                .build();

        return BaseResponse.<MentorStatisticsResponse>builder()
                .respCode("0")
                .description("Success")
                .data(statistics)
                .build();
    }

    @Override
    public BaseResponse<?> getMentorEducation(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return BaseResponse.builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        User mentor = userOpt.get();
        
        // Map all educations (NO status filter - admin needs to see ALL)
        List<MentorEducationAdminResponse> educations = mentor.getMentorEducations().stream()
                .map(education -> MentorEducationAdminResponse.builder()
                        .id(education.getId())
                        .schoolName(education.getSchoolName())
                        .major(education.getMajor())
                        .startDate(education.getStartDate())
                        .endDate(education.getEndDate())
                        .certificateImage(education.getCertificateImage())
                        .statusCode(education.getStatus() != null ? education.getStatus().getCode() : null)
                        .statusName(education.getStatus() != null ? education.getStatus().getName() : null)
                        .build())
                .collect(Collectors.toList());

        return BaseResponse.builder()
                .respCode("0")
                .description("Success")
                .data(educations)
                .build();
    }

    @Override
    public BaseResponse<?> getMentorExperience(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return BaseResponse.builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        User mentor = userOpt.get();
        
        // Map all experiences (NO status filter - admin needs to see ALL)
        List<MentorExperienceAdminResponse> experiences = mentor.getMentorExperiences().stream()
                .map(experience -> MentorExperienceAdminResponse.builder()
                        .id(experience.getId())
                        .companyName(experience.getCompanyName())
                        .position(experience.getPosition())
                        .startDate(experience.getStartDate())
                        .endDate(experience.getEndDate())
                        .experienceImage(experience.getExperienceImage())
                        .statusCode(experience.getStatus() != null ? experience.getStatus().getCode() : null)
                        .statusName(experience.getStatus() != null ? experience.getStatus().getName() : null)
                        .build())
                .collect(Collectors.toList());

        return BaseResponse.builder()
                .respCode("0")
                .description("Success")
                .data(experiences)
                .build();
    }

    @Override
    public BaseResponse<?> getMentorCertificates(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return BaseResponse.builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        User mentor = userOpt.get();
        
        // Map all tests (NO status filter - admin needs to see ALL)
        List<MentorTestAdminResponse> tests = mentor.getMentorTests().stream()
                .map(test -> MentorTestAdminResponse.builder()
                        .id(test.getId())
                        .testName(test.getTestName())
                        .score(test.getScore())
                        .scoreImage(test.getScoreImage())
                        .statusCode(test.getStatus() != null ? test.getStatus().getCode() : null)
                        .statusName(test.getStatus() != null ? test.getStatus().getName() : null)
                        .build())
                .collect(Collectors.toList());

        return BaseResponse.builder()
                .respCode("0")
                .description("Success")
                .data(tests)
                .build();
    }

    @Override
    public BaseResponse<?> getMentorServices(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return BaseResponse.builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        User mentor = userOpt.get();
        
        // Map all services (NO status filter - admin needs to see ALL)
        List<MentorServiceAdminResponse> services = mentor.getMentorServices().stream()
                .map(service -> MentorServiceAdminResponse.builder()
                        .id(service.getId())
                        .serviceName(service.getServiceName())
                        .description(service.getDescription())
                        .statusCode(service.getStatus() != null ? service.getStatus().getCode() : null)
                        .statusName(service.getStatus() != null ? service.getStatus().getName() : null)
                        .build())
                .collect(Collectors.toList());

        return BaseResponse.builder()
                .respCode("0")
                .description("Success")
                .data(services)
                .build();
    }

    @Override
    public BaseResponse<?> getMentorCountries(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return BaseResponse.builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        User mentor = userOpt.get();
        
        // Map all countries (NO status filter - admin needs to see ALL)
        List<MentorCountryAdminResponse> countries = mentor.getMentorCountries().stream()
                .map(mentorCountry -> MentorCountryAdminResponse.builder()
                        .id(mentorCountry.getId())
                        .countryId(mentorCountry.getCountry() != null ? mentorCountry.getCountry().getId() : null)
                        .countryName(mentorCountry.getCountry() != null ? mentorCountry.getCountry().getName() : null)
                        .flagUrl(mentorCountry.getCountry() != null ? mentorCountry.getCountry().getFlagUrl() : null)
                        .statusCode(mentorCountry.getStatus() != null ? mentorCountry.getStatus().getCode() : null)
                        .statusName(mentorCountry.getStatus() != null ? mentorCountry.getStatus().getName() : null)
                        .build())
                .collect(Collectors.toList());

        return BaseResponse.builder()
                .respCode("0")
                .description("Success")
                .data(countries)
                .build();
    }
}
