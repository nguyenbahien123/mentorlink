import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import faqService from '../../services/faq';

const FAQDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [faq, setFaq] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchFaq(); /* eslint-disable-next-line */ }, [id]);

    const fetchFaq = async () => {
        setLoading(true);
        try {
            const resp = await faqService.getFaqById(id);
            const data = resp.data || resp;
            setFaq(data.data || data);
        } catch (err) { console.error('Failed to load faq', err); }
        finally { setLoading(false); }
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
                    {!loading && faq && (
                        <Card className="shadow-sm">
                            <Card.Body>
                                <h2>{faq.question}</h2>
                                <div className="text-muted small mb-2">{faq.createdAt ? new Date(faq.createdAt).toLocaleString() : ''}</div>
                                <hr />
                                <div>
                                    <h5>Trả lời:</h5>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{faq.answer || 'Chưa có câu trả lời.'}</div>
                                    {faq.createdBy && <div className="mt-3 small text-muted">Người trả lời: {faq.createdBy}</div>}
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default FAQDetailPage;
