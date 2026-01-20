import React, { useState } from 'react';
import { Modal, Image, Button } from 'react-bootstrap';
import { FaTimes, FaExternalLinkAlt, FaDownload } from 'react-icons/fa';

const ImageModal = ({ show, onHide, imageSrc, imageTitle, imageDescription }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = imageTitle || 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenInNewTab = () => {
        window.open(imageSrc, '_blank');
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            className="image-modal"
        >
            <Modal.Header className="border-0 pb-0">
                <div className="w-100 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 text-primary">{imageTitle || 'Xem ảnh'}</h6>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={onHide}
                        className="btn-close-custom"
                    >
                        <FaTimes />
                    </Button>
                </div>
            </Modal.Header>

            <Modal.Body className="p-3">
                <div className="text-center">
                    <Image
                        src={imageSrc}
                        alt={imageTitle || 'Image'}
                        fluid
                        className="modal-image"
                        style={{
                            maxHeight: '70vh',
                            borderRadius: '8px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                    />
                    {imageDescription && (
                        <p className="text-muted mt-3 mb-0">{imageDescription}</p>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer className="border-0 pt-0">
                <div className="d-flex gap-2 justify-content-center w-100">
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleOpenInNewTab}
                    >
                        <FaExternalLinkAlt className="me-1" />
                        Mở tab mới
                    </Button>
                    <Button
                        variant="outline-success"
                        size="sm"
                        onClick={handleDownload}
                    >
                        <FaDownload className="me-1" />
                        Tải xuống
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ImageModal;