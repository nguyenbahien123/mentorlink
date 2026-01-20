package vn.fpt.se18.MentorLinking_BackEnd.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.country.CountryApprovalRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.country.CountrySuggestionRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.CountryResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.CountryService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/countries")
@RequiredArgsConstructor
@Tag(name = "Country Controller", description = "APIs for country management")
@Slf4j
public class CountryController {

    private final CountryService countryService;

    @GetMapping
    @Operation(summary = "Get all approved countries")
    public BaseResponse<List<CountryResponse>> getApprovedCountries() {
        log.info("REST request to get all approved countries");
        List<CountryResponse> data = countryService.getApprovedCountries();
        return BaseResponse.<List<CountryResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get approved countries successfully")
                .data(data)
                .build();
    }

    @GetMapping("/pending")
    @Operation(summary = "Get all pending country suggestions")
    public BaseResponse<List<CountryResponse>> getPendingCountries() {
        log.info("REST request to get all pending countries");
        List<CountryResponse> data = countryService.getPendingCountries();
        return BaseResponse.<List<CountryResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get pending countries successfully")
                .data(data)
                .build();
    }

    @PostMapping("/suggest")
    @Operation(summary = "Submit a new country suggestion")
    public BaseResponse<CountryResponse> suggestCountry(@Valid @RequestBody CountrySuggestionRequest request) {
        log.info("REST request to suggest country: {}", request.getName());
        CountryResponse data = countryService.suggestCountry(request);
        return BaseResponse.<CountryResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Country suggested successfully")
                .data(data)
                .build();
    }

    @PutMapping("/{countryId}/approve")
    @Operation(summary = "Approve a country suggestion (Admin only)")
    public BaseResponse<CountryResponse> approveCountry(
            @PathVariable Long countryId,
            @Valid @RequestBody CountryApprovalRequest request) {
        log.info("REST request to approve country with ID: {}", countryId);
        CountryResponse data = countryService.approveCountry(countryId, request);
        return BaseResponse.<CountryResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Country approved successfully")
                .data(data)
                .build();
    }

    @DeleteMapping("/{countryId}/reject")
    @Operation(summary = "Reject a country suggestion (Admin only)")
    public BaseResponse<Void> rejectCountry(
            @PathVariable Long countryId,
            @RequestBody Map<String, String> requestBody) {
        log.info("REST request to reject country with ID: {}", countryId);
        String reason = requestBody.get("reason");
        countryService.rejectCountry(countryId, reason);
        return BaseResponse.<Void>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Country rejected successfully. All associated MentorCountry records have been rejected.")
                .build();
    }

    @PutMapping("/{countryId}/unapprove")
    @Operation(summary = "Unapprove a country - revert to pending status (Admin only)")
    public BaseResponse<CountryResponse> unapproveCountry(@PathVariable Long countryId) {
        log.info("REST request to unapprove country with ID: {}", countryId);
        CountryResponse data = countryService.unapproveCountry(countryId);
        return BaseResponse.<CountryResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Country reverted to pending status. Associated MentorCountry records updated.")
                .data(data)
                .build();
    }

    @DeleteMapping("/{countryId}")
    @Operation(summary = "Delete a country (Admin only)")
    public BaseResponse<Void> deleteCountry(@PathVariable Long countryId) {
        log.info("REST request to delete country with ID: {}", countryId);
        countryService.deleteCountry(countryId);
        return BaseResponse.<Void>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Country deleted successfully. All associated MentorCountry records have been removed.")
                .build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search countries by keyword")
    public BaseResponse<List<CountryResponse>> searchCountries(@RequestParam String keyword) {
        log.info("REST request to search countries with keyword: {}", keyword);
        List<CountryResponse> data = countryService.searchCountries(keyword);
        return BaseResponse.<List<CountryResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Search completed successfully")
                .data(data)
                .build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Get country statistics")
    public BaseResponse<Object> getCountryStats() {
        log.info("REST request to get country statistics");
        Object data = countryService.getCountryStats();
        return BaseResponse.builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get statistics successfully")
                .data(data)
                .build();
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular countries (most mentors)")
    public BaseResponse<List<CountryResponse>> getPopularCountries(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("REST request to get popular countries with limit: {}", limit);
        List<CountryResponse> data = countryService.getPopularCountries(limit);
        return BaseResponse.<List<CountryResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get popular countries successfully")
                .data(data)
                .build();
    }

    @GetMapping("/continent/{continentName}")
    @Operation(summary = "Get all countries by continent name")
    public BaseResponse<List<CountryResponse>> getCountriesByContinent(
            @PathVariable String continentName) {
        log.info("REST request to get countries by continent: {}", continentName);
        List<CountryResponse> data = countryService.getCountriesByContinent(continentName);
        return BaseResponse.<List<CountryResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get countries by continent successfully")
                .data(data)
                .build();
    }

    @GetMapping("/continent/{continentName}/approved")
    @Operation(summary = "Get approved countries by continent name")
    public BaseResponse<List<CountryResponse>> getApprovedCountriesByContinent(
            @PathVariable String continentName) {
        log.info("REST request to get approved countries by continent: {}", continentName);
        List<CountryResponse> data = countryService.getApprovedCountriesByContinent(continentName);
        return BaseResponse.<List<CountryResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get approved countries by continent successfully")
                .data(data)
                .build();
    }
}
