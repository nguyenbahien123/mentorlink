package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BlogPageResponse extends PageResponseAbstract {
    private List<BlogResponse> blogs;
}
