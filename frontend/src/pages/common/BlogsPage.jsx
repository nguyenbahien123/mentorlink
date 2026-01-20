import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import blogService from '../../services/blog';
import '../../styles/components/BlogsPage.css';

const BlogsPage = () => {
    const [blogsData, setBlogsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [sort, setSort] = useState('createdAt:desc');
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        // initialize from url params
        const k = searchParams.get('keyword') || '';
        const s = searchParams.get('sort') || 'createdAt:desc';
        const p = parseInt(searchParams.get('page')) || 1;
        const sz = parseInt(searchParams.get('size')) || 10;
        setKeyword(k);
        setSort(s);
        setPage(p);
        setSize(sz);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchBlogs();
        // update url
        setSearchParams({ keyword, sort, page, size });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, sort, page, size]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const resp = await blogService.getBlogs({ keyword, sort, page, size });
            // api returns wrapper with data or direct depending on axios instance; axios instance returns response.data
            // Example attachment showed object with data.blogs and pagination.
            const data = resp.data || resp; // handle resp vs resp.data
            setBlogsData(data);
        } catch (err) {
            console.error('Failed to fetch blogs', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchBlogs();
    };

    const handleClear = () => {
        setKeyword('');
        setPage(1);
    };

    return (
        <Container className="py-4">
            <Row className="mb-3">
                <Col>
                    <h2>Blogs</h2>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={8}>
                    <Form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                        <Form.Control
                            placeholder="Tìm kiếm blog..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <Button type="submit">Tìm</Button>
                        <Button variant="outline-secondary" onClick={handleClear}>Xóa</Button>
                    </Form>
                </Col>
                <Col md={4} className="d-flex justify-content-end">
                    <Form.Select value={sort} onChange={(e) => setSort(e.target.value)} style={{ maxWidth: 220 }}>
                        <option value="createdAt:desc">Mới nhất</option>
                        <option value="createdAt:asc">Cũ nhất</option>
                        <option value="viewCount:desc">Xem nhiều nhất</option>
                        <option value="viewCount:asc">Xem ít nhất</option>
                    </Form.Select>
                </Col>
            </Row>

            <Row>
                <Col>
                    {loading && <div>Loading...</div>}

                    {!loading && blogsData && blogsData.blogs && blogsData.blogs.length === 0 && (
                        <div>Không có kết quả.</div>
                    )}

                    <div className="d-flex flex-column gap-3">
                        {blogsData && blogsData.blogs && blogsData.blogs.map((b) => (
                            <Card
                                key={b.id}
                                className="shadow-sm blog-card"
                                onClick={() => navigate(`/blogs/${b.id}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/blogs/${b.id}`); }}
                            >
                                <Card.Body>
                                    <Row>
                                        <Col md={9}>
                                            <h5 className="blog-title">{b.title}</h5>
                                            <div className="text-muted small">Tác giả: {b.author}</div>
                                        </Col>
                                        <Col md={3} className="text-end d-flex flex-column align-items-end justify-content-between">
                                            <div className="view-count fw-bold">
                                                <FaEye className="me-1" /> {b.viewCount?.toLocaleString?.() ?? b.viewCount}
                                            </div>
                                            <div className="text-muted small">{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>

                    {/* pagination controls (simple) */}
                    {blogsData && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div>
                                Trang {blogsData.pageNumber + 1} / {blogsData.totalPages}
                                {' '}• Tổng: {blogsData.totalElements}
                            </div>
                            <div className="d-flex gap-2">
                                <Button variant="outline-primary" disabled={blogsData.pageNumber <= 0} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                    Trước
                                </Button>
                                <Button variant="outline-primary" disabled={blogsData.pageNumber + 1 >= blogsData.totalPages} onClick={() => setPage((p) => p + 1)}>
                                    Sau
                                </Button>
                            </div>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default BlogsPage;
