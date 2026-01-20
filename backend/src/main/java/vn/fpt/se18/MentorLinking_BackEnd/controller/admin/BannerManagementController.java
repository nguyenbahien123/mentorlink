package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.banner.BannerCreateRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.banner.BannerFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.banner.BannerUpdateRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.BannerDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.BannerStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.BannerManagementService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin/banners")
@RequiredArgsConstructor
@Tag(name = "Admin - Banner Management", description = "APIs for managing banners")
@PreAuthorize("hasRole('ADMIN')")
public class BannerManagementController {

    private final BannerManagementService bannerManagementService;

    @PostMapping("/list")
    @Operation(summary = "Get all banners with filters and pagination")
    public ResponseEntity<BaseResponse<PageResponse<BannerDetailResponse>>> getAllBanners(
            @RequestBody BaseRequest<BannerFilterRequest> request) {
        log.info("Get all banners with filters: {}", request.getData());
        return ResponseEntity.ok(bannerManagementService.getAllBanners(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get banner by ID")
    public ResponseEntity<BaseResponse<BannerDetailResponse>> getBannerById(@PathVariable Long id) {
        log.info("Get banner by id: {}", id);
        return ResponseEntity.ok(bannerManagementService.getBannerById(id));
    }

    @PostMapping
    @Operation(summary = "Create new banner")
    public ResponseEntity<BaseResponse<BannerDetailResponse>> createBanner(
            @Valid @RequestBody BaseRequest<BannerCreateRequest> request) {
        log.info("Create new banner: {}", request.getData());
        return ResponseEntity.ok(bannerManagementService.createBanner(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update banner")
    public ResponseEntity<BaseResponse<BannerDetailResponse>> updateBanner(
            @PathVariable Long id,
            @RequestBody BaseRequest<BannerUpdateRequest> request) {
        log.info("Update banner {}: {}", id, request.getData());
        return ResponseEntity.ok(bannerManagementService.updateBanner(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete banner")
    public ResponseEntity<BaseResponse<Void>> deleteBanner(@PathVariable Long id) {
        log.info("Delete banner: {}", id);
        return ResponseEntity.ok(bannerManagementService.deleteBanner(id));
    }

    @PutMapping("/{id}/publish")
    @Operation(summary = "Publish banner")
    public ResponseEntity<BaseResponse<Void>> publishBanner(@PathVariable Long id) {
        log.info("Publish banner: {}", id);
        return ResponseEntity.ok(bannerManagementService.publishBanner(id));
    }

    @PutMapping("/{id}/unpublish")
    @Operation(summary = "Unpublish banner")
    public ResponseEntity<BaseResponse<Void>> unpublishBanner(@PathVariable Long id) {
        log.info("Unpublish banner: {}", id);
        return ResponseEntity.ok(bannerManagementService.unpublishBanner(id));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update banner status")
    public ResponseEntity<BaseResponse<Void>> updateBannerStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        log.info("Update banner {} status to: {}", id, status);
        return ResponseEntity.ok(bannerManagementService.updateBannerStatus(id, status));
    }

    @DeleteMapping("/bulk-delete")
    @Operation(summary = "Delete multiple banners")
    public ResponseEntity<BaseResponse<Void>> bulkDeleteBanners(@RequestBody List<Long> ids) {
        log.info("Bulk delete banners: {}", ids);
        return ResponseEntity.ok(bannerManagementService.bulkDeleteBanners(ids));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get banner statistics")
    public ResponseEntity<BaseResponse<BannerStatisticsResponse>> getStatistics() {
        log.info("Get banner statistics");
        return ResponseEntity.ok(bannerManagementService.getStatistics());
    }
}
