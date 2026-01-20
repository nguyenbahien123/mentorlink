import React from 'react';
import { Spinner, Alert, Button } from 'react-bootstrap';

// Loading Component
export const Loading = ({ message = "Đang tải..." }) => (
    <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">{message}</p>
    </div>
);

// Error Component
export const ErrorAlert = ({
    error,
    onRetry,
    retryText = "Thử lại",
    showRetry = true
}) => (
    <Alert variant="danger">
        <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
        <p>{error}</p>
        {showRetry && onRetry && (
            <Button variant="outline-danger" onClick={onRetry}>
                {retryText}
            </Button>
        )}
    </Alert>
);

// No Data Component
export const NoData = ({
    message = "Không có dữ liệu",
    description,
    onAction,
    actionText = "Thử lại"
}) => (
    <Alert variant="info" className="text-center">
        <h5>{message}</h5>
        {description && <p>{description}</p>}
        {onAction && (
            <Button variant="primary" onClick={onAction}>
                {actionText}
            </Button>
        )}
    </Alert>
);