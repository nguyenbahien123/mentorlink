package vn.fpt.se18.MentorLinking_BackEnd.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BasePageRequest {
    @NotNull(message = "Page number must not be null")
    @Min(value = 1, message = "Page number must be greater than or equal to 1")
    private Integer page;
    @NotNull(message = "Size number must not be null")
    @Min(value = 1, message = "Size number must be greater than or equal to 1")
    private Integer size;
}
