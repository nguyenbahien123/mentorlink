import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Divider,
    IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import QRCode from 'react-qr-code';

/**
 * QR Payment Modal Component
 * Displays QR code and bank account info for embedded payment
 * Polls payment status every 3 seconds until payment is completed
 */
export const QRPaymentModal = ({ open, onClose, paymentData, bookingId, onPaymentSuccess }) => {
    const [checking, setChecking] = useState(false);
    const [copied, setCopied] = useState(null);
    const [pollCount, setPollCount] = useState(0);
    const [paymentCompleted, setPaymentCompleted] = useState(false);

    // Poll payment status every 3 seconds
    useEffect(() => {
        if (!open || !bookingId || paymentCompleted) return;

        const pollInterval = setInterval(async () => {
            try {
                setChecking(true);
                const response = await fetch(`/api/bookings/check-payment-status/${bookingId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                const data = await response.json();
                
                if (data.respCode === '0' && data.data?.paymentCompleted) {
                    setPaymentCompleted(true);
                    clearInterval(pollInterval);
                    
                    // Show success message briefly then close
                    setTimeout(() => {
                        onPaymentSuccess();
                        onClose();
                    }, 2000);
                }
                
                setPollCount(prev => prev + 1);
            } catch (error) {
                console.error('Error checking payment status:', error);
            } finally {
                setChecking(false);
            }
        }, 3000); // Poll every 3 seconds

        // Cleanup interval on unmount
        return () => clearInterval(pollInterval);
    }, [open, bookingId, paymentCompleted, onPaymentSuccess, onClose]);

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    if (!paymentData) return null;

    return (
        <Dialog 
            open={open} 
            onClose={paymentCompleted ? onClose : undefined}
            maxWidth="sm" 
            fullWidth
            disableEscapeKeyDown={!paymentCompleted}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {paymentCompleted ? '✅ Thanh toán thành công!' : '💳 Quét mã QR để thanh toán'}
                </Typography>
                {paymentCompleted && (
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                {paymentCompleted ? (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Thanh toán đã được xác nhận!
                        </Typography>
                        <Typography variant="body2">
                            Đơn đặt lịch #{bookingId} đã được xác nhận. Bạn sẽ được chuyển hướng...
                        </Typography>
                    </Alert>
                ) : (
                    <>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                📱 Mở app ngân hàng của bạn, chọn <strong>Quét mã QR</strong> và quét mã bên dưới để thanh toán.
                            </Typography>
                        </Alert>

                        {/* QR Code */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            mb: 3,
                            p: 3,
                            bgcolor: '#f5f5f5',
                            borderRadius: 2
                        }}>
                            <QRCode 
                                value={paymentData.qrCode} 
                                size={250}
                                level="M"
                            />
                        </Box>

                        <Divider sx={{ my: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                                Hoặc chuyển khoản thủ công
                            </Typography>
                        </Divider>

                        {/* Bank Account Info */}
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Thông tin chuyển khoản:
                            </Typography>

                            {/* Account Number */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Số tài khoản
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                                        {paymentData.accountNumber}
                                    </Typography>
                                </Box>
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleCopy(paymentData.accountNumber, 'accountNumber')}
                                    color={copied === 'accountNumber' ? 'success' : 'default'}
                                >
                                    {copied === 'accountNumber' ? <CheckCircleIcon /> : <ContentCopyIcon />}
                                </IconButton>
                            </Box>

                            {/* Account Name */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Chủ tài khoản
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {paymentData.accountName}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Bank */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Ngân hàng
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {paymentData.bin === '970422' ? 'MB Bank' : `Mã BIN: ${paymentData.bin}`}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Amount */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        Số tiền
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#d32f2f' }}>
                                        {Number(paymentData.amount).toLocaleString('vi-VN')} ₫
                                    </Typography>
                                </Box>
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleCopy(paymentData.amount.toString(), 'amount')}
                                    color={copied === 'amount' ? 'success' : 'default'}
                                >
                                    {copied === 'amount' ? <CheckCircleIcon /> : <ContentCopyIcon />}
                                </IconButton>
                            </Box>

                            {/* Description */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Nội dung chuyển khoản (bắt buộc)
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                        {paymentData.description}
                                    </Typography>
                                </Box>
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleCopy(paymentData.description, 'description')}
                                    color={copied === 'description' ? 'success' : 'default'}
                                >
                                    {copied === 'description' ? <CheckCircleIcon /> : <ContentCopyIcon />}
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Payment Status Indicator */}
                        {checking && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3, gap: 1 }}>
                                <CircularProgress size={16} />
                                <Typography variant="caption" color="textSecondary">
                                    Đang kiểm tra thanh toán... (Lần {pollCount})
                                </Typography>
                            </Box>
                        )}

                        <Alert severity="warning" sx={{ mt: 3 }}>
                            <Typography variant="body2">
                                ⚠️ <strong>Lưu ý:</strong> Vui lòng nhập đúng nội dung chuyển khoản để hệ thống tự động xác nhận thanh toán.
                            </Typography>
                        </Alert>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                {!paymentCompleted && (
                    <>
                        <Button 
                            onClick={() => window.open(paymentData.checkoutUrl, '_blank')}
                            variant="outlined"
                        >
                            Mở trang PayOS
                        </Button>
                        <Button onClick={onClose}>
                            Đóng
                        </Button>
                    </>
                )}
                {paymentCompleted && (
                    <Button onClick={onClose} variant="contained">
                        Đồng ý
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default QRPaymentModal;
