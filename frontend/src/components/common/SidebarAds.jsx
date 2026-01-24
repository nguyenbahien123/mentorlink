import React, { useState, useEffect } from 'react';
import { Card, Image, Spinner } from 'react-bootstrap';
import { getActiveMentorAds } from '../../services/admin/mentorAdService';

const SidebarAds = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getActiveMentorAds()
            .then(response => {
                const adsData = response.data || [];
                // Lấy 2 ads mới nhất (giả sử backend trả về sorted by createdAt desc)
                const latestAds = adsData.slice(0, 2);
                setAds(latestAds);
            })
            .catch(err => console.error("Không thể tải QC Mentor:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" size="sm" variant="primary" />
            </div>
        );
    }

    if (ads.length === 0) {
        return null;
    }

    return (
        <div className="mentor-ads-sidebar">
            <div className="mb-3">
                <h6 className="text-secondary fw-semibold mb-0" style={{ fontSize: '0.9rem' }}>
                    GỢI Ý TỪ MENTOR
                </h6>
            </div>
            
            <div className="ads-container">
                {ads.map((ad, index) => (
                    <Card 
                        key={ad.id} 
                        className="ad-card shadow-sm border-0 overflow-hidden"
                        style={{ 
                            marginBottom: index === ads.length - 1 ? '0' : '1rem',
                            borderRadius: '10px'
                        }}
                    >
                        <a 
                            href={ad.linkUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            title={ad.title}
                            style={{ 
                                textDecoration: 'none',
                                display: 'block',
                                position: 'relative',
                                overflow: 'hidden',
                                paddingBottom: '150%', // Tạo tỷ lệ 2:3 (dọc dài hơn)
                                height: 0
                            }}
                        >
                            <Card.Img 
                                variant="top" 
                                src={ad.imageUrl} 
                                alt={ad.title}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            />
                        </a>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SidebarAds;