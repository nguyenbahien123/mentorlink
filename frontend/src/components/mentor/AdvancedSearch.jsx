import React, { useState } from 'react';
import {
    Form,
    Row,
    Col,
    Button,
    InputGroup,
    Offcanvas
} from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const AdvancedSearch = ({
    onSearch,
    onFilterChange,
    filters,
    sortOptions,
    pageSizeOptions
}) => {
    const [searchTerm, setSearchTerm] = useState(filters.keyword || '');
    const [showFilters, setShowFilters] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        gender: '',
        minRating: '',
        location: ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    const handleAdvancedFilterChange = (key, value) => {
        const newFilters = { ...advancedFilters, [key]: value };
        setAdvancedFilters(newFilters);
        onFilterChange(key, value);
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setAdvancedFilters({
            gender: '',
            minRating: '',
            location: ''
        });
        onFilterChange('keyword', '');
        onFilterChange('sort', 'id:asc');
        onFilterChange('gender', '');
        onFilterChange('minRating', '');
        onFilterChange('location', '');
    };

    const hasActiveFilters = () => {
        return searchTerm ||
            filters.sort !== 'id:asc' ||
            advancedFilters.gender ||
            advancedFilters.minRating ||
            advancedFilters.location;
    };

    return (
        <>
            <Form onSubmit={handleSearch}>
                <Row className="align-items-end">
                    {/* Search Input */}
                    <Col md={6} lg={4}>
                        <Form.Group className="mb-3 mb-md-0">
                            <Form.Label>Tìm kiếm</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm theo tên, kỹ năng, địa điểm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button variant="primary" type="submit">
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Form.Group>
                    </Col>

                    {/* Sort Select */}
                    <Col md={3} lg={2}>
                        <Form.Group className="mb-3 mb-md-0">
                            <Form.Label>Sắp xếp</Form.Label>
                            <Form.Select
                                value={filters.sort}
                                onChange={(e) => onFilterChange('sort', e.target.value)}
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Page Size Select */}
                    <Col md={3} lg={2}>
                        <Form.Group className="mb-3 mb-md-0">
                            <Form.Label>Hiển thị</Form.Label>
                            <Form.Select
                                value={filters.size}
                                onChange={(e) => onFilterChange('size', parseInt(e.target.value))}
                            >
                                {pageSizeOptions.map(size => (
                                    <option key={size} value={size}>
                                        {size} cố vấn
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Filter Controls */}
                    <Col md={12} lg={4}>
                        <div className="d-flex gap-2 justify-content-md-end">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowFilters(true)}
                            >
                                <FaFilter className="me-1" />
                                Bộ lọc nâng cao
                            </Button>

                            {hasActiveFilters() && (
                                <Button variant="outline-danger" onClick={clearAllFilters}>
                                    <FaTimes className="me-1" />
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    </Col>
                </Row>
            </Form>

            {/* Advanced Filters Offcanvas */}
            <Offcanvas
                show={showFilters}
                onHide={() => setShowFilters(false)}
                placement="end"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Bộ lọc nâng cao</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form>
                        {/* Gender Filter */}
                        <Form.Group className="mb-3">
                            <Form.Label>Giới tính</Form.Label>
                            <Form.Select
                                value={advancedFilters.gender}
                                onChange={(e) => handleAdvancedFilterChange('gender', e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="M">Nam</option>
                                <option value="F">Nữ</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Rating Filter */}
                        <Form.Group className="mb-3">
                            <Form.Label>Đánh giá tối thiểu</Form.Label>
                            <Form.Select
                                value={advancedFilters.minRating}
                                onChange={(e) => handleAdvancedFilterChange('minRating', e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="4.5">4.5+ sao</option>
                                <option value="4">4+ sao</option>
                                <option value="3.5">3.5+ sao</option>
                                <option value="3">3+ sao</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Location Filter */}
                        <Form.Group className="mb-3">
                            <Form.Label>Địa điểm</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập thành phố..."
                                value={advancedFilters.location}
                                onChange={(e) => handleAdvancedFilterChange('location', e.target.value)}
                            />
                        </Form.Group>

                        {/* Experience Level */}
                        <Form.Group className="mb-3">
                            <Form.Label>Mức độ kinh nghiệm</Form.Label>
                            <Form.Select onChange={(e) => console.log('Experience:', e.target.value)}>
                                <option value="">Tất cả</option>
                                <option value="junior">Mới bắt đầu (&lt; 50 bookings)</option>
                                <option value="intermediate">Trung bình (50-200 bookings)</option>
                                <option value="senior">Có kinh nghiệm (&gt; 200 bookings)</option>
                            </Form.Select>
                        </Form.Group>                        {/* Availability */}
                        <Form.Group className="mb-3">
                            <Form.Label>Tình trạng</Form.Label>
                            <Form.Check
                                type="checkbox"
                                id="available-now"
                                label="Có thể đặt lịch ngay"
                                onChange={(e) => console.log('Available now:', e.target.checked)}
                            />
                            <Form.Check
                                type="checkbox"
                                id="quick-response"
                                label="Phản hồi nhanh"
                                onChange={(e) => console.log('Quick response:', e.target.checked)}
                            />
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button
                                variant="primary"
                                onClick={() => setShowFilters(false)}
                            >
                                Áp dụng bộ lọc
                            </Button>
                            <Button
                                variant="outline-secondary"
                                onClick={() => {
                                    setAdvancedFilters({
                                        gender: '',
                                        minRating: '',
                                        location: ''
                                    });
                                }}
                            >
                                Đặt lại
                            </Button>
                        </div>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default AdvancedSearch;