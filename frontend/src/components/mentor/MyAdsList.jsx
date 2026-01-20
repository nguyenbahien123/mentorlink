// src/components/mentor/MyAdsList.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Badge, Image, Alert } from 'react-bootstrap';
import { getMyMentorAds } from '../../services/admin/mentorAdService'; // (Sửa lại đường dẫn nếu cần)

const MyAdsList = ({ refreshKey }) => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Lấy danh sách QC của mentor, sắp xếp mới nhất
        getMyMentorAds({ page: 0, size: 20, sort: 'createdAt,desc' })
            .then(res => {
                setAds(res.data?.content || []);
            })
            .catch(err => console.error("Không thể tải danh sách quảng cáo:", err))
            .finally(() => setLoading(false));
    }, [refreshKey]); // Sẽ tự động tải lại khi 'refreshKey' thay đổi

    // Hàm helper để đổi màu Badge dựa trên string status
    const getStatusBadge = (statusName) => {
        if (statusName === 'APPROVED') return "success";
        if (statusName === 'REJECTED') return "danger";
        return "warning"; // PENDING
    };

    // Hàm helper để đổi chữ Status
     const getStatusText = (statusName) => {
        if (statusName === 'APPROVED') return "Đã duyệt";
        if (statusName === 'REJECTED') return "Bị từ chối";
        return "Chờ duyệt"; // PENDING
    };

    return (
        <Card>
            <Card.Header><h5 className="mb-0">Quảng cáo của tôi</h5></Card.Header>
            <Card.Body className="p-0">
                {loading ? (
                    <div className="text-center p-5"><Spinner animation="border" /></div>
                ) : ads.length === 0 ? (
                    <Alert variant="info" className="m-3 text-center">
                        Bạn chưa tải lên quảng cáo nào.
                    </Alert>
                ) : (
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th>Ảnh</th>
                                <th>Tiêu đề</th>
                                <th>Trạng thái</th>
                                <th>Lý do từ chối (nếu có)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ads.map(ad => (
                                <tr key={ad.id}>
                                    <td>
                                        <Image src={ad.imageUrl} width={100} thumbnail />
                                    </td>
                                    <td>{ad.title}</td>
                                    <td>
                                        <Badge bg={getStatusBadge(ad.status)}>
                                            {getStatusText(ad.status)}
                                        </Badge>
                                    </td>
                                    <td>
                                        {ad.rejectionReason && (
                                            <span className="text-danger small">{ad.rejectionReason}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );
};

export default MyAdsList;