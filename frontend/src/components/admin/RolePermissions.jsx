import React, { useState } from 'react';
import {
    Card, Row, Col, Table, Button, Badge, Form,
    Modal, Alert, ListGroup
} from 'react-bootstrap';
import {
    FaUsers, FaUserShield, FaKey, FaPlus, FaEdit,
    FaTrash, FaCheck, FaTimes, FaCog
} from 'react-icons/fa';

const RolePermissions = () => {
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [modalType, setModalType] = useState('view'); // 'view', 'create', 'edit'

    // Mock data - thay thế bằng API call thực tế
    const roles = [
        {
            id: 1,
            code: 'ADMIN',
            name: 'Quản trị viên',
            description: 'Có toàn quyền truy cập và quản lý hệ thống',
            userCount: 3,
            isActive: true,
            createdAt: '2023-01-01',
            permissions: ['user.read', 'user.write', 'user.delete', 'mentor.approve', 'content.moderate', 'system.config']
        },
        {
            id: 2,
            code: 'MODERATOR',
            name: 'Điều hành viên',
            description: 'Quản lý nội dung và hỗ trợ người dùng',
            userCount: 8,
            isActive: true,
            createdAt: '2023-01-01',
            permissions: ['content.moderate', 'user.read', 'mentor.approve', 'feedback.manage']
        },
        {
            id: 3,
            code: 'MENTOR',
            name: 'Cố vấn',
            description: 'Cung cấp dịch vụ tư vấn cho khách hàng',
            userCount: 156,
            isActive: true,
            createdAt: '2023-01-01',
            permissions: ['profile.manage', 'booking.manage', 'schedule.manage']
        },
        {
            id: 4,
            code: 'CUSTOMER',
            name: 'Khách hàng',
            description: 'Sử dụng dịch vụ tư vấn từ mentor',
            userCount: 1234,
            isActive: true,
            createdAt: '2023-01-01',
            permissions: ['profile.manage', 'booking.create', 'review.create']
        }
    ];

    const availablePermissions = [
        {
            category: 'Quản lý người dùng',
            permissions: [
                { code: 'user.read', name: 'Xem danh sách người dùng' },
                { code: 'user.write', name: 'Tạo/sửa người dùng' },
                { code: 'user.delete', name: 'Xóa người dùng' },
                { code: 'user.block', name: 'Khóa/mở khóa người dùng' }
            ]
        },
        {
            category: 'Quản lý mentor',
            permissions: [
                { code: 'mentor.approve', name: 'Duyệt đơn đăng ký mentor' },
                { code: 'mentor.reject', name: 'Từ chối đơn đăng ký mentor' },
                { code: 'mentor.manage', name: 'Quản lý mentor' }
            ]
        },
        {
            category: 'Quản lý nội dung',
            permissions: [
                { code: 'content.moderate', name: 'Kiểm duyệt nội dung' },
                { code: 'content.create', name: 'Tạo nội dung' },
                { code: 'content.delete', name: 'Xóa nội dung' }
            ]
        },
        {
            category: 'Quản lý booking',
            permissions: [
                { code: 'booking.read', name: 'Xem danh sách booking' },
                { code: 'booking.create', name: 'Tạo booking' },
                { code: 'booking.manage', name: 'Quản lý booking' },
                { code: 'booking.cancel', name: 'Hủy booking' }
            ]
        },
        {
            category: 'Quản lý hệ thống',
            permissions: [
                { code: 'system.config', name: 'Cấu hình hệ thống' },
                { code: 'system.backup', name: 'Sao lưu dữ liệu' },
                { code: 'system.logs', name: 'Xem log hệ thống' }
            ]
        },
        {
            category: 'Cá nhân',
            permissions: [
                { code: 'profile.manage', name: 'Quản lý hồ sơ cá nhân' },
                { code: 'schedule.manage', name: 'Quản lý lịch trình' },
                { code: 'review.create', name: 'Tạo đánh giá' },
                { code: 'feedback.manage', name: 'Quản lý phản hồi' }
            ]
        }
    ];

    const handleViewRole = (role) => {
        setSelectedRole(role);
        setModalType('view');
        setShowRoleModal(true);
    };

    const handleCreateRole = () => {
        setSelectedRole(null);
        setModalType('create');
        setShowRoleModal(true);
    };

    const handleEditRole = (role) => {
        setSelectedRole(role);
        setModalType('edit');
        setShowRoleModal(true);
    };

    const getPermissionName = (permissionCode) => {
        for (const category of availablePermissions) {
            const permission = category.permissions.find(p => p.code === permissionCode);
            if (permission) return permission.name;
        }
        return permissionCode;
    };

    return (
        <div className="role-permissions">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Quản lý quyền & vai trò</h4>
                    <p className="text-muted mb-0">Cấu hình vai trò và phân quyền cho các tài khoản</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => setShowPermissionModal(true)}>
                        <FaKey className="me-1" />
                        Xem tất cả quyền
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleCreateRole}>
                        <FaPlus className="me-1" />
                        Tạo vai trò mới
                    </Button>
                </div>
            </div>

            {/* Roles Table */}
            <Card>
                <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Danh sách vai trò ({roles.length})</h6>
                        <div className="d-flex gap-2">
                            <Button variant="outline-success" size="sm">Kích hoạt hàng loạt</Button>
                            <Button variant="outline-danger" size="sm">Vô hiệu hóa hàng loạt</Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th width="5%">
                                    <Form.Check type="checkbox" />
                                </th>
                                <th width="15%">Mã vai trò</th>
                                <th width="20%">Tên vai trò</th>
                                <th width="30%">Mô tả</th>
                                <th width="10%">Người dùng</th>
                                <th width="10%">Quyền</th>
                                <th width="10%">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((role) => (
                                <tr key={role.id}>
                                    <td>
                                        <Form.Check type="checkbox" />
                                    </td>
                                    <td>
                                        <Badge bg={
                                            role.code === 'ADMIN' ? 'danger' :
                                                role.code === 'MODERATOR' ? 'warning' :
                                                    role.code === 'MENTOR' ? 'success' : 'primary'
                                        }>
                                            {role.code}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div>
                                            <div className="fw-medium">{role.name}</div>
                                            <small className={`${role.isActive ? 'text-success' : 'text-danger'}`}>
                                                {role.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                                            </small>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-muted">{role.description}</span>
                                    </td>
                                    <td>
                                        <span className="fw-medium">{role.userCount}</span>
                                    </td>
                                    <td>
                                        <Badge bg="info">{role.permissions.length}</Badge>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={() => handleViewRole(role)}
                                            >
                                                <FaKey />
                                            </Button>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => handleEditRole(role)}
                                            >
                                                <FaEdit />
                                            </Button>
                                            {role.code !== 'ADMIN' && (
                                                <Button variant="outline-danger" size="sm">
                                                    <FaTrash />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Role Detail/Create/Edit Modal */}
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalType === 'view' && 'Chi tiết vai trò'}
                        {modalType === 'create' && 'Tạo vai trò mới'}
                        {modalType === 'edit' && 'Chỉnh sửa vai trò'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalType === 'view' && selectedRole && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <p><strong>Mã vai trò:</strong>
                                        <Badge bg="primary" className="ms-2">{selectedRole.code}</Badge>
                                    </p>
                                    <p><strong>Tên vai trò:</strong> {selectedRole.name}</p>
                                    <p><strong>Số người dùng:</strong> {selectedRole.userCount}</p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Trạng thái:</strong>
                                        <span className={selectedRole.isActive ? 'text-success' : 'text-danger'}>
                                            {selectedRole.isActive ? ' Hoạt động' : ' Vô hiệu hóa'}
                                        </span>
                                    </p>
                                    <p><strong>Ngày tạo:</strong> {selectedRole.createdAt}</p>
                                </Col>
                            </Row>

                            <div className="mb-3">
                                <p><strong>Mô tả:</strong></p>
                                <div className="p-3 bg-light rounded">
                                    {selectedRole.description}
                                </div>
                            </div>

                            <div>
                                <h6>Quyền hạn ({selectedRole.permissions.length})</h6>
                                <ListGroup>
                                    {selectedRole.permissions.map((permission, index) => (
                                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{permission}</strong>
                                                <br />
                                                <small className="text-muted">{getPermissionName(permission)}</small>
                                            </div>
                                            <Badge bg="success">
                                                <FaCheck />
                                            </Badge>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                        </div>
                    )}

                    {(modalType === 'create' || modalType === 'edit') && (
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Mã vai trò</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="VD: MANAGER"
                                            defaultValue={selectedRole?.code || ''}
                                            disabled={modalType === 'edit'}
                                        />
                                        <Form.Text className="text-muted">
                                            Chỉ chữ cái và dấu gạch dưới, không dấu
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tên vai trò</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="VD: Quản lý"
                                            defaultValue={selectedRole?.name || ''}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Mô tả</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Mô tả vai trò và trách nhiệm..."
                                    defaultValue={selectedRole?.description || ''}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Trạng thái</Form.Label>
                                <Form.Check
                                    type="switch"
                                    label="Kích hoạt vai trò"
                                    defaultChecked={selectedRole?.isActive !== false}
                                />
                            </Form.Group>

                            <div>
                                <Form.Label>Phân quyền</Form.Label>
                                {availablePermissions.map((category, categoryIndex) => (
                                    <Card key={categoryIndex} className="mb-3">
                                        <Card.Header className="bg-light py-2">
                                            <h6 className="mb-0">{category.category}</h6>
                                        </Card.Header>
                                        <Card.Body className="py-2">
                                            <Row>
                                                {category.permissions.map((permission, permIndex) => (
                                                    <Col md={6} key={permIndex}>
                                                        <Form.Check
                                                            type="checkbox"
                                                            id={`perm-${permission.code}`}
                                                            label={permission.name}
                                                            defaultChecked={
                                                                selectedRole?.permissions.includes(permission.code) || false
                                                            }
                                                        />
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
                        Đóng
                    </Button>
                    {modalType === 'view' && (
                        <Button variant="primary" onClick={() => handleEditRole(selectedRole)}>
                            <FaEdit className="me-1" />
                            Chỉnh sửa
                        </Button>
                    )}
                    {(modalType === 'create' || modalType === 'edit') && (
                        <Button variant="primary">
                            {modalType === 'create' ? 'Tạo vai trò' : 'Cập nhật'}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* All Permissions Modal */}
            <Modal show={showPermissionModal} onHide={() => setShowPermissionModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Danh sách tất cả quyền hạn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {availablePermissions.map((category, index) => (
                        <Card key={index} className="mb-3">
                            <Card.Header className="bg-primary text-white">
                                <h6 className="mb-0">
                                    <FaCog className="me-2" />
                                    {category.category}
                                </h6>
                            </Card.Header>
                            <ListGroup variant="flush">
                                {category.permissions.map((permission, permIndex) => (
                                    <ListGroup.Item key={permIndex}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{permission.code}</strong>
                                                <br />
                                                <span className="text-muted">{permission.name}</span>
                                            </div>
                                            <div>
                                                {roles.filter(role => role.permissions.includes(permission.code)).map(role => (
                                                    <Badge key={role.id} bg="secondary" className="me-1">
                                                        {role.code}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPermissionModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RolePermissions;