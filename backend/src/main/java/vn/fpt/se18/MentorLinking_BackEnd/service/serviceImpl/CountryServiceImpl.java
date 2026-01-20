package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.country.CountryApprovalRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.country.CountrySuggestionRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.CountryResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Country;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.repository.CountryRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.CountryService;
import vn.fpt.se18.MentorLinking_BackEnd.util.CONTINENTS;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CountryServiceImpl implements CountryService {

    private final CountryRepository countryRepository;
    private final StatusRepository statusRepository;
    private final UserRepository userRepository;
    private final vn.fpt.se18.MentorLinking_BackEnd.repository.MentorCountryRepository mentorCountryRepository;

    @Override
    public List<CountryResponse> getApprovedCountries() {
        log.info("Fetching all approved countries");
        List<Country> countries = countryRepository.findAllByStatus_Code("APPROVED");
        return countries.stream()
                .map(this::toCountryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CountryResponse> getPendingCountries() {
        log.info("Fetching all pending countries");
        List<Country> countries = countryRepository.findAllByStatus_Code("PENDING");
        return countries.stream()
                .map(this::toCountryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CountryResponse suggestCountry(CountrySuggestionRequest request) {
        log.info("Suggesting new country: {} ({})", request.getName(), request.getCode());
        
        // Check if country already exists
        if (countryRepository.findByCode(request.getCode()).isPresent()) {
            throw new AppException(ErrorCode.COUNTRY_ALREADY_EXISTS);
        }
        
        // Get PENDING status
        Status pendingStatus = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));
        
        // Get user who suggested
        User suggestedBy = userRepository.findById(request.getSuggestedBy())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Create new country
        Country country = Country.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .status(pendingStatus)
                .createdBy(suggestedBy)
                .build();
        
        Country savedCountry = countryRepository.save(country);
        log.info("Country suggestion saved with ID: {}", savedCountry.getId());
        
        return toCountryResponse(savedCountry);
    }

    @Override
    @Transactional
    public CountryResponse approveCountry(Long countryId, CountryApprovalRequest request) {
        log.info("Approving country with ID: {}", countryId);
        
        Country country = countryRepository.findById(countryId)
                .orElseThrow(() -> new AppException(ErrorCode.COUNTRY_NOT_FOUND));
        
        // Get APPROVED status
        Status approvedStatus = statusRepository.findByCode("APPROVED")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));
        
        // 1. Update country
        country.setStatus(approvedStatus);
        if (request.getFlagUrl() != null) {
            country.setFlagUrl(request.getFlagUrl());
        }
        if (request.getDescription() != null) {
            country.setDescription(request.getDescription());
        }
        
        Country updatedCountry = countryRepository.save(country);
        log.info("Country approved: {}", updatedCountry.getName());
        
        // 2. Auto-approve all PENDING MentorCountry records associated with this country
        List<vn.fpt.se18.MentorLinking_BackEnd.entity.MentorCountry> mentorCountries = 
                mentorCountryRepository.findByCountryId(countryId);
        
        if (!mentorCountries.isEmpty()) {
            // Only approve PENDING ones, keep others unchanged
            List<vn.fpt.se18.MentorLinking_BackEnd.entity.MentorCountry> pendingMentorCountries = 
                    mentorCountries.stream()
                            .filter(mc -> "PENDING".equals(mc.getStatus().getCode()))
                            .collect(java.util.stream.Collectors.toList());
            
            pendingMentorCountries.forEach(mc -> mc.setStatus(approvedStatus));
            mentorCountryRepository.saveAll(pendingMentorCountries);
            log.info("Auto-approved {} PENDING MentorCountry records for country: {}", 
                    pendingMentorCountries.size(), updatedCountry.getName());
        }
        
        return toCountryResponse(updatedCountry);
    }

    @Override
    @Transactional
    public void rejectCountry(Long countryId, String reason) {
        log.info("Rejecting country with ID: {}", countryId);
        
        Country country = countryRepository.findById(countryId)
                .orElseThrow(() -> new AppException(ErrorCode.COUNTRY_NOT_FOUND));
        
        // Get REJECTED status
        Status rejectedStatus = statusRepository.findByCode("REJECTED")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));
        
        // 1. Reject the country
        country.setStatus(rejectedStatus);
        countryRepository.save(country);
        log.info("Country rejected: {}", country.getName());
        
        // 2. Auto-reject all MentorCountry records associated with this country
        List<vn.fpt.se18.MentorLinking_BackEnd.entity.MentorCountry> mentorCountries = 
                mentorCountryRepository.findByCountryId(countryId);
        
        if (!mentorCountries.isEmpty()) {
            mentorCountries.forEach(mc -> mc.setStatus(rejectedStatus));
            mentorCountryRepository.saveAll(mentorCountries);
            log.info("Rejected {} MentorCountry records for country: {}", 
                    mentorCountries.size(), country.getName());
        }
    }

    @Override
    @Transactional
    public CountryResponse unapproveCountry(Long countryId) {
        log.info("Unapproving country with ID: {}", countryId);
        
        Country country = countryRepository.findById(countryId)
                .orElseThrow(() -> new AppException(ErrorCode.COUNTRY_NOT_FOUND));
        
        // Get PENDING status
        Status pendingStatus = statusRepository.findByCode("PENDING")
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));
        
        // 1. Set country back to pending
        country.setStatus(pendingStatus);
        Country updatedCountry = countryRepository.save(country);
        log.info("Country unapproved: {}", updatedCountry.getName());
        
        // 2. Set all APPROVED MentorCountry records back to PENDING
        List<vn.fpt.se18.MentorLinking_BackEnd.entity.MentorCountry> mentorCountries = 
                mentorCountryRepository.findByCountryId(countryId);
        
        if (!mentorCountries.isEmpty()) {
            List<vn.fpt.se18.MentorLinking_BackEnd.entity.MentorCountry> approvedMentorCountries = 
                    mentorCountries.stream()
                            .filter(mc -> "APPROVED".equals(mc.getStatus().getCode()))
                            .collect(java.util.stream.Collectors.toList());
            
            approvedMentorCountries.forEach(mc -> mc.setStatus(pendingStatus));
            mentorCountryRepository.saveAll(approvedMentorCountries);
            log.info("Set {} APPROVED MentorCountry records back to PENDING for country: {}", 
                    approvedMentorCountries.size(), updatedCountry.getName());
        }
        
        return toCountryResponse(updatedCountry);
    }

    @Override
    @Transactional
    public void deleteCountry(Long countryId) {
        log.info("Deleting country with ID: {}", countryId);
        
        Country country = countryRepository.findById(countryId)
                .orElseThrow(() -> new AppException(ErrorCode.COUNTRY_NOT_FOUND));
        
        // Check if there are any mentor countries associated
        List<vn.fpt.se18.MentorLinking_BackEnd.entity.MentorCountry> mentorCountries = 
                mentorCountryRepository.findByCountryId(countryId);
        
        if (!mentorCountries.isEmpty()) {
            // Delete all mentor country associations first
            mentorCountryRepository.deleteAll(mentorCountries);
            log.info("Deleted {} MentorCountry records for country: {}", 
                    mentorCountries.size(), country.getName());
        }
        
        // Delete the country
        countryRepository.delete(country);
        log.info("Country deleted: {}", country.getName());
    }

    @Override
    public List<CountryResponse> searchCountries(String keyword) {
        log.info("Searching countries with keyword: {}", keyword);
        
        List<Country> countries = countryRepository.searchCountries(keyword, "APPROVED");
        return countries.stream()
                .map(this::toCountryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Object getCountryStats() {
        log.info("Fetching country statistics");
        
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalApproved", countryRepository.countByStatus_Code("APPROVED"));
        stats.put("totalPending", countryRepository.countByStatus_Code("PENDING"));
        stats.put("totalRejected", countryRepository.countByStatus_Code("REJECTED"));
        stats.put("totalCountries", countryRepository.count());
        
        return stats;
    }

    @Override
    public List<CountryResponse> getPopularCountries(int limit) {
        log.info("Fetching top {} popular countries", limit);
        
        Pageable pageable = PageRequest.of(0, limit);
        List<Country> countries = countryRepository.findPopularCountries(pageable);
        
        return countries.stream()
                .map(this::toCountryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CountryResponse> getCountriesByContinent(String continentName) {
        log.info("Fetching countries by continent: {}", continentName);

        try {
            CONTINENTS continent = CONTINENTS.valueOf(continentName.toUpperCase());
            List<Country> countries = countryRepository.findByContinent(continent);
            return countries.stream()
                    .map(this::toCountryResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            log.error("Invalid continent name: {}", continentName);
            throw new AppException(ErrorCode.INVALID_INPUT);
        }
    }

    @Override
    public List<CountryResponse> getApprovedCountriesByContinent(String continentName) {
        log.info("Fetching approved countries by continent: {}", continentName);

        try {
            CONTINENTS continent = CONTINENTS.valueOf(continentName.toUpperCase());
            List<Country> countries = countryRepository.findByContinent(continent, "APPROVED");
            return countries.stream()
                    .map(this::toCountryResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            log.error("Invalid continent name: {}", continentName);
            throw new AppException(ErrorCode.INVALID_INPUT);
        }
    }

    private CountryResponse toCountryResponse(Country country) {
        if (country == null) {
            return null;
        }
        
        String continentName = country.getContinent() != null ? country.getContinent().name() : null;

        return CountryResponse.builder()
                .id(country.getId())
                .code(country.getCode())
                .name(country.getName())
                .flagUrl(country.getFlagUrl())
                .description(country.getDescription())
                .continent(continentName)
                .continentName(continentName)
                .build();
    }
}
