import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Image, Badge } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaMapMarkerAlt, FaImage, FaUniversity, FaCreditCard, FaSave, FaEdit } from 'react-icons/fa';
import { instance } from '../../api/axios';
import { API_ENDPOINTS, USER_ROLES } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import '../../styles/components/Profile.css';
import MentorService from '../../services/mentor/MentorService';

const allowedFieldsForCustomer = [
    'username', 'email', 'fullname', 'dob', 'phone', 'gender', 'address', 'avatarUrl', 'bankAccountNumber', 'bankName'
];

const ProfilePage = () => {
    const fileInputRef = React.useRef();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await MentorService.getCurrentMentorProfile();
                // res may contain wrapper (data) or direct object depending on interceptors
                const data = res?.data || res;
                setProfile(data);
                // Initialize form with allowed fields (for customer) or all fields
                const initial = {};
                if ((user?.role || '').toUpperCase() === USER_ROLES.CUSTOMER) {
                    allowedFieldsForCustomer.forEach(k => { initial[k] = data[k] ?? ''; });
                } else {
                    // non-customer: show all returned fields
                    Object.keys(data || {}).forEach(k => { initial[k] = data[k] ?? ''; });
                }
                setForm(initial);
            } catch (error) {
                console.error('Fetch profile error', error);
                showToast('Không thể tải thông tin hồ sơ', { variant: 'danger' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, showToast]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setAvatarFile(files[0] || null);
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAvatarEditClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            let res, data;
            if (avatarFile) {
                // Gửi multipart/form-data nếu có file
                const formData = new FormData();
                Object.entries(form).forEach(([key, value]) => {
                    if (key !== 'email') formData.append(key, value);
                });
                formData.append('avatarFile', avatarFile);
                res = await instance.put(API_ENDPOINTS.USERS.UPDATE, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Gửi JSON như cũ nếu không có file
                const payload = { ...form };
                delete payload.email;
                res = await instance.put(API_ENDPOINTS.USERS.UPDATE, payload);
            }
            data = res?.data || res;
            showToast('Cập nhật hồ sơ thành công', { variant: 'success' });
            setProfile(prev => ({ ...prev, ...form }));
            setAvatarFile(null);
        } catch (error) {
            console.error('Update profile error', error);
            const message = error?.description || error?.message || 'Cập nhật thất bại';
            showToast(message, { variant: 'danger' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container fluid className="py-5 px-0">

                <Row>
                    <Col className="text-center">
                        <Spinner animation="border" />
                    </Col>
                </Row>
            </Container>
        );
    }

    if (!profile) {
        return (
            <Container className="py-5">
                <Row>
                    <Col md={8} className="mx-auto">
                        <Card>
                            <Card.Header>
                                <h4>Hồ sơ cá nhân</h4>
                            </Card.Header>
                            <Card.Body>
                                <p>Không có dữ liệu hồ sơ.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    const isCustomer = (user?.role || '').toUpperCase() === USER_ROLES.CUSTOMER;
    const avatarUrl = (avatarFile ? URL.createObjectURL(avatarFile) : (form.avatarUrl || '/images/default-avatar.svg'));


    return (
        <div className="profile-page">
            {/* Header Background */}
            <div className="profile-header-bg"></div>

            <Container className="py-5">
                <div className="profile-container">
                    {/* Avatar & User Card */}
                    <Row className="mb-5">
                        <Col lg={12} className="mx-auto">
                            <Card className="profile-card shadow-lg">
                                <Card.Body>
                                    <Row>
                                        {/* Avatar Section */}
                                        <Col lg={4} md={5} className="text-center profile-avatar-section">
                                            <div className="profile-avatar-wrapper">
                                                <Image
                                                    src={avatarUrl}
                                                    onError={(e) => { e.target.src = '/images/default-avatar.svg'; }}
                                                    roundedCircle
                                                    className="profile-avatar"
                                                    alt={form.fullname || 'User Avatar'}
                                                />
                                                <div className="avatar-overlay" style={{ cursor: 'pointer' }} onClick={handleAvatarEditClick}>
                                                    <FaEdit className="avatar-edit-icon" />
                                                </div>
                                                <input
                                                    type="file"
                                                    name="avatarFile"
                                                    accept="image/*"
                                                    ref={fileInputRef}
                                                    style={{ display: 'none' }}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <h4 className="mt-4 fw-bold text-secondary">{form.fullname || 'Người dùng'}</h4>
                                            <p className="text-muted">
                                                <Badge bg="info" className="me-2">
                                                    {isCustomer ? 'Khách hàng' : 'Cố vấn'}
                                                </Badge>
                                            </p>
                                            <div className="profile-stats mt-4">
                                                {profile?.numberOfBooking && (
                                                    <div className="stat-item">
                                                        <h6 className="text-muted">Booking</h6>
                                                        <h5 className="fw-bold text-primary">{profile.numberOfBooking || 0}</h5>
                                                    </div>
                                                )}
                                                {profile?.rating && (
                                                    <div className="stat-item">
                                                        <h6 className="text-muted">Đánh giá</h6>
                                                        <h5 className="fw-bold text-warning">{profile.rating || 0}⭐</h5>
                                                    </div>
                                                )}
                                            </div>
                                        </Col>

                                        {/* Form Section */}
                                        <Col lg={8} md={7}>
                                            <Form onSubmit={handleSubmit} className="profile-form">
                                                {/* Row 1: Username & Email */}
                                                <Row className="mb-4">
                                                    <Col md={6}>
                                                        <Form.Group controlId="username">
                                                            <Form.Label className="form-label-custom">
                                                                <FaUser className="me-2 text-primary" /> Username
                                                            </Form.Label>
                                                            <Form.Control
                                                                className="form-control-custom"
                                                                name="username"
                                                                value={form.username || ''}
                                                                onChange={handleChange}
                                                                placeholder="Nhập username"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group controlId="email">
                                                            <Form.Label className="form-label-custom">
                                                                <FaEnvelope className="me-2 text-primary" /> Email
                                                            </Form.Label>
                                                            <Form.Control
                                                                className="form-control-custom"
                                                                name="email"
                                                                value={form.email || ''}
                                                                disabled
                                                                placeholder="Email"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                {/* Row 2: Fullname & Phone */}
                                                <Row className="mb-4">
                                                    <Col md={6}>
                                                        <Form.Group controlId="fullname">
                                                            <Form.Label className="form-label-custom">
                                                                <FaUser className="me-2 text-primary" /> Họ và tên
                                                            </Form.Label>
                                                            <Form.Control
                                                                className="form-control-custom"
                                                                name="fullname"
                                                                value={form.fullname || ''}
                                                                onChange={handleChange}
                                                                placeholder="Họ và tên"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group controlId="phone">
                                                            <Form.Label className="form-label-custom">
                                                                <FaPhone className="me-2 text-primary" /> Điện thoại
                                                            </Form.Label>
                                                            <Form.Control
                                                                className="form-control-custom"
                                                                name="phone"
                                                                value={form.phone || ''}
                                                                onChange={handleChange}
                                                                placeholder="Số điện thoại"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                {/* Row 3: DOB & Gender */}
                                                <Row className="mb-4">
                                                    <Col md={6}>
                                                        <Form.Group controlId="dob">
                                                            <Form.Label className="form-label-custom">
                                                                <FaBirthdayCake className="me-2 text-primary" /> Ngày sinh
                                                            </Form.Label>
                                                            <Form.Control
                                                                className="form-control-custom"
                                                                type="date"
                                                                name="dob"
                                                                value={form.dob ? form.dob.split('T')?.[0] : ''}
                                                                onChange={handleChange}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group controlId="gender">
                                                            <Form.Label className="form-label-custom">Giới tính</Form.Label>
                                                            <Form.Select
                                                                className="form-control-custom"
                                                                name="gender"
                                                                value={form.gender || ''}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">-- Chọn giới tính --</option>
                                                                <option value="MALE">Nam</option>
                                                                <option value="FEMALE">Nữ</option>
                                                                <option value="OTHER">Khác</option>
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                {/* Row 4: Address & Avatar URL */}
                                                <Row className="mb-4">
                                                    <Col md={6}>
                                                        <Form.Group controlId="address">
                                                            <Form.Label className="form-label-custom">
                                                                <FaMapMarkerAlt className="me-2 text-primary" /> Địa chỉ
                                                            </Form.Label>
                                                            <Form.Control
                                                                className="form-control-custom"
                                                                name="address"
                                                                value={form.address || ''}
                                                                onChange={handleChange}
                                                                placeholder="Địa chỉ"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    {/* Avatar URL input đã bị ẩn theo yêu cầu */}
                                                </Row>

                                                {/* Row 5: Bank & Degree */}
                                                <Row className="mb-4">
                                                    <Col md={6}>
                                                        <Form.Group controlId="bankAccountNumber">
                                                            <Form.Label className="form-label-custom">
                                                                <FaCreditCard className="me-2 text-primary" /> Số tài khoản
                                                            </Form.Label>
                                                            <Form.Control
                                                                className="form-control-custom"
                                                                name="bankAccountNumber"
                                                                value={form.bankAccountNumber || ''}
                                                                onChange={handleChange}
                                                                placeholder="Số tài khoản"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group controlId="bankName">
                                                            <Form.Label className="form-label-custom">
                                                                <FaCreditCard className="me-2 text-primary" /> Ngân hàng
                                                            </Form.Label>
                                                            <Form.Control
                                                                className="form-control-custom"
                                                                name="bankName"
                                                                value={form.bankName || ''}
                                                                onChange={handleChange}
                                                                placeholder="Tên ngân hàng"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                {/* Action Buttons */}
                                                <Row className="mt-5">
                                                    <Col className="d-flex justify-content-end gap-3">
                                                        <Button
                                                            variant="outline-secondary"
                                                            className="btn-cancel"
                                                            onClick={() => window.history.back()}
                                                        >
                                                            Quay lại
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            disabled={saving}
                                                            className="btn-save-profile"
                                                        >
                                                            {saving ? (
                                                                <>
                                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                                    Đang lưu...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FaSave className="me-2" /> Lưu thay đổi
                                                                </>
                                                            )}
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </Form>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
};

export default ProfilePage;
