import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useToast } from '../../contexts/ToastContext';

export const BookingSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bookingId] = useState(searchParams.get('bookingId'));
    const { showToast } = useToast();

    useEffect(() => {
        // Simulate payment verification completion
        const timer = setTimeout(() => {
            setLoading(false);
            if (bookingId) {
                showToast('Đặt lịch thành công!', 'success');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [bookingId, showToast]);

    const handleBackHome = () => {
        navigate('/');
    };

    const handleViewBooking = () => {
        navigate('/my-bookings');
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Card elevation={3}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon
                        sx={{
                            fontSize: 80,
                            color: 'success.main',
                            mb: 2,
                        }}
                    />

                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                        Đặt lịch thành công!
                    </Typography>

                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                        Lịch hẹn của bạn đã được xác nhận. Bạn sẽ nhận được email thông báo từ mentor.
                    </Typography>

                    {bookingId && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                <strong>ID lịch hẹn:</strong> {bookingId}
                            </Typography>
                        </Alert>
                    )}

                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Vui lòng kiểm tra email để nhận thêm thông tin chi tiết về lịch hẹn.
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
                            onClick={handleViewBooking}
                        >
                            Xem lịch hẹn của tôi
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default BookingSuccessPage;
