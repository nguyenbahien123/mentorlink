import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebookSquare } from 'react-icons/fa';
import '../../../styles/components/Footer.css';

const Footer = () => {
    return (
        <footer className="main-footer">
            <Container>
                <div className="footer-content">
                    <Row className="footer-info">
                        <Col md={6} className="contact-info">
                            <p className="address">Trường đại học Fpt Hà Nội</p>
                            <p className="phone">0332671182</p>
                            <p className="email">info@mentorlink.com</p>
                            <div className="social-links">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                                    <FaFacebookSquare size={24} />
                                </a>
                            </div>
                        </Col>
                        <Col md={6}>
                            <Row>
                                <Col className="footer-links text-end">
                                    <Link to="/" className="footer-link">MentorLink</Link>
                                    <Link to="/about" className="footer-link">Về chúng tôi</Link>
                                    <Link to="/blogs" className="footer-link">Blog</Link>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;