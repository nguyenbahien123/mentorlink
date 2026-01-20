import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import faqService from '../../services/faq';
import { FaPlus } from 'react-icons/fa';

const FAQsPage = () => {
    const [faqsData, setFaqsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [sort, setSort] = useState('createdAt:desc');

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const p = parseInt(searchParams.get('page')) || 1;
        const s = parseInt(searchParams.get('size')) || 10;
        const so = searchParams.get('sort') || 'createdAt:desc';
        setPage(p); setSize(s); setSort(so);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchFaqs();
        setSearchParams({ page, size, sort });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, size, sort]);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const resp = await faqService.getPublishedFaqs({ page, size, sort });
            const data = resp.data || resp;
            // backend uses { data: { content: [...], totalPages, totalElements, number } }
            const payload = data.data || data;
            setFaqsData(payload);
        } catch (err) {
            console.error('Failed to load faqs', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Row className="mb-3">
                <Col>
                    <h2>FAQs</h2>
                </Col>
                <Col className="text-end">
                    <Button as={Link} to="/faqs/new" variant="outline-primary"><FaPlus className="me-2" />Tạo FAQ</Button>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={4} className="ms-auto">
                    <Form.Select value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="createdAt:desc">Mới nhất</option>
                        <option value="createdAt:asc">Cũ nhất</option>
                    </Form.Select>
                </Col>
            </Row>

            <Row>
                <Col>
                    {loading && <div>Loading...</div>}
                    {!loading && faqsData && faqsData.content && faqsData.content.map(q => (
                        <Card key={q.id} className="mb-3 shadow-sm">
                            <Card.Body>
                                <Row>
                                    <Col>
                                        <h5><Link to={`/faqs/${q.id}`}>{q.question}</Link></h5>
                                        <div className="small text-muted">{q.createdAt ? new Date(q.createdAt).toLocaleString() : ''}</div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}

                    {faqsData && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <div>Trang {(faqsData.number ?? page) + 1} / {faqsData.totalPages}</div>
                            <div className="d-flex gap-2">
                                <Button variant="outline-primary" disabled={(faqsData.number ?? page) <= 0} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                                <Button variant="outline-primary" disabled={(faqsData.number ?? page) + 1 >= faqsData.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                            </div>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default FAQsPage;
