package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorCountryResponse;

import java.util.List;

public interface MentorCountryService {
    List<MentorCountryResponse> getAllApprovedMentorCountries();
}
