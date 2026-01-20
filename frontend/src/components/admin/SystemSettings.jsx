import React, { useState } from 'react';
import {
    Card, Row, Col, Form, Button, Alert,
    Nav, Tab, Table, Badge, Modal
} from 'react-bootstrap';
import {
    FaCog, FaSave, FaDatabase, FaEnvelope, FaPaypal,
    FaBell, FaGlobe, FaShieldAlt, FaKey, FaServer,
    FaCode, FaEdit, FaTrash, FaPlus, FaEye
} from 'react-icons/fa';

const SystemSettings = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('email'); // 'email', 'payment', etc.
    const [settings, setSettings] = useState({
        // General settings
        siteName: 'MentorLink',
        siteUrl: 'https://mentorlink.vn',
        adminEmail: 'admin@mentorlink.vn',
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'vi',

        // Email settings
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'noreply@mentorlink.vn',
        smtpPassword: '••••••••',
        smtpEncryption: 'TLS',

        // Payment settings
        vnpayEnabled: true,
        vnpayTmnCode: 'MENTOR123',
        vnpayHashSecret: '••••••••',
        momoEnabled: true,
        momoPartnerCode: 'MENTOR456',
        momoAccessKey: '••••••••',
        commissionRate: 10,

        // Notification settings
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,

        // Security settings
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordMinLength: 8,
        maxLoginAttempts: 5,

        // Backup settings
        autoBackup: true,
        backupFrequency: 'daily',
        backupRetention: 30
    });

    const emailTemplates = [
        {
            id: 1,
            name: 'welcome_email',
            subject: 'Chào mừng đến với MentorLink',
            description: 'Email chào mừng người dùng mới',
            isActive: true,
            lastModified: '2024-01-15'
        },
        {
            id: 2,
            name: 'booking_confirmation',
            subject: 'Xác nhận đặt lịch tư vấn',
            description: 'Email xác nhận khi đặt lịch thành công',
            isActive: true,
            lastModified: '2024-01-14'
        },
        {
            id: 3,
            name: 'mentor_approved',
            subject: 'Đơn đăng ký mentor đã được duyệt',
            description: 'Email thông báo mentor được phê duyệt',
            isActive: true,
            lastModified: '2024-01-13'
        },
        {
            id: 4,
            name: 'password_reset',
            subject: 'Đặt lại mật khẩu',
            description: 'Email đặt lại mật khẩu',
            isActive: true,
            lastModified: '2024-01-12'
        }
    ];

    const systemLogs = [
        {
            id: 1,
            timestamp: '2024-01-15 10:30:00',
            level: 'INFO',
            module: 'AUTH',
            message: 'User login: admin@mentorlink.vn',
            ip: '192.168.1.100'
        },
        {
            id: 2,
            timestamp: '2024-01-15 10:25:00',
            level: 'ERROR',
            module: 'PAYMENT',
            message: 'VNPay payment failed: Invalid signature',
            ip: '203.162.10.45'
        },
        {
            id: 3,
            timestamp: '2024-01-15 10:20:00',
            level: 'WARNING',
            module: 'BOOKING',
            message: 'High booking request rate detected',
            ip: '14.241.125.78'
        },
        {
            id: 4,
            timestamp: '2024-01-15 10:15:00',
            level: 'INFO',
            module: 'EMAIL',
            message: 'Welcome email sent to user: newuser@email.com',
            ip: 'SYSTEM'
        }
    ];

    const handleSaveSettings = (category) => {
        // Simulate API call
        alert(`Đã lưu cấu hình ${category}`);
    };

    const handleTestEmail = () => {
        alert('Đang gửi email test...');
    };

    const handleTestPayment = () => {
        alert('Đang test kết nối payment gateway...');
    };

    const getLogLevelBadge = (level) => {
        switch (level) {
            case 'ERROR': return 'danger';
            case 'WARNING': return 'warning';
            case 'INFO': return 'info';
            case 'DEBUG': return 'secondary';
            default: return 'secondary';
        }
    };

    return (
        <div className="system-settings">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Cấu hình hệ thống</h4>
                    <p className="text-muted mb-0">Quản lý các thiết lập và cấu hình hệ thống</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-info" size="sm">
                        <FaDatabase className="me-1" />
                        Backup ngay
                    </Button>
                    <Button variant="primary" size="sm">
                        <FaServer className="me-1" />
                        Khởi động lại
                    </Button>
                </div>
            </div>

            <Tab.Container defaultActiveKey="general">
                <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="general">
                            <FaGlobe className="me-2" />
                            Cài đặt chung
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="email">
                            <FaEnvelope className="me-2" />
                            Email & Template
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="payment">
                            <FaPaypal className="me-2" />
                            Thanh toán
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="security">
                            <FaShieldAlt className="me-2" />
                            Bảo mật
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="logs">
                            <FaCode className="me-2" />
                            Logs & Monitor
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    {/* General Settings Tab */}
                    <Tab.Pane eventKey="general">
                        <Card>
                            <Card.Header>
                                <h6 className="mb-0">Cài đặt chung</h6>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tên website</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={settings.siteName}
                                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>URL website</Form.Label>
                                            <Form.Control
                                                type="url"
                                                value={settings.siteUrl}
                                                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Email admin</Form.Label>
                                            <Form.Control
                                                type="email"
                                                value={settings.adminEmail}
                                                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Múi giờ</Form.Label>
                                            <Form.Select
                                                value={settings.timezone}
                                                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                            >
                                                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                                                <option value="Asia/Bangkok">Asia/Bangkok</option>
                                                <option value="UTC">UTC</option>
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Ngôn ngữ mặc định</Form.Label>
                                            <Form.Select
                                                value={settings.language}
                                                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                            >
                                                <option value="vi">Tiếng Việt</option>
                                                <option value="en">English</option>
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Tỷ lệ hoa hồng (%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                max="50"
                                                value={settings.commissionRate}
                                                onChange={(e) => setSettings({ ...settings, commissionRate: parseInt(e.target.value) })}
                                            />
                                            <Form.Text className="text-muted">
                                                Tỷ lệ hoa hồng hệ thống nhận từ mỗi giao dịch
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-end">
                                    <Button variant="primary" onClick={() => handleSaveSettings('general')}>
                                        <FaSave className="me-1" />
                                        Lưu cài đặt
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>

                    {/* Email Settings Tab */}
                    <Tab.Pane eventKey="email">
                        <Row>
                            <Col md={6}>
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h6 className="mb-0">Cấu hình SMTP</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form.Group className="mb-3">
                                            <Form.Label>SMTP Host</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={settings.smtpHost}
                                                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                                            />
                                        </Form.Group>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Port</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={settings.smtpPort}
                                                        onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Mã hóa</Form.Label>
                                                    <Form.Select
                                                        value={settings.smtpEncryption}
                                                        onChange={(e) => setSettings({ ...settings, smtpEncryption: e.target.value })}
                                                    >
                                                        <option value="TLS">TLS</option>
                                                        <option value="SSL">SSL</option>
                                                        <option value="NONE">None</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Username</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={settings.smtpUser}
                                                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={settings.smtpPassword}
                                                onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                                            />
                                        </Form.Group>

                                        <div className="d-flex gap-2">
                                            <Button variant="outline-info" onClick={handleTestEmail}>
                                                Test Email
                                            </Button>
                                            <Button variant="primary" onClick={() => handleSaveSettings('email')}>
                                                <FaSave className="me-1" />
                                                Lưu
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card>
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">Email Templates</h6>
                                        <Button variant="primary" size="sm">
                                            <FaPlus className="me-1" />
                                            Thêm template
                                        </Button>
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        <Table responsive hover className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Template</th>
                                                    <th>Trạng thái</th>
                                                    <th>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {emailTemplates.map((template) => (
                                                    <tr key={template.id}>
                                                        <td>
                                                            <div>
                                                                <div className="fw-medium">{template.subject}</div>
                                                                <small className="text-muted">{template.description}</small>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge bg={template.isActive ? 'success' : 'secondary'}>
                                                                {template.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-1">
                                                                <Button variant="outline-primary" size="sm">
                                                                    <FaEdit />
                                                                </Button>
                                                                <Button variant="outline-danger" size="sm">
                                                                    <FaTrash />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab.Pane>

                    {/* Payment Settings Tab */}
                    <Tab.Pane eventKey="payment">
                        <Row>
                            <Col md={6}>
                                <Card className="mb-4">
                                    <Card.Header>
                                        <h6 className="mb-0">VNPay Configuration</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="switch"
                                                label="Kích hoạt VNPay"
                                                checked={settings.vnpayEnabled}
                                                onChange={(e) => setSettings({ ...settings, vnpayEnabled: e.target.checked })}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>TMN Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={settings.vnpayTmnCode}
                                                onChange={(e) => setSettings({ ...settings, vnpayTmnCode: e.target.value })}
                                                disabled={!settings.vnpayEnabled}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Hash Secret</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={settings.vnpayHashSecret}
                                                onChange={(e) => setSettings({ ...settings, vnpayHashSecret: e.target.value })}
                                                disabled={!settings.vnpayEnabled}
                                            />
                                        </Form.Group>

                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="outline-info"
                                                onClick={handleTestPayment}
                                                disabled={!settings.vnpayEnabled}
                                            >
                                                Test Connection
                                            </Button>
                                            <Button variant="primary" onClick={() => handleSaveSettings('vnpay')}>
                                                <FaSave className="me-1" />
                                                Lưu
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card>
                                    <Card.Header>
                                        <h6 className="mb-0">MoMo Configuration</h6>
                                    </Card.Header>
                                    <Card.Body>
                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="switch"
                                                label="Kích hoạt MoMo"
                                                checked={settings.momoEnabled}
                                                onChange={(e) => setSettings({ ...settings, momoEnabled: e.target.checked })}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Partner Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={settings.momoPartnerCode}
                                                onChange={(e) => setSettings({ ...settings, momoPartnerCode: e.target.value })}
                                                disabled={!settings.momoEnabled}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Access Key</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={settings.momoAccessKey}
                                                onChange={(e) => setSettings({ ...settings, momoAccessKey: e.target.value })}
                                                disabled={!settings.momoEnabled}
                                            />
                                        </Form.Group>

                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="outline-info"
                                                onClick={handleTestPayment}
                                                disabled={!settings.momoEnabled}
                                            >
                                                Test Connection
                                            </Button>
                                            <Button variant="primary" onClick={() => handleSaveSettings('momo')}>
                                                <FaSave className="me-1" />
                                                Lưu
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab.Pane>

                    {/* Security Settings Tab */}
                    <Tab.Pane eventKey="security">
                        <Card>
                            <Card.Header>
                                <h6 className="mb-0">Cài đặt bảo mật</h6>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="switch"
                                                label="Bắt buộc xác thực 2 bước cho admin"
                                                checked={settings.twoFactorAuth}
                                                onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Thời gian timeout session (phút)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="5"
                                                max="120"
                                                value={settings.sessionTimeout}
                                                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Độ dài mật khẩu tối thiểu</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="6"
                                                max="20"
                                                value={settings.passwordMinLength}
                                                onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Số lần đăng nhập sai tối đa</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="3"
                                                max="10"
                                                value={settings.maxLoginAttempts}
                                                onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="switch"
                                                label="Tự động backup hàng ngày"
                                                checked={settings.autoBackup}
                                                onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Thời gian lưu backup (ngày)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="7"
                                                max="365"
                                                value={settings.backupRetention}
                                                onChange={(e) => setSettings({ ...settings, backupRetention: parseInt(e.target.value) })}
                                                disabled={!settings.autoBackup}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-end">
                                    <Button variant="primary" onClick={() => handleSaveSettings('security')}>
                                        <FaSave className="me-1" />
                                        Lưu cài đặt
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>

                    {/* Logs Tab */}
                    <Tab.Pane eventKey="logs">
                        <Card>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">System Logs</h6>
                                <div className="d-flex gap-2">
                                    <Form.Select size="sm" style={{ width: 'auto' }}>
                                        <option>Tất cả levels</option>
                                        <option>ERROR</option>
                                        <option>WARNING</option>
                                        <option>INFO</option>
                                        <option>DEBUG</option>
                                    </Form.Select>
                                    <Button variant="outline-primary" size="sm">
                                        <FaCode className="me-1" />
                                        Refresh
                                    </Button>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table responsive hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th width="15%">Thời gian</th>
                                            <th width="8%">Level</th>
                                            <th width="10%">Module</th>
                                            <th width="50%">Message</th>
                                            <th width="12%">IP</th>
                                            <th width="5%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {systemLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td>
                                                    <small className="text-muted">{log.timestamp}</small>
                                                </td>
                                                <td>
                                                    <Badge bg={getLogLevelBadge(log.level)}>
                                                        {log.level}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary">{log.module}</Badge>
                                                </td>
                                                <td>
                                                    <span className="text-monospace">{log.message}</span>
                                                </td>
                                                <td>
                                                    <span className="text-muted">{log.ip}</span>
                                                </td>
                                                <td>
                                                    <Button variant="outline-info" size="sm">
                                                        <FaEye />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    );
};

export default SystemSettings;