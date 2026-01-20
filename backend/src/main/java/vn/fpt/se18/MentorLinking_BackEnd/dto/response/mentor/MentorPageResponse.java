package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import lombok.Getter;
import lombok.Setter;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponseAbstract;

import java.util.List;


@Getter
@Setter
public class MentorPageResponse extends PageResponseAbstract {
    private List<MentorResponse> mentors;
}
