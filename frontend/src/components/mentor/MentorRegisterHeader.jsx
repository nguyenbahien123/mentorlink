import React from 'react';

const MentorRegisterHeader = () => {
    return (
        <div className="w-100 position-relative overflow-hidden" style={{ height: '250px' }}>
            <img
                src="/mentor-header.jpg"
                alt="Mentor Registration"
                className="w-100 h-100 object-fit-cover"
                style={{ filter: 'brightness(0.7)' }}
            />
            <div className="position-absolute top-0 left-0 w-100 h-100 d-flex align-items-center justify-content-center">
                <div className="text-center text-white">
                    <h1 className="display-4 fw-bold text-uppercase">Đăng ký làm Cố vấn</h1>
                    <p className="lead">Chia sẻ kiến thức, kết nối tương lai</p>
                </div>
            </div>
        </div>
    );
};

export default MentorRegisterHeader;