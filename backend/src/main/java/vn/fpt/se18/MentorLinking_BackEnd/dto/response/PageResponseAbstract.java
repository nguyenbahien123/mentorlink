package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public abstract class PageResponseAbstract implements Serializable {
    public int pageNumber;
    public int pageSize;
    public long totalPages;
    public long totalElements;
}
