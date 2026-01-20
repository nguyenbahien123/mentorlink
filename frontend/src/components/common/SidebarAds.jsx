import React, { useState, useEffect } from 'react';
import { Card, Image, Spinner } from 'react-bootstrap';
import { getActiveMentorAds } from '../../services/admin/mentorAdService';
const SidebarAds = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getActiveMentorAds()
            .then(response => {
                setAds(response.data || []); // Lấy data từ BaseResponse
            })
            .catch(err => console.error("Không thể tải QC Mentor:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="text-center p-3"><Spinner animation="border" size="sm" /></div>;
    }

    if (ads.length === 0) {
        return null;
    }

    return (
        <div className="mentor-ads-sidebar">
            <h6 className="text-muted mb-3">GỢI Ý TỪ MENTOR</h6>
            {ads.map(ad => (
                <Card key={ad.id} className="mb-3 shadow-sm border-0">
                    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" title={ad.title}>
                        <Card.Img variant="top" src={ad.imageUrl} alt={ad.title} />
                    </a>
                </Card>
            ))}
        </div>
    );
};

export default SidebarAds;