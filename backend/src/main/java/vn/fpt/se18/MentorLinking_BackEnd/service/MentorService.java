package vn.fpt.se18.MentorLinking_BackEnd.service;

import java.util.List;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorActivityResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.CountryResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorPageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorServiceResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor.MentorServiceRequest;
import org.springframework.data.domain.Page;

public interface MentorService {
     MentorPageResponse getAllMentors(String keyword, String country, String sort, int page, int size);

     MentorDetailResponse getMentorById(Long id);

     MentorActivityResponse getMentorActivitiesByMentorEmail(String email);
     
     List<CountryResponse> getMentorCountries(Long mentorId);
     
     void updateMentorCountries(Long mentorId, List<Long> countryIds);

     // MentorService CRUD methods
     /**
      * Create new mentor service with PENDING status
      */
     MentorServiceResponse createMentorService(Long mentorId, MentorServiceRequest request);

     /**
      * Get mentor service by id
      */
     MentorServiceResponse getMentorServiceById(Long serviceId);

     /**
      * Get all services by mentor id
      */
     List<MentorServiceResponse> getMentorServicesByMentorId(Long mentorId);

     /**
      * Get mentor services with pagination
      */
     Page<MentorServiceResponse> getMentorServicesPaginated(Long mentorId, int page, int size);

     /**
      * Update mentor service - status will be set to PENDING
      */
     MentorServiceResponse updateMentorService(Long serviceId, Long mentorId, MentorServiceRequest request);

     /**
      * Delete mentor service
      */
     void deleteMentorService(Long serviceId, Long mentorId);

     /**
      * Get all services by status (for admin)
      */
     List<MentorServiceResponse> getServicesByStatus(String statusCode);

     /**
      * Get services by mentor and status
      */
     List<MentorServiceResponse> getServicesByMentorAndStatus(Long mentorId, String statusCode);

     /**
      * Search services by keyword and status (for admin)
      */
     Page<MentorServiceResponse> searchServicesByKeywordAndStatus(String keyword, String statusCode, int page, int size);

     /**
      * Approve service (admin only)
      */
     MentorServiceResponse approveService(Long serviceId);

     /**
      * Reject service (admin only)
      */
     MentorServiceResponse rejectService(Long serviceId);

     /**
      * Public: Get all services that have been approved (for end-users)
      */
     List<MentorServiceResponse> getAllApprovedServices();
}
