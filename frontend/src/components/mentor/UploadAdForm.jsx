import React, { useState } from "react";
import {
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Image,
} from "react-bootstrap";
import { useToast } from "../../contexts/ToastContext";
import { uploadMentorAd } from "../../services/admin/mentorAdService";

const UploadAdForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !linkUrl) {
      showToast("Vui lòng điền tiêu đề, link và chọn ảnh.", "warning");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    const jsonData = { title, linkUrl };
    formData.append(
      "data",
      new Blob([JSON.stringify(jsonData)], { type: "application/json" })
    );

    try {
      await uploadMentorAd(formData);
      showToast("Upload thành công! QC đang chờ xét duyệt.", "success");
      // Reset form
      setFile(null);
      setPreview(null);
      setTitle("");
      setLinkUrl("");
      if (onUploadSuccess) onUploadSuccess(); // Gọi callback để tải lại list
    } catch (err) {
      showToast("Upload thất bại. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Tải lên Quảng cáo mới</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Ảnh Quảng cáo</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                {preview && (
                  <Image src={preview} thumbnail fluid className="mt-3" />
                )}
              </Form.Group>
            </Col>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Link liên kết (URL)</Form.Label>
                <Form.Control
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Gửi xét duyệt"}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};
export default UploadAdForm;
