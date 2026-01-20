import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import blogService from '../../services/blog';
import { sanitizeHtml, isHtmlContent } from '../../utils/htmlUtils';
import '../../styles/components/quill-editor.css';
import '../../styles/components/tinymce-content.css';

const BlogDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(false);

    const hasFetchedRef = useRef(false);

    useEffect(() => {
        // Guard to avoid double-fetch in React.StrictMode (dev) which mounts components twice
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        fetchBlog();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchBlog = async () => {
        setLoading(true);
        try {
            const resp = await blogService.getBlogById(id);
            const data = resp.data || resp;
            // Attachment shows wrapper { data: { ... } }
            setBlog(data.data || data);
        } catch (err) {
            console.error('Failed to load blog', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Row className="mb-3">
                <Col>
                    <Button variant="link" onClick={() => navigate(-1)}>← Back</Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    {loading && <div>Loading...</div>}
                    {!loading && blog && (
                        <Card className="shadow-sm">
                            <Card.Body>
                                <h2>{blog.title}</h2>
                                <div className="text-muted mb-2">Tác giả: {blog.author} • Lượt xem: {blog.viewCount}</div>
                                <div className="mb-3 small text-muted">{blog.createdAt ? new Date(blog.createdAt).toLocaleString() : ''}</div>
                                <div className="blog-content-display tinymce-content-display">
                                    {isHtmlContent(blog.content) ? (
                                        <div 
                                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.content) }}
                                        />
                                    ) : (
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{blog.content}</div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default BlogDetailPage;
