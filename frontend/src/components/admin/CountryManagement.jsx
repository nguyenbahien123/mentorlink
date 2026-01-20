import React, { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Table,
    Button,
    Badge,
    Modal,
    Form,
    Alert,
    Spinner,
    InputGroup,
    Dropdown,
    Pagination,
    Nav
} from 'react-bootstrap';
import {
    FaCheck,
    FaTimes,
    FaEye,
    FaGlobeAmericas,
    FaSearch,
    FaFlag,
    FaUser,
    FaCalendar,
    FaExclamationTriangle,
    FaEdit,
    FaTrash,
    FaUndo
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import CountryService from '../../services/country/CountryService';

const CountryManagement = () => {
    const [countries, setCountries] = useState([]);
    const [pendingCountries, setPendingCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [approvalData, setApprovalData] = useState({
        flagUrl: '',
        description: ''
    });
    const [editData, setEditData] = useState({
        flagUrl: '',
        description: ''
    });
    
    // Pagination and Tab states
    const [activeTab, setActiveTab] = useState('approved'); // 'pending' or 'approved'
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [countriesResponse, pendingResponse] = await Promise.all([
                CountryService.getApprovedCountries(),
                CountryService.getPendingCountries()
            ]);

            if (countriesResponse.respCode === "0") {
                setCountries(countriesResponse.data);
            }

            if (pendingResponse.respCode === "0") {
                setPendingCountries(pendingResponse.data);
            }
        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            console.error('Error fetching country data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (country) => {
        setSelectedCountry(country);
        setApprovalData({
            flagUrl: country.flagUrl || '',
            description: country.description || ''
        });
        setShowApprovalModal(true);
    };

    const submitApproval = async () => {
        try {
            await CountryService.approveCountry(selectedCountry.id, approvalData);
            alert('Đã duyệt thành công!');
            await fetchData();
            setShowApprovalModal(false);
        } catch (err) {
            alert('Có lỗi xảy ra khi duyệt. Vui lòng thử lại.');
        }
    };

    const handleReject = async (country) => {
        const reason = prompt('Nhập lý do từ chối:');
        if (!reason) return;

        try {
            await CountryService.rejectCountry(country.id, reason);
            alert('Đã từ chối thành công!');
            await fetchData();
        } catch (err) {
            alert('Có lỗi xảy ra khi từ chối. Vui lòng thử lại.');
        }
    };

    const viewDetails = (country) => {
        setSelectedCountry(country);
        setShowDetailModal(true);
    };

    const handleUnapprove = async (country) => {
        if (!window.confirm(`Bạn có chắc muốn chuyển "${country.name}" về trạng thái chờ duyệt?`)) {
            return;
        }

        try {
            await CountryService.unapproveCountry(country.id);
            alert('Đã chuyển về trạng thái chờ duyệt!');
            await fetchData();
        } catch (err) {
            alert('Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const handleDelete = async (country) => {
        if (!window.confirm(`Bạn có chắc muốn xóa nước "${country.name}"? Hành động này không thể hoàn tác!`)) {
            return;
        }

        try {
            await CountryService.deleteCountry(country.id);
            alert('Đã xóa thành công!');
            await fetchData();
        } catch (err) {
            alert('Có lỗi xảy ra khi xóa. Vui lòng thử lại.');
        }
    };

    const handleEdit = (country) => {
        setSelectedCountry(country);
        setEditData({
            flagUrl: country.flagUrl || '',
            description: country.description || ''
        });
        setShowEditModal(true);
    };

    const submitEdit = async () => {
        try {
            await CountryService.approveCountry(selectedCountry.id, editData);
            alert('Cập nhật thành công!');
            await fetchData();
            setShowEditModal(false);
        } catch (err) {
            alert('Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.');
        }
    };

    // Filter and pagination logic
    const filteredData = useMemo(() => {
        const dataToFilter = activeTab === 'pending' ? pendingCountries : countries;
        
        if (!searchTerm) return dataToFilter;
        
        return dataToFilter.filter(country => {
            const nameMatch = country.name.toLowerCase().includes(searchTerm.toLowerCase());
            const codeMatch = country.code?.toLowerCase().includes(searchTerm.toLowerCase());
            const mentorMatch = country.suggestedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            
            return nameMatch || codeMatch || mentorMatch;
        });
    }, [activeTab, pendingCountries, countries, searchTerm]);

    const paginatedData = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const data = filteredData.slice(startIndex, endIndex);
        
        // Update pagination info
        const totalPages = Math.ceil(filteredData.length / pagination.pageSize);
        setPagination(prev => ({
            ...prev,
            totalPages: totalPages,
            totalElements: filteredData.length
        }));
        
        return data;
    }, [filteredData, pagination.currentPage, pagination.pageSize]);

    // Reset to first page when changing tabs or search term
    useEffect(() => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, [activeTab, searchTerm]);

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > pagination.totalPages) return;
        setPagination(prev => ({ ...prev, currentPage: pageNumber }));
    };



    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải dữ liệu...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={fetchData}>
                        Thử lại
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-0">
                                Quản lý các nước du học
                            </h2>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Search Bar */}
            <Row className="mb-3">
                <Col md={6}>
                    <InputGroup>
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm theo tên nước, mã nước hoặc người đề xuất..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setSearchTerm('')}
                            >
                                <FaTimes />
                            </Button>
                        )}
                    </InputGroup>
                </Col>
            </Row>

            {/* Main Table Card */}
            <Card>
                <Card.Header className="bg-white">
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                        <Nav.Item>
                            <Nav.Link eventKey="approved">
                                Đã duyệt
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="pending">
                                Chờ duyệt
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0" style={{ overflow: 'visible' }}>
                    {paginatedData.length === 0 ? (
                        <div className="text-center py-5">
                            <FaSearch size={48} className="text-muted mb-3" />
                            <p className="text-muted mb-0">
                                {searchTerm 
                                    ? 'Không tìm thấy kết quả phù hợp' 
                                    : `Không có ${activeTab === 'pending' ? 'đề xuất chờ duyệt' : 'nước đã duyệt'}`
                                }
                            </p>
                        </div>
                    ) : (
                        <>
                            <Table responsive hover className="mb-0" style={{ overflow: 'visible' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th>Tên nước</th>
                                        {activeTab === 'approved' && <th>Mã nước</th>}
                                        {activeTab === 'pending' && <th>Người đề xuất</th>}
                                        {activeTab === 'pending' && <th>Ngày đề xuất</th>}
                                        <th>Mô tả</th>
                                        <th className="text-center" style={{ width: '80px' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeTab === 'pending' ? (
                                        // Pending Countries Rows
                                        paginatedData.map((country) => (
                                            <tr key={country.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <span className="me-2">🏳️</span>
                                                        <strong>{country.name}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FaUser className="me-1 text-muted" />
                                                        <small>{country.suggestedBy?.name || 'N/A'}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FaCalendar className="me-1 text-muted" />
                                                        <small>
                                                            {new Date(country.createdAt).toLocaleDateString('vi-VN')}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {country.description?.substring(0, 50)}
                                                        {country.description?.length > 50 && '...'}
                                                    </small>
                                                </td>
                                                <td className="text-center">
                                                    <Dropdown align="end">
                                                        <Dropdown.Toggle 
                                                            variant="light" 
                                                            size="sm" 
                                                            className="no-caret"
                                                        >
                                                            <BsThreeDotsVertical />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => viewDetails(country)}>
                                                                <FaEye className="me-2" />
                                                                Xem chi tiết
                                                            </Dropdown.Item>
                                                            <Dropdown.Divider />
                                                            <Dropdown.Item 
                                                                className="text-success"
                                                                onClick={() => handleApprove(country)}
                                                            >
                                                                <FaCheck className="me-2" />
                                                                Duyệt
                                                            </Dropdown.Item>
                                                            <Dropdown.Item 
                                                                className="text-danger"
                                                                onClick={() => handleReject(country)}
                                                            >
                                                                <FaTimes className="me-2" />
                                                                Từ chối
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        // Approved Countries Rows
                                        paginatedData.map((country) => (
                                            <tr key={country.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {country.flagUrl ? (
                                                            <img
                                                                src={country.flagUrl}
                                                                alt={`${country.name} flag`}
                                                                style={{
                                                                    width: '24px',
                                                                    height: '18px',
                                                                    marginRight: '8px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '2px'
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="me-2">🏳️</span>
                                                        )}
                                                        <strong>{country.name}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary">{country.code}</Badge>
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {country.description?.substring(0, 50)}
                                                        {country.description?.length > 50 && '...'}
                                                    </small>
                                                </td>
                                                <td className="text-center">
                                                    <Dropdown align="end">
                                                        <Dropdown.Toggle 
                                                            variant="light" 
                                                            size="sm" 
                                                            className="no-caret"
                                                        >
                                                            <BsThreeDotsVertical />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => viewDetails(country)}>
                                                                <FaEye className="me-2" />
                                                                Xem chi tiết
                                                            </Dropdown.Item>
                                                            <Dropdown.Divider />
                                                            <Dropdown.Item 
                                                                className="text-primary"
                                                                onClick={() => handleEdit(country)}
                                                            >
                                                                <FaEdit className="me-2" />
                                                                Chỉnh sửa
                                                            </Dropdown.Item>
                                                            <Dropdown.Item 
                                                                className="text-warning"
                                                                onClick={() => handleUnapprove(country)}
                                                            >
                                                                <FaUndo className="me-2" />
                                                                Chuyển về chờ duyệt
                                                            </Dropdown.Item>
                                                            <Dropdown.Item 
                                                                className="text-danger"
                                                                onClick={() => handleDelete(country)}
                                                            >
                                                                <FaTrash className="me-2" />
                                                                Xóa
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Card.Body>
                {!loading && paginatedData.length > 0 && (
                    <Card.Footer className="bg-white border-top">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div className="text-muted small">
                                Hiển thị{" "}
                                <strong>
                                    {(pagination.currentPage - 1) * pagination.pageSize + 1}
                                </strong>{" "}
                                -{" "}
                                <strong>
                                    {Math.min(
                                        pagination.currentPage * pagination.pageSize,
                                        pagination.totalElements
                                    )}
                                </strong>{" "}
                                trong tổng số <strong>{pagination.totalElements}</strong>{" "}
                                {activeTab === 'pending' ? 'đề xuất' : 'quốc gia'}
                            </div>
                            <Pagination className="mb-0" size="sm">
                                <Pagination.Prev
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                />

                                {(() => {
                                    const items = [];
                                    const total = pagination.totalPages;
                                    const current = pagination.currentPage;
                                    const maxVisible = 5;

                                    if (total <= maxVisible) {
                                        for (let i = 1; i <= total; i++) {
                                            items.push(
                                                <Pagination.Item
                                                    key={i}
                                                    active={i === current}
                                                    onClick={() => handlePageChange(i)}
                                                >
                                                    {i}
                                                </Pagination.Item>
                                            );
                                        }
                                    } else {
                                        items.push(
                                            <Pagination.Item
                                                key={1}
                                                active={1 === current}
                                                onClick={() => handlePageChange(1)}
                                            >
                                                1
                                            </Pagination.Item>
                                        );

                                        let startPage = Math.max(2, current - 1);
                                        let endPage = Math.min(total - 1, current + 1);

                                        if (startPage > 2) {
                                            items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
                                            startPage = Math.max(startPage, current - 1);
                                        }

                                        for (let i = startPage; i <= endPage; i++) {
                                            items.push(
                                                <Pagination.Item
                                                    key={i}
                                                    active={i === current}
                                                    onClick={() => handlePageChange(i)}
                                                >
                                                    {i}
                                                </Pagination.Item>
                                            );
                                        }

                                        if (endPage < total - 1) {
                                            items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
                                        }
                                        items.push(
                                            <Pagination.Item
                                                key={total}
                                                active={total === current}
                                                onClick={() => handlePageChange(total)}
                                            >
                                                {total}
                                            </Pagination.Item>
                                        );
                                    }

                                    return items;
                                })()}

                                <Pagination.Next
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                />
                            </Pagination>
                        </div>
                    </Card.Footer>
                )}
            </Card>

            {/* Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết đề xuất nước</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCountry && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Tên nước:</strong> {selectedCountry.name}
                                </Col>
                                <Col md={6}>
                                    <strong>Mã nước:</strong> {selectedCountry.code}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Người đề xuất:</strong> {selectedCountry.suggestedBy?.name || 'N/A'}
                                </Col>
                                <Col md={6}>
                                    <strong>Ngày đề xuất:</strong> {' '}
                                    {new Date(selectedCountry.createdAt).toLocaleDateString('vi-VN')}
                                </Col>
                            </Row>
                            <div className="mb-3">
                                <strong>Mô tả kinh nghiệm:</strong>
                                <p className="mt-2">{selectedCountry.description}</p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Approval Modal */}
            <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Duyệt đề xuất nước</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCountry && (
                        <Form>
                            <Alert variant="info">
                                Duyệt đề xuất nước: <strong>{selectedCountry.name}</strong>
                            </Alert>
                            <Form.Group className="mb-3">
                                <Form.Label>URL cờ quốc gia</Form.Label>
                                <Form.Control
                                    type="url"
                                    placeholder="https://example.com/flag.png"
                                    value={approvalData.flagUrl}
                                    onChange={(e) => setApprovalData({
                                        ...approvalData,
                                        flagUrl: e.target.value
                                    })}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mô tả chính thức</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Mô tả chính thức về nước này..."
                                    value={approvalData.description}
                                    onChange={(e) => setApprovalData({
                                        ...approvalData,
                                        description: e.target.value
                                    })}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="success" onClick={submitApproval}>
                        <FaCheck className="me-1" /> Duyệt
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Chỉnh sửa thông tin nước</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCountry && (
                        <Form>
                            <Alert variant="primary">
                                Chỉnh sửa nước: <strong>{selectedCountry.name}</strong> ({selectedCountry.code})
                            </Alert>
                            <Form.Group className="mb-3">
                                <Form.Label>URL cờ quốc gia</Form.Label>
                                <Form.Control
                                    type="url"
                                    placeholder="https://example.com/flag.png"
                                    value={editData.flagUrl}
                                    onChange={(e) => setEditData({
                                        ...editData,
                                        flagUrl: e.target.value
                                    })}
                                />
                                {editData.flagUrl && (
                                    <div className="mt-2">
                                        <small className="text-muted">Xem trước:</small>
                                        <div className="mt-1">
                                            <img
                                                src={editData.flagUrl}
                                                alt="Flag preview"
                                                style={{
                                                    width: '60px',
                                                    height: '40px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ddd'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mô tả</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Mô tả về nước này..."
                                    value={editData.description}
                                    onChange={(e) => setEditData({
                                        ...editData,
                                        description: e.target.value
                                    })}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={submitEdit}>
                        <FaCheck className="me-1" /> Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CountryManagement;