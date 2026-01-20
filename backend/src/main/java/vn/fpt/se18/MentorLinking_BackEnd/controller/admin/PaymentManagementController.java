package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.payment.PaymentFilterRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PaymentHistoryDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.PaymentStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.PaymentManagementService;

@Slf4j
@RestController
@RequestMapping("/admin/payments")
@RequiredArgsConstructor
@Tag(name = "Admin - Payment Management", description = "APIs for managing payment history")
@PreAuthorize("hasRole('ADMIN')")
public class PaymentManagementController {

    private final PaymentManagementService paymentManagementService;

    @PostMapping("/list")
    @Operation(summary = "Get all payments with filters and pagination")
    public ResponseEntity<BaseResponse<PageResponse<PaymentHistoryDetailResponse>>> getAllPayments(
            @RequestBody BaseRequest<PaymentFilterRequest> request) {
        log.info("Get all payments with filters: {}", request.getData());
        return ResponseEntity.ok(paymentManagementService.getAllPayments(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<BaseResponse<PaymentHistoryDetailResponse>> getPaymentById(@PathVariable Long id) {
        log.info("Get payment by id: {}", id);
        return ResponseEntity.ok(paymentManagementService.getPaymentById(id));
    }

    @GetMapping("/transaction/{transactionCode}")
    @Operation(summary = "Get payment by transaction code")
    public ResponseEntity<BaseResponse<PaymentHistoryDetailResponse>> getPaymentByTransactionCode(
            @PathVariable String transactionCode) {
        log.info("Get payment by transaction code: {}", transactionCode);
        return ResponseEntity.ok(paymentManagementService.getPaymentByTransactionCode(transactionCode));
    }

    @PutMapping("/{id}/complete")
    @Operation(summary = "Mark payment as completed")
    public ResponseEntity<BaseResponse<Void>> markAsCompleted(@PathVariable Long id) {
        log.info("Mark payment as completed: {}", id);
        return ResponseEntity.ok(paymentManagementService.markAsCompleted(id));
    }

    @PutMapping("/{id}/fail")
    @Operation(summary = "Mark payment as failed")
    public ResponseEntity<BaseResponse<Void>> markAsFailed(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        log.info("Mark payment as failed: {} with reason: {}", id, reason);
        return ResponseEntity.ok(paymentManagementService.markAsFailed(id, reason));
    }

    @PutMapping("/{id}/refund")
    @Operation(summary = "Process refund for payment")
    public ResponseEntity<BaseResponse<Void>> processRefund(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        log.info("Process refund for payment: {} with reason: {}", id, reason);
        return ResponseEntity.ok(paymentManagementService.processRefund(id, reason));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get payment statistics")
    public ResponseEntity<BaseResponse<PaymentStatisticsResponse>> getStatistics() {
        log.info("Get payment statistics");
        return ResponseEntity.ok(paymentManagementService.getStatistics());
    }
}
