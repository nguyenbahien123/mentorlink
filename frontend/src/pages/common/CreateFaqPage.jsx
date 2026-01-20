import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import faqService from '../../services/faq';
import { useAuth } from '../../contexts';
import { useToast } from '../../contexts/ToastContext';

const CreateFaqPage = () => {
    const [question, setQuestion] = useState('');
    const [urgency, setUrgency] = useState('LOW');
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            // Should be guarded by ProtectedRoute, but double-check
            navigate('/login', { state: { from: '/faqs/new' } });
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload = { question, urgency };
            const resp = await faqService.createFaq(payload);
            const data = resp.data || resp;
            const created = data.data || data;
            // show toast and navigate to list
            try {
                // use toast if available
                showToast('Gửi câu hỏi thành công', { variant: 'success' });
            } catch (e) { }
            navigate('/faqs');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Tạo FAQ thất bại');
        } finally { setSaving(false); }
    };

    return (
        <Container className="py-4">
            <Row>
                <Col md={{ span: 8, offset: 2 }}>
                    <h2>Tạo câu hỏi mới</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Câu hỏi</Form.Label>
                            <Form.Control as="textarea" rows={4} value={question} onChange={(e) => setQuestion(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Độ ưu tiên</Form.Label>
                            <Form.Select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                                <option value="LOW">Thấp</option>
                                <option value="MEDIUM">Trung bình</option>
                                <option value="HIGH">Cao</option>
                            </Form.Select>
                        </Form.Group>
                        <div className="d-flex gap-2">
                            <Button type="submit" disabled={saving}>{saving ? 'Đang gửi...' : 'Gửi câu hỏi'}</Button>
                            <Button variant="secondary" onClick={() => navigate(-1)}>Hủy</Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateFaqPage;
