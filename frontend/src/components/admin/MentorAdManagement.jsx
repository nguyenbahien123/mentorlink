// src/components/admin/MentorAdManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Tabs,
  Tab,
  Button,
  Modal,
  Image,
  Form,
  Badge,
  Spinner,
  Row,
  Col,
  // Card đã được xóa khỏi đây
} from "react-bootstrap";
import {
  getMentorAdsForAdmin,
  reviewMentorAd,
  getMentorAdStats,
} from "../../services/admin/mentorAdService";
import { useToast } from "../../contexts/ToastContext";
import { FaCheck, FaBan } from "react-icons/fa";

/**
 * Component Modal con để xét duyệt
 */
const ReviewAdModal = ({ show, onHide, ad, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    statusName: "PENDING",
    isPublished: false,
    position: 0,
    rejectionReason: "",
  });
  const { showToast } = useToast();

  useEffect(() => {
    if (ad) {
      setFormData({
        statusName: ad.status, // ad.status giờ là string "PENDING", "APPROVED"...
        isPublished: ad.isPublished,
        position: ad.position || 0,
        rejectionReason: ad.rejectionReason || "",
      });
    }
  }, [ad]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Thay đổi status bằng string
  const handleStatusChange = (newStatusName) => {
    setFormData((prev) => ({ ...prev, statusName: newStatusName }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Kiểm tra bằng string
    if (formData.statusName === "REJECTED" && !formData.rejectionReason) {
      showToast("Vui lòng nhập lý do từ chối", "warning");
      setLoading(false);
      return;
    }

    try {
      // formData giờ đã chứa { statusName: "APPROVED", ... }
      await onSave(ad.id, formData);
      onHide();
    } catch (err) {
      console.error("Lỗi khi duyệt QC:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!ad) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Xét duyệt Quảng cáo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image src={ad.imageUrl} fluid thumbnail className="mb-3" />
        <p>
          <strong>Tiêu đề:</strong> {ad.title}
        </p>
        <p>
          <strong>Mentor:</strong> {ad.mentor?.fullName}
        </p>
        <p>
          <strong>Link:</strong>{" "}
          <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer">
            {ad.linkUrl}
          </a>
        </p>
        <hr />
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Vị trí (ưu tiên, số nhỏ lên trước)</Form.Label>
                <Form.Control
                  type="number"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-center pt-3">
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="isPublished-switch"
                  label="Cho phép hiển thị (Published)"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <div>
              <Button
                variant={
                  formData.statusName === "APPROVED"
                    ? "success"
                    : "outline-success"
                }
                onClick={() => handleStatusChange("APPROVED")}
                className="me-2"
              >
                <FaCheck /> Phê duyệt
              </Button>
              <Button
                variant={
                  formData.statusName === "REJECTED"
                    ? "danger"
                    : "outline-danger"
                }
                onClick={() => handleStatusChange("REJECTED")}
              >
                <FaBan /> Từ chối
              </Button>
            </div>
          </Form.Group>

          {formData.statusName === "REJECTED" && (
            <Form.Group>
              <Form.Label>Lý do từ chối (Bắt buộc)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="rejectionReason"
                value={formData.rejectionReason}
                onChange={handleChange}
              />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner size="sm" /> : "Lưu thay đổi"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// --- BẮT ĐẦU PHẦN CODE CHÍNH CẦN SỬA ĐỔI ---

// Tạo một Component riêng cho nội dung bảng để tránh lặp code quá nhiều
const AdTableContent = ({ ads, loading, getStatusBadge, setSelectedAd }) => {
    return (
        <div className="border rounded shadow-sm">
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                </div>
            ) : ads.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    Không có quảng cáo nào trong mục này.
                </div>
            ) : (
                <Table responsive hover className="m-0">
                    <thead className="bg-light">
                        <tr>
                            <th>Ảnh</th>
                            <th>Tiêu đề</th>
                            <th>Mentor</th>
                            <th>Trạng thái</th>
                            <th>Published</th>
                            <th>Vị trí</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ads.map((ad) => (
                            <tr key={ad.id}>
                                <td>
                                    <Image src={ad.imageUrl} width={100} thumbnail />
                                </td>
                                <td>{ad.title}</td>
                                <td>{ad.mentor?.fullName || "N/A"}</td>
                                <td>
                                    <Badge bg={getStatusBadge(ad.status)}>{ad.status}</Badge>
                                </td>
                                <td>
                                    <Badge bg={ad.isPublished ? "success" : "secondary"}>
                                        {ad.isPublished ? "Bật" : "Tắt"}
                                    </Badge>
                                </td>
                                <td>{ad.position}</td>
                                <td>
                                    <Button size="sm" onClick={() => setSelectedAd(ad)}>
                                        Xem & Duyệt
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};


/**
 * Component chính quản lý Quảng cáo của Mentor
 */
const MentorAdManagement = () => {
  const [key, setKey] = useState("PENDING");
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [stats, setStats] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0 });
  const { showToast } = useToast();
  // Đã xóa state 'statusMap'

  const fetchAdsAndStats = (statusKey) => {
    setLoading(true);
    // Tải đồng thời danh sách Ads và Stats
    Promise.all([
      getMentorAdsForAdmin({ page: 0, size: 20, status: statusKey }),
      getMentorAdStats(),
    ])
      .then(([adsResponse, statsResponse]) => {

        const pageData = adsResponse.data;

        setAds(pageData?.content || []);

        setStats(
          statsResponse.data?.data || { PENDING: 0, APPROVED: 0, REJECTED: 0 }
        );
      })
      .catch((err) => {
        showToast("Lỗi tải dữ liệu", "error");
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  // useEffect này chỉ chạy 1 lần khi đổi Tab
  useEffect(() => {
    fetchAdsAndStats(key);
  }, [key]);

  const handleSaveReview = async (adId, data) => {
    try {
      await reviewMentorAd(adId, data);
      showToast("Đã cập nhật QC thành công!", "success");
      fetchAdsAndStats(key); // Tải lại dữ liệu cho tab hiện tại
    } catch (err) {
      showToast("Lỗi khi cập nhật QC", "error");
      throw err; // Ném lỗi để modal biết và không tự đóng
    }
  };

  const getStatusBadge = (statusName) => {
    if (statusName === "APPROVED") return "success";
    if (statusName === "REJECTED") return "danger";
    return "warning"; // PENDING
  };

  return (
    <>
      <h4>Duyệt Quảng cáo của Mentor</h4>
      <Tabs 
        activeKey={key} 
        onSelect={(k) => setKey(k)} 
        className="mb-3"
        unmountOnExit // Giữ unmountOnExit để chỉ render nội dung tab đang chọn
      >
        <Tab
          eventKey="PENDING"
          title={
            <>
              Chờ duyệt <Badge bg="secondary">{stats.PENDING}</Badge>
            </>
          }
        >
            {/* SỬ DỤNG COMPONENT CHUNG */}
            <AdTableContent 
                ads={ads} 
                loading={loading} 
                getStatusBadge={getStatusBadge} 
                setSelectedAd={setSelectedAd} 
            />
        </Tab>

        <Tab
          eventKey="APPROVED"
          title={
            <>
              Đã duyệt <Badge bg="secondary">{stats.APPROVED}</Badge>
            </>
          }
        >
            {/* THÊM NỘI DUNG CHO TAB APPROVED */}
            <AdTableContent 
                ads={ads} 
                loading={loading} 
                getStatusBadge={getStatusBadge} 
                setSelectedAd={setSelectedAd} 
            />
        </Tab>

        <Tab
          eventKey="REJECTED"
          title={
            <>
              Đã từ chối <Badge bg="secondary">{stats.REJECTED}</Badge>
            </>
          }
        >
            {/* THÊM NỘI DUNG CHO TAB REJECTED */}
            <AdTableContent 
                ads={ads} 
                loading={loading} 
                getStatusBadge={getStatusBadge} 
                setSelectedAd={setSelectedAd} 
            />
        </Tab>
      </Tabs>

      {/* Modal chỉ render khi 'selectedAd' có dữ liệu */}
      {selectedAd && (
        <ReviewAdModal
          show={!!selectedAd}
          onHide={() => setSelectedAd(null)}
          ad={selectedAd}
          onSave={handleSaveReview}
        />
      )}
    </>
  );
};

export default MentorAdManagement;