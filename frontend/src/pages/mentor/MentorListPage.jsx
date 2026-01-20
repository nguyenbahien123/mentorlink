import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    Card,
    Spinner,
    Alert,
    Pagination,
    Badge,
    InputGroup
} from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import useMentors from '../../hooks/useMentors';
import MentorCard from '../../components/mentor/MentorCard';
import { useToast } from '../../contexts/ToastContext';
import MentorService from '../../services/mentor/MentorService';
import '../../styles/components/MentorList.css';

const MentorListPage = () => {
    const location = useLocation();
    const { showToast } = useToast();
    const { mentors, loading, error, pagination, fetchMentors } = useMentors();

    const [filters, setFilters] = useState({
        keyword: '',
        country: '',
        sort: 'numberOfBooking:desc',
        page: 1,
        size: 12,
        gender: '',
        minRating: '',
        location: '',
        approvedCountry: ''
    });

    // Country prioritization (from query params)
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [displayMentors, setDisplayMentors] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    
    // Countries for dropdown
    const [countries, setCountries] = useState([]);
    const [countriesLoading, setCountriesLoading] = useState(false);

    // Load countries for filter dropdown
    useEffect(() => {
        const loadCountries = async () => {
            try {
                setCountriesLoading(true);
                const response = await MentorService.getAllCountries();
                const countryData = response?.data || response || [];
                setCountries(countryData);
            } catch (error) {
                console.error('Error loading countries:', error);
                showToast('Không thể tải danh sách quốc gia', 'error');
            } finally {
                setCountriesLoading(false);
            }
        };
        
        loadCountries();
    }, [showToast]);

    // Check if payment failed and show toast
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('bookingSuccess') === 'false') {
            showToast('Đặt lịch chưa thành công. Vui lòng thử lại!', 'error');
            // Clean up URL param
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location.search, showToast]);

    // When route query changes (e.g., from ServicesDropdown), capture the country code
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const countryFromQuery = params.get('country') || '';
        // Only prioritize (do NOT filter hard) — keep others but push matches on top
        setSelectedCountryCode(countryFromQuery);
        // Ensure hard filter isn't carried over from previous state
        setFilters(prev => ({ ...prev, approvedCountry: '', page: 1 }));
    }, [location.search]);

    // Fetch mentors khi component mount hoặc filters thay đổi
    useEffect(() => {
        fetchMentors(filters);
    }, [filters]);

    // Cleanup timeout when component unmounts
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Recompute the list to display whenever mentors or selected country changes
    useEffect(() => {
        if (!selectedCountryCode) {
            setDisplayMentors(mentors);
            return;
        }

        const supportsCountry = (m) => {
            const list = Array.isArray(m?.approvedCountries) ? m.approvedCountries : [];
            const target = selectedCountryCode.toLowerCase();
            return list.some((c) => {
                if (!c) return false;
                if (typeof c === 'string') return c.toLowerCase() === target || c.toLowerCase().includes(target);
                const code = (c.code || '').toLowerCase();
                const name = (c.name || '').toLowerCase();
                return code === target || name.includes(target);
            });
        };

        const reordered = [...mentors].sort((a, b) => {
            const aHas = supportsCountry(a);
            const bHas = supportsCountry(b);
            if (aHas === bHas) return 0;
            return aHas ? -1 : 1;
        });

        setDisplayMentors(reordered);
    }, [mentors, selectedCountryCode]);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(prev => ({
            ...prev,
            keyword: searchTerm,
            page: 1
        }));
    };

    // Handle real-time search with debounce
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setIsSearching(true);

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for debounced search
        const newTimeout = setTimeout(() => {
            setFilters(prev => ({
                ...prev,
                keyword: value,
                page: 1
            }));
            setIsSearching(false);
        }, 500); // Debounce 500ms

        setSearchTimeout(newTimeout);
    };    // Handle filter changes
    const handleFilterChange = (key, value) => {
        // If country filter is changed, clear the priority country from URL
        if (key === 'country') {
            setSelectedCountryCode('');
        }
        
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filters change
        }));
    };

    // Handle pagination
    const handlePageChange = (pageNumber) => {
        setFilters(prev => ({
            ...prev,
            page: pageNumber
        }));
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            keyword: '',
            country: '',
            sort: 'numberOfBooking:desc',
            page: 1,
            size: 12,
            gender: '',
            minRating: '',
            location: '',
            approvedCountry: ''
        });
    };

    // Sort options
    const sortOptions = [
        { value: 'numberOfBooking:desc', label: 'Nhiều booking nhất' },
        { value: 'rating:desc', label: 'Đánh giá cao nhất' },
        { value: 'rating:asc', label: 'Đánh giá thấp nhất' },
        { value: 'fullname:asc', label: 'Tên A-Z' },
        { value: 'fullname:desc', label: 'Tên Z-A' }
    ];

    // Page size options
    const pageSizeOptions = [6, 12, 24, 48];

    // Generate pagination items
    const generatePaginationItems = () => {
        const items = [];
        const { pageNumber, totalPages } = pagination;
        // pageNumber from backend is 0-indexed, but we send 1-indexed to backend
        const currentPage = pageNumber + 1;

        // Previous button
        items.push(
            <Pagination.Prev
                key="prev"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
            />
        );

        // Page numbers (display 1-indexed)
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || // First page
                i === totalPages || // Last page
                (i >= currentPage - 1 && i <= currentPage + 1) // Current page ± 1
            ) {
                items.push(
                    <Pagination.Item
                        key={i}
                        active={i === currentPage}
                        onClick={() => handlePageChange(i)}
                    >
                        {i}
                    </Pagination.Item>
                );
            } else if (
                i === currentPage - 2 ||
                i === currentPage + 2
            ) {
                items.push(<Pagination.Ellipsis key={`ellipsis-${i}`} />);
            }
        }

        // Next button
        items.push(
            <Pagination.Next
                key="next"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
            />
        );

        return items;
    };

    return (
        <Container fluid className="mentor-list-page py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-0">Tìm cố vấn</h2>
                            <p className="text-muted mb-0">
                                Khám phá và kết nối với các cố vấn phù hợp với bạn
                            </p>
                        </div>
                        <Badge bg="info" className="fs-6">
                            {pagination.totalElements} cố vấn
                        </Badge>
                    </div>
                </Col>
            </Row>

            {/* Search and Filter Bar */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body className="bg-light rounded">
                    <div>
                        <Row className="align-items-end">
                            <Col md={6} lg={3}>
                                <Form.Group className="mb-3 mb-md-0">
                                    <Form.Label>Tìm kiếm</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            placeholder="Gõ để tìm kiếm mentor..."
                                            value={searchTerm}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                        />
                                        
                                    </InputGroup>
                                    
                                </Form.Group>
                            </Col>

                            <Col md={3} lg={2}>
                                <Form.Group className="mb-3 mb-md-0">
                                    <Form.Label>Quốc gia</Form.Label>
                                    <Form.Select
                                        value={filters.country}
                                        onChange={(e) => handleFilterChange('country', e.target.value)}
                                        disabled={countriesLoading}
                                    >
                                        <option value="">Tất cả quốc gia</option>
                                        {countries.map(country => (
                                            <option key={country.id} value={country.name}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {countriesLoading && (
                                        <Form.Text className="text-muted">
                                            <Spinner animation="border" size="sm" className="me-1" />
                                            Đang tải...
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </Col>

                            <Col md={3} lg={2}>
                                <Form.Group className="mb-3 mb-md-0">
                                    <Form.Label>Sắp xếp</Form.Label>
                                    <Form.Select
                                        value={filters.sort}
                                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                                    >
                                        {sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={3} lg={2}>
                                <Form.Group className="mb-3 mb-md-0">
                                    <Form.Label>Hiển thị</Form.Label>
                                    <Form.Select
                                        value={filters.size}
                                        onChange={(e) => handleFilterChange('size', parseInt(e.target.value))}
                                    >
                                        {pageSizeOptions.map(size => (
                                            <option key={size} value={size}>
                                                {size} cố vấn
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>


                    </div>
                </Card.Body>
            </Card>

            {/* Results */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Đang tải danh sách mentor...</p>
                </div>
            ) : error ? (
                <Alert variant="danger">
                    <Alert.Heading>Có lỗi xảy ra!</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={() => fetchMentors(filters)}>
                        Thử lại
                    </Button>
                </Alert>
            ) : mentors.length === 0 ? (
                <Alert variant="info" className="text-center">
                    <h5>Không tìm thấy mentor nào</h5>
                    <p>Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                </Alert>
            ) : (
                <>
                    {/* Active filters display */}
                    {(filters.country || selectedCountryCode) && (
                        <Alert variant="info" className="mb-3 py-2">
                            
                            <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 ms-2 text-decoration-none"
                                onClick={() => {
                                    if (filters.country) {
                                        handleFilterChange('country', '');
                                    } else {
                                        setSelectedCountryCode('');
                                    }
                                }}
                            >
                            </Button>
                        </Alert>
                    )}
                    {/* Mentor Horizontal List */}
                    <div className="mentor-rows-list">
                        {(displayMentors.length ? displayMentors : mentors).map((mentor) => (
                            <div key={mentor.id} className="mentor-row-item">
                                {/* Use a horizontal row layout similar to bookingcare */}
                                <MentorCard mentor={mentor} horizontal={true} />
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <Row className="mt-4">
                            <Col>
                                <div className="d-flex justify-content-center">
                                    <Pagination>
                                        {generatePaginationItems()}
                                    </Pagination>
                                </div>

                                <div className="text-center text-muted mt-2">
                                    Hiển thị {pagination.pageNumber * pagination.pageSize + 1} - {' '}
                                    {Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)} {' '}
                                    trong tổng số {pagination.totalElements} cố vấn
                                </div>
                            </Col>
                        </Row>
                    )}
                </>
            )}
        </Container>
    );
};

export default MentorListPage;
