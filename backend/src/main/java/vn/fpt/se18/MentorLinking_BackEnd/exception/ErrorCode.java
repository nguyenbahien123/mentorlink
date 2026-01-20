package vn.fpt.se18.MentorLinking_BackEnd.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    UNCATEGORIZED("01", "UNCATEGORIZED", HttpStatus.INTERNAL_SERVER_ERROR),
    METHOD_NOT_ALLOWED("02", "METHOD_NOT_ALLOWED", HttpStatus.METHOD_NOT_ALLOWED),
    UNAUTHORIZED("03", "UNAUTHORIZED", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED("04", "UNAUTHENTICATED", HttpStatus.UNAUTHORIZED),
    INVALID_INPUT("05", "INVALID_INPUT", HttpStatus.BAD_REQUEST),
    ERROR_PATH("06", "ERROR_PATH", HttpStatus.BAD_REQUEST),
    INVALID_ENDPOINT("07", "INVALID_ENDPOINT", HttpStatus.BAD_REQUEST),
    JWT_EXPIRED("08", "JWT token has expired", HttpStatus.UNAUTHORIZED),
    JWT_INVALID_SIGNATURE("09", "JWT signature is invalid", HttpStatus.UNAUTHORIZED),
    JWT_MALFORMED("10", "JWT token is malformed", HttpStatus.UNAUTHORIZED),
    JWT_UNSUPPORTED("11", "JWT token is unsupported", HttpStatus.UNAUTHORIZED),
    JWT_ILLEGAL_ARGUMENT("12", "JWT token is invalid", HttpStatus.UNAUTHORIZED),
    EMAIL_INVALID("30", "EMAIL_INVALID", HttpStatus.BAD_REQUEST),
    SEND_MAIL_FAILED("31", "SEND_MAIL_FAILED", HttpStatus.INTERNAL_SERVER_ERROR),


    ROLE_NOT_FOUND("13", "Vai trò không tồn tại", HttpStatus.NOT_FOUND),
    ROLE_CODE_EXISTED("14", "Mã vai trò đã tồn tại", HttpStatus.BAD_REQUEST),
    ROLE_NAME_EXISTED("15", "Tên vai trò đã tồn tại", HttpStatus.BAD_REQUEST),
    ROLE_IN_USE("16", "Vai trò đang được sử dụng, không thể xóa", HttpStatus.BAD_REQUEST),
    PERMISSION_NOT_FOUND("17", "Quyền không tồn tại", HttpStatus.NOT_FOUND),
    PERMISSION_NAME_EXISTED("18", "Tên quyền đã tồn tại", HttpStatus.BAD_REQUEST),
    
    // Country related errors
    COUNTRY_NOT_FOUND("19", "Quốc gia không tồn tại", HttpStatus.NOT_FOUND),
    COUNTRY_ALREADY_EXISTS("20", "Quốc gia đã tồn tại", HttpStatus.BAD_REQUEST),
    STATUS_NOT_FOUND("21", "Trạng thái không tồn tại", HttpStatus.NOT_FOUND),
    STATUS_NOT_EXISTED("21", "Trạng thái không tồn tại", HttpStatus.NOT_FOUND),
    USER_NOT_EXISTED("22", "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    BANNER_NOT_EXISTED("23", "Banner không tồn tại", HttpStatus.NOT_FOUND),
    MENTOR_SERVICE_NOT_FOUND("24", "Dịch vụ mentor không tồn tại", HttpStatus.NOT_FOUND),
    ACCOUNT_LOCKED("25", "Tài khoản đã bị khóa", HttpStatus.FORBIDDEN),
    MENTOR_PENDING_APPROVAL("26", "Yêu cầu làm cố vấn của bạn đang chờ phê duyệt", HttpStatus.FORBIDDEN),
    ;
    
    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
