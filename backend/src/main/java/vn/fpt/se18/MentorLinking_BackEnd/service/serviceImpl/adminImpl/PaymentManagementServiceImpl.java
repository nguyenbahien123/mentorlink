package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl.adminImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.payment.PaymentFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PaymentHistoryDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PaymentStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Booking;
import vn.fpt.se18.MentorLinking_BackEnd.entity.PaymentHistory;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.repository.PaymentHistoryRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.PaymentManagementService;
import vn.fpt.se18.MentorLinking_BackEnd.util.BookingService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentManagementServiceImpl implements PaymentManagementService {

    private final PaymentHistoryRepository paymentHistoryRepository;
    private final StatusRepository statusRepository;

    @Override
    public BaseResponse<PageResponse<PaymentHistoryDetailResponse>> getAllPayments(BaseRequest<PaymentFilterRequest> request) {
        try {
            PaymentFilterRequest data = request.getData();
            
            Pageable pageable = PageRequest.of(
                    data.getPage() - 1,
                    data.getSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );

            // Parse date range
            LocalDateTime dateFrom = null;
            LocalDateTime dateTo = null;
            
            if (data.getDateFrom() != null && !data.getDateFrom().isEmpty()) {
                try {
                    dateFrom = LocalDate.parse(data.getDateFrom()).atStartOfDay();
                } catch (Exception e) {
                    log.warn("Invalid dateFrom format: {}", data.getDateFrom());
                }
            }
            
            if (data.getDateTo() != null && !data.getDateTo().isEmpty()) {
                try {
                    dateTo = LocalDate.parse(data.getDateTo()).atTime(LocalTime.MAX);
                } catch (Exception e) {
                    log.warn("Invalid dateTo format: {}", data.getDateTo());
                }
            }

            Page<PaymentHistory> paymentPage = paymentHistoryRepository.findAllWithCondition(
                    data.getKeySearch(),
                    data.getStatus(),
                    data.getPaymentMethod(),
                    dateFrom,
                    dateTo,
                    pageable
            );

            List<PaymentHistoryDetailResponse> paymentResponses = paymentPage.getContent().stream()
                    .map(this::convertToDetailResponse)
                    .collect(Collectors.toList());

            PageResponse<PaymentHistoryDetailResponse> pageResponse = PageResponse.<PaymentHistoryDetailResponse>builder()
                    .content(paymentResponses)
                    .totalElements(paymentPage.getTotalElements())
                    .totalPages(paymentPage.getTotalPages())
                    .currentPage(data.getPage())
                    .pageSize(data.getSize())
                    .build();

            return BaseResponse.<PageResponse<PaymentHistoryDetailResponse>>builder()
                    .respCode("0")
                    .description("Success")
                    .data(pageResponse)
                    .build();
        } catch (Exception e) {
            log.error("Error getting payments: ", e);
            return BaseResponse.<PageResponse<PaymentHistoryDetailResponse>>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<PaymentHistoryDetailResponse> getPaymentById(Long id) {
        try {
            Optional<PaymentHistory> paymentOpt = paymentHistoryRepository.findById(id);
            if (paymentOpt.isEmpty()) {
                return BaseResponse.<PaymentHistoryDetailResponse>builder()
                        .respCode("1")
                        .description("Payment not found")
                        .build();
            }

            return BaseResponse.<PaymentHistoryDetailResponse>builder()
                    .respCode("0")
                    .description("Success")
                    .data(convertToDetailResponse(paymentOpt.get()))
                    .build();
        } catch (Exception e) {
            log.error("Error getting payment by id: ", e);
            return BaseResponse.<PaymentHistoryDetailResponse>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<PaymentHistoryDetailResponse> getPaymentByTransactionCode(String transactionCode) {
        try {
            Optional<PaymentHistory> paymentOpt = paymentHistoryRepository.findByTransactionCode(transactionCode);
            if (paymentOpt.isEmpty()) {
                return BaseResponse.<PaymentHistoryDetailResponse>builder()
                        .respCode("1")
                        .description("Payment not found")
                        .build();
            }

            return BaseResponse.<PaymentHistoryDetailResponse>builder()
                    .respCode("0")
                    .description("Success")
                    .data(convertToDetailResponse(paymentOpt.get()))
                    .build();
        } catch (Exception e) {
            log.error("Error getting payment by transaction code: ", e);
            return BaseResponse.<PaymentHistoryDetailResponse>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> markAsCompleted(Long id) {
        try {
            Optional<PaymentHistory> paymentOpt = paymentHistoryRepository.findById(id);
            if (paymentOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Payment not found")
                        .build();
            }

            PaymentHistory payment = paymentOpt.get();
            
            Optional<Status> completedStatus = statusRepository.findByCode("COMPLETED");
            if (completedStatus.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("COMPLETED status not found")
                        .build();
            }

            payment.setStatus(completedStatus.get());
            payment.setUpdatedAt(LocalDateTime.now());
            paymentHistoryRepository.save(payment);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Payment marked as completed successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error marking payment as completed: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> markAsFailed(Long id, String reason) {
        try {
            Optional<PaymentHistory> paymentOpt = paymentHistoryRepository.findById(id);
            if (paymentOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Payment not found")
                        .build();
            }

            PaymentHistory payment = paymentOpt.get();
            
            Optional<Status> failedStatus = statusRepository.findByCode("FAILED");
            if (failedStatus.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("FAILED status not found")
                        .build();
            }

            payment.setStatus(failedStatus.get());
            payment.setUpdatedAt(LocalDateTime.now());
            // Note: Consider adding a field to store failure reason
            paymentHistoryRepository.save(payment);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Payment marked as failed successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error marking payment as failed: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public BaseResponse<Void> processRefund(Long id, String reason) {
        try {
            Optional<PaymentHistory> paymentOpt = paymentHistoryRepository.findById(id);
            if (paymentOpt.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("Payment not found")
                        .build();
            }

            PaymentHistory payment = paymentOpt.get();
            
            Optional<Status> refundedStatus = statusRepository.findByCode("REFUNDED");
            if (refundedStatus.isEmpty()) {
                return BaseResponse.<Void>builder()
                        .respCode("1")
                        .description("REFUNDED status not found")
                        .build();
            }

            payment.setStatus(refundedStatus.get());
            payment.setUpdatedAt(LocalDateTime.now());
            // Note: Consider adding fields to store refund amount and reason
            paymentHistoryRepository.save(payment);

            return BaseResponse.<Void>builder()
                    .respCode("0")
                    .description("Refund processed successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error processing refund: ", e);
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public BaseResponse<PaymentStatisticsResponse> getStatistics() {
        try {
            long pendingCount = paymentHistoryRepository.countByStatusCode("PENDING");
            long completedCount = paymentHistoryRepository.countByStatusCode("COMPLETED");
            long failedCount = paymentHistoryRepository.countByStatusCode("FAILED");
            long refundedCount = paymentHistoryRepository.countByStatusCode("REFUNDED");
            long totalPayments = paymentHistoryRepository.count();
            
            BigDecimal totalRevenue = paymentHistoryRepository.calculateTotalRevenue();
            BigDecimal totalCommission = paymentHistoryRepository.calculateTotalCommission();
            BigDecimal totalRefunded = paymentHistoryRepository.calculateTotalRefunded();
            BigDecimal monthlyRevenue = paymentHistoryRepository.calculateMonthlyRevenue();

            PaymentStatisticsResponse statistics = PaymentStatisticsResponse.builder()
                    .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                    .totalCommission(totalCommission != null ? totalCommission : BigDecimal.ZERO)
                    .totalRefunded(totalRefunded != null ? totalRefunded : BigDecimal.ZERO)
                    .monthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO)
                    .totalPayments(totalPayments)
                    .completedCount(completedCount)
                    .pendingCount(pendingCount)
                    .failedCount(failedCount)
                    .refundedCount(refundedCount)
                    .build();

            return BaseResponse.<PaymentStatisticsResponse>builder()
                    .respCode("0")
                    .description("Success")
                    .data(statistics)
                    .build();
        } catch (Exception e) {
            log.error("Error getting statistics: ", e);
            return BaseResponse.<PaymentStatisticsResponse>builder()
                    .respCode("1")
                    .description("Error: " + e.getMessage())
                    .build();
        }
    }

    // Helper methods
    
    private PaymentHistoryDetailResponse convertToDetailResponse(PaymentHistory payment) {
        Booking booking = payment.getBooking();
        
        // Calculate commission (10% of amount)
        BigDecimal commission = payment.getAmount().multiply(new BigDecimal("0.1"));
        BigDecimal mentorAmount = payment.getAmount().subtract(commission);
        
        // Determine refund amount based on status
        BigDecimal refundAmount = "REFUNDED".equals(payment.getStatus().getCode()) 
                ? payment.getAmount() 
                : BigDecimal.ZERO;

        return PaymentHistoryDetailResponse.builder()
                .id(payment.getId())
                // Transaction info
                .transactionCode(payment.getTransactionCode())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .statusCode(payment.getStatus() != null ? payment.getStatus().getCode() : null)
                .statusName(payment.getStatus() != null ? payment.getStatus().getName() : null)
                // Booking info
                .bookingId(booking != null ? booking.getId() : null)
                .service(booking != null && booking.getService() != null ? booking.getService().name() : null)
                // Mentor info
                .mentorId(booking != null && booking.getMentor() != null ? booking.getMentor().getId() : null)
                .mentorName(booking != null && booking.getMentor() != null ? booking.getMentor().getFullname() : null)
                .mentorEmail(booking != null && booking.getMentor() != null ? booking.getMentor().getEmail() : null)
                // Customer info
                .customerId(booking != null && booking.getCustomer() != null ? booking.getCustomer().getId() : null)
                .customerName(booking != null && booking.getCustomer() != null ? booking.getCustomer().getFullname() : null)
                .customerEmail(booking != null && booking.getCustomer() != null ? booking.getCustomer().getEmail() : null)
                // Financial details
                .commission(commission)
                .mentorAmount(mentorAmount)
                .refundAmount(refundAmount)
                // Gateway info (placeholder - add fields to entity if needed)
                .gatewayResponse("Payment processed successfully")
                .refundReason(null) // TODO: Add field to entity
                // Timestamps
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .completedAt("COMPLETED".equals(payment.getStatus().getCode()) ? payment.getUpdatedAt() : null)
                .refundedAt("REFUNDED".equals(payment.getStatus().getCode()) ? payment.getUpdatedAt() : null)
                .failedAt("FAILED".equals(payment.getStatus().getCode()) ? payment.getUpdatedAt() : null)
                .build();
    }
}
