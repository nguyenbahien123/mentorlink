package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.GetMentorRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.MentorManagementResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.MentorService;

import java.util.List;

@Slf4j
@Validated
@RestController
@RequestMapping("/admin/mentor-management")
@Tag(name = "Mentor Management Controller")
@RequiredArgsConstructor
public class MentorManagementController {

    private final MentorService mentorService;

    @PostMapping("/get-all-mentors")
    public BaseResponse<PageResponse<MentorManagementResponse>> getAllMentorsWithCondition(
            @Valid @RequestBody BaseRequest<GetMentorRequest> request) {
        return mentorService.getAllMentorsWithCondition(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get mentor details by ID")
    public BaseResponse<MentorManagementResponse> getMentorById(@PathVariable Long id) {
        return mentorService.getMentorById(id);
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve a mentor application")
    public BaseResponse<Void> approveMentor(@PathVariable Long id) {
        return mentorService.approveMentor(id);
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject a mentor application")
    public BaseResponse<Void> rejectMentor(@PathVariable Long id) {
        return mentorService.rejectMentor(id);
    }

    @PutMapping("/bulk-approve")
    @Operation(summary = "Bulk approve mentor applications")
    public BaseResponse<Void> bulkApproveMentors(@RequestBody List<Long> mentorIds) {
        return mentorService.bulkApproveMentors(mentorIds);
    }

    @PutMapping("/bulk-reject")
    @Operation(summary = "Bulk reject mentor applications")
    public BaseResponse<Void> bulkRejectMentors(@RequestBody List<Long> mentorIds) {
        return mentorService.bulkRejectMentors(mentorIds);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a mentor")
    public BaseResponse<Void> deleteMentor(@PathVariable Long id) {
        return mentorService.deleteMentor(id);
    }

    @GetMapping("/statistics")
    public BaseResponse<MentorStatisticsResponse> getMentorStatistics() {
        return mentorService.getMentorStatistics();
    }

    @GetMapping("/{id}/education")
    @Operation(summary = "Get mentor's education history")
    public BaseResponse<?> getMentorEducation(@PathVariable Long id) {
        return mentorService.getMentorEducation(id);
    }

    @GetMapping("/{id}/experience")
    @Operation(summary = "Get mentor's work experience")
    public BaseResponse<?> getMentorExperience(@PathVariable Long id) {
        return mentorService.getMentorExperience(id);
    }

    @GetMapping("/{id}/certificates")
    @Operation(summary = "Get mentor's certificates and tests")
    public BaseResponse<?> getMentorCertificates(@PathVariable Long id) {
        return mentorService.getMentorCertificates(id);
    }

    @GetMapping("/{id}/services")
    @Operation(summary = "Get mentor's services")
    public BaseResponse<?> getMentorServices(@PathVariable Long id) {
        return mentorService.getMentorServices(id);
    }

    @GetMapping("/{id}/countries")
    @Operation(summary = "Get mentor's countries")
    public BaseResponse<?> getMentorCountries(@PathVariable Long id) {
        return mentorService.getMentorCountries(id);
    }
}
