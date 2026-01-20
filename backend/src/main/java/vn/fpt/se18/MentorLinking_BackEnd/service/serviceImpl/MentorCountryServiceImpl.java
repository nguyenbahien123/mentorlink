package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.CountryResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorCountryResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorCountry;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorCountryRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorCountryService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorCountryServiceImpl implements MentorCountryService {

    private final MentorCountryRepository mentorCountryRepository;

    @Override
    public List<MentorCountryResponse> getAllApprovedMentorCountries() {
        List<MentorCountry> list = mentorCountryRepository.findAllByStatus_Code("APPROVED");
        return list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private MentorCountryResponse toResponse(MentorCountry mc) {
        if (mc == null) return null;
        CountryResponse country = null;
        if (mc.getCountry() != null) {
            country = CountryResponse.builder()
                    .id(mc.getCountry().getId())
                    .code(mc.getCountry().getCode())
                    .name(mc.getCountry().getName())
                    .flagUrl(mc.getCountry().getFlagUrl())
                    .description(mc.getCountry().getDescription())
                    .build();
        }

        return MentorCountryResponse.builder()
                .id(mc.getId())
                .country(country)
                .status(mc.getStatus() != null ? mc.getStatus().getCode() : null)
                .createdAt(mc.getCreatedAt())
                .build();
    }
}
