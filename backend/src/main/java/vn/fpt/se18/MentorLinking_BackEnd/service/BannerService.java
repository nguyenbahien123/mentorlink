package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BannerResponse;

import java.util.List;

public interface BannerService {
    List<BannerResponse> getTop5ActivePublished();
}
