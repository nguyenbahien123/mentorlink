import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Alert,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { useToast } from '../../contexts/ToastContext';
import { cleanupUnpaidBookings } from '../../services/booking/bookingApi';

export const BookingFailedPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const errorCode = searchParams.get('code');

    useEffect(() => {
        showToast('Thanh toán thất bại. Vui lòng thử lại!', 'error');

        // Cleanup unpaid bookings after 5 seconds
        const timer = setTimeout(() => {
            console.log('Triggering cleanup of unpaid bookings...');
            cleanupUnpaidBookings();
        }, 5000);

        return () => clearTimeout(timer);
    }, [showToast]);

    const getErrorMessage = (code) => {
        const messages = {
            '07': 'Merchant không hợp lệ',
            '09': 'Độ dài dữ liệu không hợp lệ',
            '10': 'Số tiền không hợp lệ',
            '11': 'Sai checksum',
            '12': 'Khách hàng hủy giao dịch',
            '13': 'Hết thời gian chờ',
            '20': 'Tài khoản không tồn tại',
            '21': 'Tài khoản bị khóa',
            '22': 'Tài khoản bị điểm',
            '23': 'Sai mật khẩu',
            '24': 'Mật khẩu hết hạn',
            '25': 'Tài khoản chưa được kích hoạt',
            '26': 'Tài khoản chưa cấu hình đầy đủ',
            '27': 'Không đủ tiền trong tài khoản',
            '28': 'Tài khoản không hỗ trợ giao dịch này',
            '29': 'Tài khoản bị hạn chế',
            '30': 'Quá giới hạn giao dịch',
            '31': 'Mã OTP không đúng',
            '32': 'Sai số thứ tự giao dịch',
            '99': 'Lỗi hệ thống',
        };
        return messages[code] || 'Lỗi thanh toán không xác định. Vui lòng liên hệ support.';
    };

    const handleRetry = () => {
        navigate(-1);
    };

    const handleBackHome = () => {
        navigate('/');
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Card elevation={3}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <ErrorIcon
                        sx={{
                            fontSize: 80,
                            color: 'error.main',
                            mb: 2,
                        }}
                    />

                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
                        Thanh toán thất bại
                    </Typography>

                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                        Giao dịch thanh toán của bạn không thành công.
                    </Typography>

                    <Alert severity="error" sx={{ mb: 3, justifyContent: 'flex-start' }}>
                        <Typography variant="body2">
                            <strong>Lý do:</strong> {getErrorMessage(errorCode)}
                        </Typography>
                    </Alert>

                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Vui lòng kiểm tra thông tin tài khoản hoặc thử lại sau.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            onClick={handleBackHome}
                        >
                            Quay về trang chủ
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleRetry}
                        >
                            Thử lại
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default BookingFailedPage;
