import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Badge,
  Form,
  Dropdown,
  InputGroup,
  Modal,
  Alert,
  Spinner,
  Pagination,
} from "react-bootstrap";
import {
  FaSearch,
  FaEye,
  FaReply,
  FaTrash,
  FaExclamationTriangle,
  FaCommentDots,
  FaFlag,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  getAllFeedbacks,
  getFeedbackById,
  respondToFeedback,
  markFeedbackInProgress,
  markFeedbackResolved,
  rejectFeedback,
  deleteFeedback,
  bulkResolveFeedbacks,
} from "../../services/admin/feedbackManagementService";
import { useToast } from "../../contexts/ToastContext";

const FeedbackManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [feedbackReports, setFeedbackReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  // selection removed - review items handled individually
  const [responseText, setResponseText] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const { showToast } = useToast();
  const headerCheckboxRef = useRef(null);

  // Fetch feedbacks when component mounts or filters change
  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, pagination.page]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const params = {
        keySearch: searchTerm || "",
        status: filterStatus !== "all" ? filterStatus : null,
        page: pagination.page,
        size: pagination.size,
      };

      const response = await getAllFeedbacks(params);

      if (response.respCode === "0" || response.success) {
        const data = response.data;
        const feedbacksList = data.content || [];
        setFeedbackReports(feedbacksList);

        setPagination((prev) => ({
          ...prev,
          page: data.currentPage || 1,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
        }));
      } else {
        showToast(
          response.description || "Không thể tải danh sách feedback",
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      showToast("Không thể tải danh sách feedback", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchFeedbacks();
  };

  const handleViewFeedback = async (feedback) => {
    try {
      setDetailLoading(true);
      const response = await getFeedbackById(feedback.id);

      if (response.respCode === "0" || response.success) {
        setSelectedFeedback(response.data);
        setShowModal(true);
        setResponseText("");
      } else {
        showToast("Không thể tải thông tin feedback", "error");
      }
    } catch (error) {
      console.error("Error fetching feedback details:", error);
      showToast("Không thể tải thông tin feedback", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRespondAndResolve = async () => {
    if (!responseText.trim()) {
      showToast("Vui lòng nhập nội dung phản hồi", "warning");
      return;
    }

    try {
      const response = await respondToFeedback(
        selectedFeedback.id,
        responseText,
        true
      );

      if (response.respCode === "0" || response.success) {
        showToast("Đã gửi phản hồi và đánh dấu đã giải quyết", "success");
        fetchFeedbacks();
        setShowModal(false);
        setResponseText("");
      } else {
        showToast(response.description || "Không thể gửi phản hồi", "error");
      }
    } catch (error) {
      console.error("Error responding to feedback:", error);
      showToast("Không thể gửi phản hồi", "error");
    }
  };

  const handleMarkInProgress = async (feedbackId) => {
    try {
      const response = await markFeedbackInProgress(feedbackId);

      if (response.respCode === "0" || response.success) {
        showToast("Đã đánh dấu đang xử lý", "success");
        fetchFeedbacks();
        if (selectedFeedback && selectedFeedback.id === feedbackId) {
          setShowModal(false);
        }
      } else {
        showToast(
          response.description || "Không thể cập nhật trạng thái",
          "error"
        );
      }
    } catch (error) {
      console.error("Error marking feedback in progress:", error);
      showToast("Không thể cập nhật trạng thái", "error");
    }
  };

  const handleReject = async (feedbackId) => {
    try {
      const response = await rejectFeedback(feedbackId);

      if (response.respCode === "0" || response.success) {
        showToast("Đã từ chối feedback", "success");
        fetchFeedbacks();
        if (selectedFeedback && selectedFeedback.id === feedbackId) {
          setShowModal(false);
        }
      } else {
        showToast(
          response.description || "Không thể từ chối feedback",
          "error"
        );
      }
    } catch (error) {
      console.error("Error rejecting feedback:", error);
      showToast("Không thể từ chối feedback", "error");
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm("Bạn có chắc muốn xóa feedback này?")) return;

    try {
      const response = await deleteFeedback(feedbackId);

      if (response.respCode === "0" || response.success) {
        showToast("Đã xóa feedback", "success");
        fetchFeedbacks();
        if (selectedFeedback && selectedFeedback.id === feedbackId) {
          setShowModal(false);
        }
      } else {
        showToast(response.description || "Không thể xóa feedback", "error");
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      showToast("Không thể xóa feedback", "error");
    }
  };

  // bulk resolve removed

  // selection handlers removed

  // Indeterminate state for header checkbox
  // indeterminate logic removed


  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case "FEEDBACK":
        return "info";
      case "REPORT":
        return "warning";
      case "COMPLAINT":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case "FEEDBACK":
        return "Góp ý";
      case "REPORT":
        return "Báo cáo";
      case "COMPLAINT":
        return "Khiếu nại";
      default:
        return type;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "IN_PROGRESS":
        return "primary";
      case "RESOLVED":
        return "success";
      case "REJECTED":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "IN_PROGRESS":
        return "Đang xử lý";
      case "RESOLVED":
        return "Đã giải quyết";
      case "REJECTED":
        return "Từ chối";
      default:
        return status;
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case "LOW":
        return "success";
      case "MEDIUM":
        return "warning";
      case "HIGH":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div className="feedback-management">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Quản lý phản hồi & báo cáo</h4>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo người gửi hoặc nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="IN_PROGRESS">Đang xử lý</option>
                <option value="RESOLVED">Đã giải quyết</option>
                <option value="REJECTED">Từ chối</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Feedback Table */}
      <Card>
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              Danh sách phản hồi & báo cáo ({pagination.totalElements || 0})
            </h6>
            
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : feedbackReports.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Không có dữ liệu</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th width="5%">ID</th>
                  <th width="25%">Người gửi</th>
                  <th width="40%">Nội dung</th>
                  <th width="10%">Trạng thái</th>
                  <th width="10%">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {feedbackReports.map((feedback, index) => (
                  <tr key={feedback.id}>
                    <td>
                      {(pagination.page - 1) * pagination.size + index + 1}
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium">
                          {feedback.reporterName || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="content-preview">
                        {feedback.content.length > 100
                          ? `${feedback.content.substring(0, 100)}...`
                          : feedback.content}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(feedback.status)}>
                        {getStatusText(feedback.status)}
                      </Badge>
                    </td>
                    <td>
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="light"
                          size="sm"
                          className="no-caret p-1"
                        >
                          <BsThreeDotsVertical />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => handleViewFeedback(feedback)}
                          >
                            Xem
                          </Dropdown.Item>
                          {feedback.status !== "RESOLVED" && (
                            <Dropdown.Item
                              onClick={() => handleViewFeedback(feedback)}
                            >
                              Phản hồi
                            </Dropdown.Item>
                          )}
                          <Dropdown.Divider />
                          <Dropdown.Item
                            className="text-danger"
                            onClick={() => handleDelete(feedback.id)}
                          >
                            Xóa
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
        {!loading && feedbackReports.length > 0 && (
          <Card.Footer className="bg-white border-top">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="text-muted small">
                Hiển thị{" "}
                <strong>
                  {(pagination.page - 1) * pagination.size + 1}
                </strong>{" "}
                -{" "}
                <strong>
                  {Math.min(
                    pagination.page * pagination.size,
                    pagination.totalElements
                  )}
                </strong>{" "}
                trong tổng số <strong>{pagination.totalElements}</strong> phản hồi
              </div>
              <Pagination className="mb-0" size="sm">
                <Pagination.Prev
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                />

                {(() => {
                  const items = [];
                  const total = pagination.totalPages;
                  const current = pagination.page;
                  const maxVisible = 5;

                  if (total <= maxVisible) {
                    for (let i = 1; i <= total; i++) {
                      items.push(
                        <Pagination.Item
                          key={i}
                          active={i === current}
                          onClick={() => setPagination((prev) => ({ ...prev, page: i }))}
                        >
                          {i}
                        </Pagination.Item>
                      );
                    }
                  } else {
                    items.push(
                      <Pagination.Item
                        key={1}
                        active={1 === current}
                        onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
                      >
                        1
                      </Pagination.Item>
                    );

                    let startPage = Math.max(2, current - 1);
                    let endPage = Math.min(total - 1, current + 1);

                    if (startPage > 2) {
                      items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
                      startPage = Math.max(startPage, current - 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      items.push(
                        <Pagination.Item
                          key={i}
                          active={i === current}
                          onClick={() => setPagination((prev) => ({ ...prev, page: i }))}
                        >
                          {i}
                        </Pagination.Item>
                      );
                    }

                    if (endPage < total - 1) {
                      items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
                    }
                    items.push(
                      <Pagination.Item
                        key={total}
                        active={total === current}
                        onClick={() => setPagination((prev) => ({ ...prev, page: total }))}
                      >
                        {total}
                      </Pagination.Item>
                    );
                  }

                  return items;
                })()}

                <Pagination.Next
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Feedback Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết phản hồi & báo cáo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Người gửi:</strong> {selectedFeedback.reporterName}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Trạng thái:</strong>
                    <Badge
                      bg={getStatusBadgeVariant(selectedFeedback.status)}
                      className="ms-2"
                    >
                      {getStatusText(selectedFeedback.status)}
                    </Badge>
                  </p>
                </Col>
              </Row>

              {selectedFeedback.targetInfo && (
                <Alert variant="info">
                  <strong>Đối tượng báo cáo:</strong>{" "}
                  {selectedFeedback.targetInfo}
                </Alert>
              )}

              <div className="mb-3">
                <h6>Nội dung:</h6>
                <div className="p-3 bg-light rounded">
                  {selectedFeedback.content}
                </div>
              </div>

              {selectedFeedback.response && (
                <div className="mb-3">
                  <h6>Phản hồi của admin:</h6>
                  <div className="p-3 bg-success bg-opacity-10 rounded">
                    {selectedFeedback.response}
                  </div>
                </div>
              )}

              {selectedFeedback.status === "PENDING" && (
                <div>
                  <h6>Phản hồi:</h6>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Nhập phản hồi của bạn..."
                    className="mb-3"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                  <div className="d-flex gap-2">
                    <Button variant="success" onClick={handleRespondAndResolve}>
                      <FaReply className="me-1" />
                      Gửi phản hồi & Đánh dấu đã giải quyết
                    </Button>
                    <Button
                      variant="warning"
                      onClick={() => handleMarkInProgress(selectedFeedback.id)}
                    >
                      Đánh dấu đang xử lý
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleReject(selectedFeedback.id)}
                    >
                      Từ chối
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FeedbackManagement;
