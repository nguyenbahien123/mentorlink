import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
    Box,
    Typography,
    Alert,
} from '@mui/material';
import { createBookingAndGetPaymentUrl } from '../../services/booking/bookingApi';

export const BookingModal = ({ open, onClose, scheduleId, scheduleDate, schedulePrice, onSuccess }) => {
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!description.trim()) {
            setError('Vui lòng nhập nội dung hỏi');
            return;
        }

        if (description.trim().length < 10) {
            setError('Nội dung hỏi phải có ít nhất 10 ký tự');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await createBookingAndGetPaymentUrl(scheduleId, description);

            if (response.respCode === '0' && response.data) {
                // Redirect to VNPay payment URL
                window.location.href = response.data;
            } else {
                setError(response.description || 'Tạo đơn đặt lịch thất bại');
            }
        } catch (err) {
            setError(err.description || 'Lỗi khi tạo đơn đặt lịch');
            console.error('Booking error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setDescription('');
            setError('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Xác nhận đặt lịch
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                        <strong>Ngày:</strong> {scheduleDate}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        <strong>Giá:</strong> {schedulePrice?.toLocaleString('vi-VN')} đ
                    </Typography>
                </Box>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Nội dung muốn hỏi"
                    placeholder="Nhập nội dung câu hỏi hoặc mong muốn được giải đáp..."
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value);
                        setError('');
                    }}
                    disabled={loading}
                    variant="outlined"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            fontFamily: 'inherit',
                        },
                    }}
                />

                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    Tối thiểu 10 ký tự
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    sx={{
                        background: loading ? '#ccc' : '#1976d2',
                    }}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Đang xử lý...
                        </>
                    ) : (
                        'Thanh toán ngay'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BookingModal;
