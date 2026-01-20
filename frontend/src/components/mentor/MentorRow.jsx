import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaLinkedin, FaBookmark, FaGlobe } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getCountryName, getCountryFlagUrl } from '../../utils/mentorUtils';

const MentorRow = ({ mentor }) => {
    const navigate = useNavigate();

    const handleViewDetails = () => navigate(`/mentors/${mentor.id}`);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={i} className="text-warning me-1" />);
        }
        if (hasHalfStar) stars.push(<FaStar key="half" className="text-warning opacity-50 me-1" />);
        const empty = 5 - Math.ceil(rating || 0);
        for (let i = 0; i < empty; i++) stars.push(<FaStar key={`e-${i}`} className="text-muted me-1" />);
        return stars;
    };

    return (
        <Card className="mentor-row-card mb-4 shadow-sm">
            <div className="d-flex align-items-stretch">
                <div className="mentor-row-left p-4 d-flex flex-column align-items-center text-center">
                    <div className="mentor-avatar-wrapper-row mb-3">
                        <img src={mentor.avatarUrl || '/images/default-avatar.svg'} alt={mentor.fullname} className="mentor-avatar-row" onError={(e)=>{e.target.src='/images/default-avatar.svg'}} />
                    </div>
                    <h5 className="mb-1 fw-bold">{mentor.fullname}</h5>
                    <div className="text-muted small mb-2">{mentor.title}</div>
                    <div className="d-flex align-items-center mb-2">
                        <div className="me-2">{renderStars(mentor.rating)}</div>
                        <div className="text-muted">{mentor.rating || 0}</div>
                    </div>
                    <div className="text-muted small"><FaMapMarkerAlt className="me-1 text-primary"/>{mentor.currentLocation}</div>
                </div>

                <div className="mentor-row-right flex-grow-1 p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="mb-2">
                            <div className="mb-2">
                                {mentor.approvedCountries && mentor.approvedCountries.length > 0 && (
                                    <div className="d-flex flex-wrap gap-2 align-items-center">
                                        <FaGlobe className="text-primary me-1" />
                                        <small className="text-muted fw-semibold">Hỗ trợ du học:</small>
                                        <div className="ms-2">
                                            {mentor.approvedCountries.slice(0,3).map((c, idx) => (
                                                <Badge key={idx} bg="outline-primary" className="me-1 country-badge-row">{getCountryName(c)}</Badge>
                                            ))}
                                            {mentor.approvedCountries.length > 3 && (
                                                <Badge bg="secondary">+{mentor.approvedCountries.length-3}</Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="mb-2 text-muted mentor-row-intro">{mentor.intro || '-'}</p>

                            <div className="d-flex gap-2">
                                <Button variant="outline-primary" size="sm" onClick={handleViewDetails}>Xem chi tiết</Button>
                                <Button variant="outline-secondary" size="sm">Lưu</Button>
                                {mentor.linkedinUrl && (
                                    <Button variant="outline-primary" size="sm" href={mentor.linkedinUrl} target="_blank">LinkedIn</Button>
                                )}
                            </div>
                        </div>

                        <div className="text-end ms-3">
                            <div className="mb-2">
                                <h5 className="mb-0">{mentor.price ? new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(mentor.price) : '-'}</h5>
                                <small className="text-muted">Giá / buổi</small>
                            </div>
                            <div className="mt-3">
                                <Badge bg="info">{mentor.numberOfBooking || 0} booking</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Optionally add schedule preview here in future */}

                </div>
            </div>
        </Card>
    );
};

export default MentorRow;
