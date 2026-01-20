import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const AuthLoader = () => {
    return (
        <Container
            className="d-flex justify-content-center align-items-center"
            style={{
                height: '100vh',
                flexDirection: 'column'
            }}
        >
            <div className="text-center">
                <Spinner
                    animation="border"
                    role="status"
                    className="mb-3"
                    style={{ width: '3rem', height: '3rem' }}
                >
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <div className="fs-5 text-muted">Đang khởi tạo...</div>
                <div className="small text-muted mt-2">Vui lòng chờ trong giây lát</div>
            </div>
        </Container>
    );
};

export default AuthLoader;