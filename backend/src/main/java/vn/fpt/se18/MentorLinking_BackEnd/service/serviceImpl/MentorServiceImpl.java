package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorServiceRequest;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Booking;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.BookingRepository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Country;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorCountry;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorService;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.CountryRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorCountryRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorServiceRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import vn.fpt.se18.MentorLinking_BackEnd.util.PaymentProcess;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MentorServiceImpl implements vn.fpt.se18.MentorLinking_BackEnd.service.MentorService {

    private final MentorRepository mentorRepository;
    private final BookingRepository bookingRepository;
    private final CountryRepository countryRepository;
    private final StatusRepository statusRepository;
    private final MentorServiceRepository mentorServiceRepository;
    private final UserRepository userRepository;

    public MentorPageResponse getAllMentors(String keyword, String country, String sort, int page, int size) {
        Sort.Order order = new Sort.Order(Sort.Direction.ASC, "id");
        if (StringUtils.hasLength(sort)) {
            Pattern pattern = Pattern.compile("^(\\w+):(asc|desc)$", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(sort);
            if (matcher.find()) {
                String columnName = matcher.group(1);
                if (matcher.group(2).equalsIgnoreCase("asc")) {
                    order = new Sort.Order(Sort.Direction.ASC, columnName);
                } else {
                    order = new Sort.Order(Sort.Direction.DESC, columnName);
                }
            }
        }

        int pageNo = 0;
        if (page > 0) {
            pageNo = page - 1;
        }

        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(order));

        Page<User> entityPage;

        // Handle different filtering scenarios
        boolean hasKeyword = StringUtils.hasLength(keyword);
        boolean hasCountry = StringUtils.hasLength(country);

        if (hasKeyword && hasCountry) {
            // Both keyword and country filter
            keyword = "%" + keyword.toLowerCase() + "%";
            entityPage = mentorRepository.searchByKeywordAndCountry(keyword, country, pageable);
        } else if (hasKeyword) {
            // Only keyword filter
            keyword = "%" + keyword.toLowerCase() + "%";
            entityPage = mentorRepository.searchByKeyword(keyword, pageable);
        } else if (hasCountry) {
            // Only country filter
            entityPage = mentorRepository.searchByCountry(country, pageable);
        } else {
            // No filters
            entityPage = mentorRepository.getAllMentorWithRelatedData(pageable);
        }

        List<MentorResponse> mentorResponses = entityPage.stream().map(
                user -> {
                    // Map approved countries - only get APPROVED status
                    List<String> approvedCountries = user.getMentorCountries().stream()
                            .filter(mentorCountry -> "APPROVED".equals(mentorCountry.getStatus().getCode()))
                            .map(mentorCountry -> mentorCountry.getCountry().getName())
                            .toList();

                    return MentorResponse.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .fullname(user.getFullname())
                            .dob(user.getDob())
                            .phone(user.getPhone())
                            .gender(user.getGender())
                            .address(user.getAddress())
                            .currentLocation(user.getCurrentLocation())
                            .title(user.getTitle())
                            .linkedinUrl(user.getLinkedinUrl())
                            .avatarUrl(user.getAvatarUrl())
                            .intro(user.getIntro())
                            .rating(user.getRating())
                            .numberOfBooking(user.getNumberOfBooking())
                            .approvedCountries(approvedCountries)
                            .build();
                }
        ).toList();

        MentorPageResponse mentorPageResponse = new MentorPageResponse();
        mentorPageResponse.setPageNumber(entityPage.getNumber());
        mentorPageResponse.setPageSize(entityPage.getSize());
        mentorPageResponse.setTotalElements(entityPage.getTotalElements());
        mentorPageResponse.setTotalPages(entityPage.getTotalPages());
        mentorPageResponse.setMentors(mentorResponses);

        return mentorPageResponse;
    }

    @Transactional(readOnly = true)
    public MentorDetailResponse getMentorById(Long id) {
        User mentor = mentorRepository.getMentorByIdWithRelatedData(id);

        if (mentor == null) {
            throw new RuntimeException("Mentor not found with id: " + id);
        }

        // Map educations - only APPROVED status và thêm statusCode
        List<MentorEducationResponse> educations = mentor.getMentorEducations().stream()
                .filter(education -> "APPROVED".equals(education.getStatus().getCode()))
                .map(education -> MentorEducationResponse.builder()
                        .schoolName(education.getSchoolName())
                        .major(education.getMajor())
                        .startDate(education.getStartDate())
                        .endDate(education.getEndDate())
                        .certificateImage(education.getCertificateImage())
                        .status(education.getStatus().getName())
                        .statusCode(education.getStatus().getCode())
                        .build())
                .toList();

        // Map experiences - only APPROVED status và thêm statusCode
        List<MentorExperienceResponse> experiences = mentor.getMentorExperiences().stream()
                .filter(experience -> "APPROVED".equals(experience.getStatus().getCode()))
                .map(experience -> MentorExperienceResponse.builder()
                        .companyName(experience.getCompanyName())
                        .position(experience.getPosition())
                        .startDate(experience.getStartDate())
                        .endDate(experience.getEndDate())
                        .experienceImage(experience.getExperienceImage())
                        .status(experience.getStatus().getName())
                        .statusCode(experience.getStatus().getCode())
                        .build())
                .toList();

        // Map services - only APPROVED status và thêm statusCode
        List<MentorServiceResponse> services = mentor.getMentorServices().stream()
                .filter(service -> "APPROVED".equals(service.getStatus().getCode()))
                .map(service -> MentorServiceResponse.builder()
                        .id(service.getId())
                        .serviceName(service.getServiceName())
                        .description(service.getDescription())
                        .status(service.getStatus().getName())
                        .statusCode(service.getStatus().getCode())
                        .mentorId(mentor.getId())
                        .mentorName(mentor.getFullname())
                        .createdAt(service.getCreatedAt() != null ? service.getCreatedAt().toString() : null)
                        .updatedAt(service.getUpdatedAt() != null ? service.getUpdatedAt().toString() : null)
                        .build())
                .toList();

        // Map tests - only APPROVED status và thêm statusCode
        List<MentorTestResponse> tests = mentor.getMentorTests().stream()
                .filter(test -> "APPROVED".equals(test.getStatus().getCode()))
                .map(test -> MentorTestResponse.builder()
                        .testName(test.getTestName())
                        .score(test.getScore())
                        .scoreImage(test.getScoreImage())
                        .status(test.getStatus().getName())
                        .statusCode(test.getStatus().getCode())
                        .build())
                .toList();

        // Map approved countries - only get APPROVED status
        List<CountryResponse> approvedCountries = mentor.getMentorCountries().stream()
                .filter(mentorCountry -> "APPROVED".equals(mentorCountry.getStatus().getCode()))
                .map(mentorCountry -> CountryResponse.builder()
                        .id(mentorCountry.getCountry().getId())
                        .code(mentorCountry.getCountry().getCode())
                        .name(mentorCountry.getCountry().getName())
                        .flagUrl(mentorCountry.getCountry().getFlagUrl())
                        .description(mentorCountry.getCountry().getDescription())
                        .build())
                .toList();

        return MentorDetailResponse.builder()
                .id(mentor.getId())
                .username(mentor.getUsername())
                .email(mentor.getEmail())
                .role(mentor.getRole())
                .fullname(mentor.getFullname())
                .dob(mentor.getDob())
                .phone(mentor.getPhone())
                .gender(mentor.getGender())
                .address(mentor.getAddress())
                .currentLocation(mentor.getCurrentLocation())
                .title(mentor.getTitle())
                .linkedinUrl(mentor.getLinkedinUrl())
                .avatarUrl(mentor.getAvatarUrl())
                .intro(mentor.getIntro())
                .rating(mentor.getRating())
                .numberOfBooking(mentor.getNumberOfBooking())
                .educations(educations)
                .experiences(experiences)
                .services(services)
                .tests(tests)
                .approvedCountries(approvedCountries)
                .build();
    }

    @Override
    public MentorActivityResponse getMentorActivitiesByMentorEmail(String email) {
        List<Booking> bookings = bookingRepository.findByMentorIdAndPaymentProcess(email, PaymentProcess.COMPLETED);
        if (bookings.isEmpty()) {
            return MentorActivityResponse.builder()
                .pending(List.of())
                .confirmed(List.of())
                .completed(List.of())
                .cancelled(List.of())
                .build();
        }
        Map<String, List<BookingResponse>> grouped = bookings.stream()
            .map(this::toBookingResponse)
            .collect(Collectors.groupingBy(BookingResponse::getStatus));

        return MentorActivityResponse.builder()
            .pending(grouped.getOrDefault("PENDING", List.of()))
            .confirmed(grouped.getOrDefault("CONFIRMED", List.of()))
            .completed(grouped.getOrDefault("COMPLETED", List.of()))
            .cancelled(grouped.getOrDefault("CANCELLED", List.of()))
            .build();
    }

    private BookingResponse toBookingResponse(Booking b) {
        return BookingResponse.builder()
            .id(b.getId())
            .customer(BookingCustomerProfileResponse.builder()
                .id(b.getCustomer().getId())
                .fullname(b.getCustomer().getFullname())
                .email(b.getCustomer().getEmail())
                .phone(b.getCustomer().getPhone())
                .build())
            .service(b.getSchedule().getUser().getTitle()) // Hoặc tên service bạn muốn
            .date(b.getSchedule().getDate())
            .timeSlot(b.getSchedule().getTimeSlots().stream()
                .findFirst()
                .map(ts -> new BookingTimeSlotResponse(ts.getTimeStart(), ts.getTimeEnd()))
                .orElse(null))
            .status(b.getStatus().getCode().toUpperCase())
            .createdAt(b.getCreatedAt())
            .note(b.getDescription())
            .comment(b.getComment())
            .rating(b.getReview() != null ? b.getReview().getRating() : null)
            .review(b.getReview() != null ? b.getReview().getComment() : null)
            .build();
    }
  
  
    @Transactional(readOnly = true)
    public List<CountryResponse> getMentorCountries(Long mentorId) {
        User mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return mentor.getMentorCountries().stream()
                .filter(mentorCountry -> "APPROVED".equals(mentorCountry.getStatus().getCode()))
                .map(mentorCountry -> CountryResponse.builder()
                        .id(mentorCountry.getCountry().getId())
                        .code(mentorCountry.getCountry().getCode())
                        .name(mentorCountry.getCountry().getName())
                        .flagUrl(mentorCountry.getCountry().getFlagUrl())
                        .description(mentorCountry.getCountry().getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateMentorCountries(Long mentorId, List<Long> countryIds) {
        User mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Get APPROVED status
        Status approvedStatus = statusRepository.findByCode("APPROVED")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        // Remove existing mentor countries
        mentor.getMentorCountries().clear();

        // Add new mentor countries
        if (countryIds != null && !countryIds.isEmpty()) {
            for (Long countryId : countryIds) {
                Country country = countryRepository.findById(countryId)
                        .orElseThrow(() -> new AppException(ErrorCode.COUNTRY_NOT_FOUND));

                MentorCountry mentorCountry = new MentorCountry();
                mentorCountry.setMentor(mentor);
                mentorCountry.setCountry(country);
                mentorCountry.setStatus(approvedStatus);

                mentor.getMentorCountries().add(mentorCountry);
            }
        }

        mentorRepository.save(mentor);
    }

    // ===== MentorService CRUD Methods =====

    @Override
    @Transactional
    public MentorServiceResponse createMentorService(Long mentorId, MentorServiceRequest request) {
        log.info("Creating new mentor service for mentor id: {}", mentorId);

        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> {
                    log.error("Mentor not found with id: {}", mentorId);
                    return new AppException(ErrorCode.USER_NOT_EXISTED);
                });

        Status pendingStatus = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> {
                    log.error("PENDING status not found");
                    return new AppException(ErrorCode.STATUS_NOT_FOUND);
                });

        MentorService mentorService = MentorService.builder()
                .user(mentor)
                .serviceName(request.getServiceName())
                .description(request.getDescription())
                .status(pendingStatus)
                .createdBy(mentor)
                .build();

        mentorService = mentorServiceRepository.save(mentorService);
        log.info("Mentor service created successfully with id: {}", mentorService.getId());

        return toMentorServiceResponse(mentorService);
    }

    @Override
    @Transactional(readOnly = true)
    public MentorServiceResponse getMentorServiceById(Long serviceId) {
        log.info("Getting mentor service by id: {}", serviceId);

        MentorService mentorService = mentorServiceRepository.findByIdWithRelationships(serviceId)
                .orElseThrow(() -> {
                    log.error("Mentor service not found with id: {}", serviceId);
                    return new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND);
                });

        return toMentorServiceResponse(mentorService);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorServiceResponse> getMentorServicesByMentorId(Long mentorId) {
        log.info("Getting all mentor services for mentor id: {}", mentorId);

        userRepository.findById(mentorId)
                .orElseThrow(() -> {
                    log.error("Mentor not found with id: {}", mentorId);
                    return new AppException(ErrorCode.USER_NOT_EXISTED);
                });

        return mentorServiceRepository.findByMentorId(mentorId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MentorServiceResponse> getMentorServicesPaginated(Long mentorId, int page, int size) {
        log.info("Getting mentor services paginated for mentor id: {}, page: {}, size: {}", mentorId, page, size);

        userRepository.findById(mentorId)
                .orElseThrow(() -> {
                    log.error("Mentor not found with id: {}", mentorId);
                    return new AppException(ErrorCode.USER_NOT_EXISTED);
                });

        int pageNo = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        return mentorServiceRepository.findByMentorIdPaginated(mentorId, pageable);
    }

    @Override
    @Transactional
    public MentorServiceResponse updateMentorService(Long serviceId, Long mentorId, MentorServiceRequest request) {
        log.info("Updating mentor service id: {} for mentor id: {}", serviceId, mentorId);

        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> {
                    log.error("Mentor not found with id: {}", mentorId);
                    return new AppException(ErrorCode.USER_NOT_EXISTED);
                });

        MentorService mentorService = mentorServiceRepository.findByIdWithRelationships(serviceId)
                .orElseThrow(() -> {
                    log.error("Mentor service not found with id: {}", serviceId);
                    return new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND);
                });

        if (!mentorService.getUser().getId().equals(mentorId)) {
            log.error("Service id: {} does not belong to mentor id: {}", serviceId, mentorId);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Status pendingStatus = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> {
                    log.error("PENDING status not found");
                    return new AppException(ErrorCode.STATUS_NOT_FOUND);
                });

        mentorService.setServiceName(request.getServiceName());
        mentorService.setDescription(request.getDescription());
        mentorService.setStatus(pendingStatus); // Always set to PENDING after update
        mentorService.setUpdatedBy(mentor);

        mentorService = mentorServiceRepository.save(mentorService);
        log.info("Mentor service updated successfully with id: {}", serviceId);

        return toMentorServiceResponse(mentorService);
    }

    @Override
    @Transactional
    public void deleteMentorService(Long serviceId, Long mentorId) {
        log.info("Deleting mentor service id: {} for mentor id: {}", serviceId, mentorId);

        MentorService mentorService = mentorServiceRepository.findByIdWithRelationships(serviceId)
                .orElseThrow(() -> {
                    log.error("Mentor service not found with id: {}", serviceId);
                    return new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND);
                });

        if (!mentorService.getUser().getId().equals(mentorId)) {
            log.error("Service id: {} does not belong to mentor id: {}", serviceId, mentorId);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        mentorServiceRepository.deleteById(serviceId);
        log.info("Mentor service deleted successfully with id: {}", serviceId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorServiceResponse> getServicesByStatus(String statusCode) {
        log.info("Getting services by status code: {}", statusCode);

        List<MentorService> services = mentorServiceRepository.findByStatusCode(statusCode);
        return services.stream()
                .map(this::toMentorServiceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorServiceResponse> getServicesByMentorAndStatus(Long mentorId, String statusCode) {
        log.info("Getting services for mentor id: {} with status code: {}", mentorId, statusCode);

        userRepository.findById(mentorId)
                .orElseThrow(() -> {
                    log.error("Mentor not found with id: {}", mentorId);
                    return new AppException(ErrorCode.USER_NOT_EXISTED);
                });

        List<MentorService> services = mentorServiceRepository.findByMentorIdAndStatusCode(mentorId, statusCode);
        return services.stream()
                .map(this::toMentorServiceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MentorServiceResponse> searchServicesByKeywordAndStatus(String keyword, String statusCode, int page, int size) {
        log.info("Searching services by keyword: {}, status: {}, page: {}, size: {}", keyword, statusCode, page, size);

        int pageNo = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        String searchKeyword = "%" + keyword.toLowerCase() + "%";
        Page<MentorService> services = mentorServiceRepository.searchByKeywordAndStatus(searchKeyword, statusCode, pageable);

        return services.map(this::toMentorServiceResponse);
    }

    @Override
    @Transactional
    public MentorServiceResponse approveService(Long serviceId) {
        log.info("Approving mentor service id: {}", serviceId);

        MentorService mentorService = mentorServiceRepository.findByIdWithRelationships(serviceId)
                .orElseThrow(() -> {
                    log.error("Mentor service not found with id: {}", serviceId);
                    return new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND);
                });

        Status approvedStatus = statusRepository.findByCode("APPROVED")
                .orElseThrow(() -> {
                    log.error("APPROVED status not found");
                    return new AppException(ErrorCode.STATUS_NOT_FOUND);
                });

        mentorService.setStatus(approvedStatus);
        mentorService = mentorServiceRepository.save(mentorService);
        log.info("Mentor service approved successfully with id: {}", serviceId);

        return toMentorServiceResponse(mentorService);
    }

    @Override
    @Transactional
    public MentorServiceResponse rejectService(Long serviceId) {
        log.info("Rejecting mentor service id: {}", serviceId);

        MentorService mentorService = mentorServiceRepository.findByIdWithRelationships(serviceId)
                .orElseThrow(() -> {
                    log.error("Mentor service not found with id: {}", serviceId);
                    return new AppException(ErrorCode.MENTOR_SERVICE_NOT_FOUND);
                });

        Status rejectedStatus = statusRepository.findByCode("REJECTED")
                .orElseThrow(() -> {
                    log.error("REJECTED status not found");
                    return new AppException(ErrorCode.STATUS_NOT_FOUND);
                });

        mentorService.setStatus(rejectedStatus);
        mentorService = mentorServiceRepository.save(mentorService);
        log.info("Mentor service rejected successfully with id: {}", serviceId);

        return toMentorServiceResponse(mentorService);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorServiceResponse> getAllApprovedServices() {
        log.info("Getting all approved mentor services for public");
        return getServicesByStatus("APPROVED");
    }

    // ===== Helper Methods =====

    private MentorServiceResponse toMentorServiceResponse(MentorService mentorService) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return MentorServiceResponse.builder()
                .id(mentorService.getId())
                .serviceName(mentorService.getServiceName())
                .description(mentorService.getDescription())
                .status(mentorService.getStatus().getName())
                .statusCode(mentorService.getStatus().getCode())
                .mentorId(mentorService.getUser().getId())
                .mentorName(mentorService.getUser().getFullname())
                .createdAt(mentorService.getCreatedAt() != null ? mentorService.getCreatedAt().format(formatter) : null)
                .updatedAt(mentorService.getUpdatedAt() != null ? mentorService.getUpdatedAt().format(formatter) : null)
                .build();
    }
}
