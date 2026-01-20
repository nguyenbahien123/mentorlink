import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Badge,
  Form,
  InputGroup,
  Modal,
  Spinner,
  Alert,
  Nav,
  Tab,
} from "react-bootstrap";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaFileAlt,
  FaPlus,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useToast } from "../../contexts/ToastContext";

import {
  getAllPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  togglePolicyStatus,
  searchPolicies,
} from "../../services/admin/policyService";

const PolicyFormModal = ({
  show,
  onHide,
  policy,
  onSave,
  isCreating,
  loading,
  activeType,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isActive: true,
    type: activeType,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      if (isCreating || !policy) {
        setFormData({
          title: "",
          content: "",
          isActive: true,
          type: activeType,
        });
        setErrors({});
      } else {
        setFormData({
          title: policy.title || "",
          content: policy.content || "",
          isActive: policy.isActive === true,
          type: policy.type || "GENERAL",
        });
        setErrors({});
      }
    }
  }, [policy, isCreating, show, activeType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim() === "") {
      newErrors.title = "Tiêu đề không được để trống";
    }

    if (!formData.content || formData.content.trim() === "") {
      newErrors.content = "Nội dung không được để trống";
    }

    if (!formData.type) {
      newErrors.type = "Bạn phải chọn một loại chính sách";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {isCreating ? "Tạo chính sách mới" : "Cập nhật chính sách"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="policyType">
            <Form.Label>Loại chính sách</Form.Label>
            <Form.Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={!isCreating}
            >
              <option value="MENTOR">Dành cho Mentor</option>
              <option value="MENTEE">Dành cho Mentee</option>
              <option value="GENERAL">Chính sách chung</option>
            </Form.Select>
            {!isCreating && (
              <Form.Text muted>
                Không thể thay đổi loại chính sách sau khi tạo.
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="policyTitle">
            <Form.Label>Tiêu đề</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              isInvalid={!!errors.title}
              placeholder="Nhập tiêu đề chính sách"
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="policyContent">
            <Form.Label>Nội dung</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              name="content"
              value={formData.content}
              onChange={handleChange}
              isInvalid={!!errors.content}
              placeholder="Nhập nội dung chi tiết của chính sách..."
            />
            <Form.Control.Feedback type="invalid">
              {errors.content}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="policyIsActive">
            <Form.Check
              type="switch"
              name="isActive"
              label="Kích hoạt chính sách này"
              checked={formData.isActive}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            <FaTimes className="me-1" /> Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              <FaCheck className="me-1" />
            )}
            {isCreating ? " Tạo mới" : " Lưu thay đổi"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const PolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("MENTOR");

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

 
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 0 }));
    fetchPolicies(0, searchTerm);
  }, [activeTab]);

  useEffect(() => {
    fetchPolicies(pagination.page, searchTerm);
  }, [pagination.page]);

  const fetchPolicies = async (page = 0, keyword = "") => {
    try {
      setLoading(true);
      let response;
      const params = {
        page: page,
        size: pagination.size,
        sort: "createdAt,desc",
      };

      const type = activeTab;

      if (keyword && keyword.trim() !== "") {
        response = await searchPolicies(type, keyword, params);
      } else {
        response = await getAllPolicies(type, params);
      }

      const responseData = response.data;
      if (responseData && responseData.policyPage && responseData.stats) {
        const pageData = responseData.policyPage;
        const statsData = responseData.stats;

        setPolicies(pageData.content);
        setPagination((prev) => ({
          ...prev,
          totalPages: pageData.totalPages || 0,
          totalElements: pageData.totalElements || 0,
          page: pageData.number || 0,
        }));

        setStats({
          total: statsData.totalPolicies || 0,
          active: statsData.totalActive || 0,
          inactive: statsData.totalInactive || 0,
        });
      } else {
        setPolicies([]);
        setPagination({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
        setStats({ total: 0, active: 0, inactive: 0 });
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
      showToast("Không thể tải danh sách chính sách", "error");
      const errorMsg =
        error.data?.description || error.message || "Lỗi không xác định";
      console.log("Error details:", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 0 }));
    fetchPolicies(0, searchTerm);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleCreateNew = () => {
    setSelectedPolicy(null);
    setIsCreating(true);
    setShowModal(true);
  };

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setIsCreating(false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chính sách này?")) return;
    try {
      await deletePolicy(id);
      showToast("Đã xóa chính sách thành công", "success");
      fetchPolicies(pagination.page, searchTerm);
    } catch (error) {
      console.error("Error deleting policy:", error);
      const errorMsg = error.data?.description || "Không thể xóa chính sách";
      showToast(errorMsg, "error");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await togglePolicyStatus(id);
      const updatedPolicy = response.data;
      const statusText = updatedPolicy.isActive ? "kích hoạt" : "vô hiệu hóa";
      showToast(`Đã ${statusText} chính sách`, "success");
      fetchPolicies(pagination.page, searchTerm);
    } catch (error) {
      console.error("Error toggling policy status:", error);
      const errorMsg =
        error.data?.description || "Không thể thay đổi trạng thái";
      showToast(errorMsg, "error");
    }
  };

  const handleSave = async (formData) => {
    try {
      setModalLoading(true);
      if (isCreating) {
        await createPolicy(formData);
        showToast("Đã tạo chính sách mới thành công", "success");
      } else {
        await updatePolicy(selectedPolicy.id, formData);
      }
      setShowModal(false);
      fetchPolicies(pagination.page, searchTerm);
    } catch (error) {
      console.error("Error saving policy:", error);
      const errorMsg = error.data?.description || "Không thể lưu chính sách";
      showToast(errorMsg, "error");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="policy-management">
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Quản lý Chính sách & Điều khoản</h4>{" "}
          <p className="text-muted mb-0">
            Quản lý chính sách cho Mentor, Mentee và các điều khoản chung.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleCreateNew}>
          <FaPlus className="me-1" /> Tạo mới
        </Button>
      </div>
      <Nav
        variant="tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Nav.Item>
          <Nav.Link eventKey="MENTOR">Chính sách Mentor</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="MENTEE">Chính sách Mentee</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="GENERAL">Chính sách Chung</Nav.Link>
        </Nav.Item>
      </Nav>
      <Row className="mb-3 g-3">
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-1">Tổng chính sách ({activeTab})</h6>
              <h4 className="fw-semibold mb-0">{stats.total || 0}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-1">Đang hoạt động</h6>
              <h4 className="fw-semibold mb-0">{stats.active || 0}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center">
              <h6 className="text-muted mb-1">Không hoạt động</h6>
              <h4 className="fw-semibold mb-0">{stats.inactive || 0}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={10}>
              <Form.Label>Tìm kiếm chính sách</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo tiêu đề chính sách..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : "Lọc"}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Card>
        <Card.Header className="bg-light">
          <h6 className="mb-0">
            Danh sách chính sách ({pagination.totalElements})
          </h6>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-5">
              <FaFileAlt size={48} className="text-muted mb-3" />
              <p className="text-muted">Không tìm thấy chính sách nào</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th width="35%">Tiêu đề</th>
                  <th width="30%">Nội dung (tóm tắt)</th>
                  <th width="10%">Trạng thái</th>
                  <th width="15%">Ngày tạo</th>
                  <th width="10%">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id}>
                    <td>
                      <span className="fw-medium">{policy.title}</span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {policy.content
                          ? policy.content.substring(0, 100) +
                            (policy.content.length > 100 ? "..." : "")
                          : ""}
                      </span>
                    </td>
                    <td>
                      {policy.isActive ? (
                        <Badge
                          bg="success"
                          className="d-flex align-items-center justify-content-center gap-1"
                          style={{ width: "fit-content" }}
                        >
                          <FaToggleOn size={12} /> Hoạt động
                        </Badge>
                      ) : (
                        <Badge
                          bg="secondary"
                          className="d-flex align-items-center justify-content-center gap-1"
                          style={{ width: "fit-content" }}
                        >
                          <FaToggleOff size={12} /> Ẩn
                        </Badge>
                      )}
                    </td>
                    <td>
                      <span className="text-muted">
                        {policy.createdAt
                          ? new Date(policy.createdAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </span>
                    </td>
                    <td className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(policy)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant={
                          policy.isActive
                            ? "outline-secondary"
                            : "outline-success"
                        }
                        size="sm"
                        onClick={() => handleToggleStatus(policy.id)}
                        title={policy.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        {policy.isActive ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(policy.id)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
        {!loading && pagination.totalPages > 1 && (
          <Card.Footer className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">
                Hiển thị {pagination.page * pagination.size + 1} -{" "}
                {Math.min(
                  (pagination.page + 1) * pagination.size,
                  pagination.totalElements
                )}{" "}
                trong tổng số {pagination.totalElements} chính sách
              </span>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={pagination.page === 0}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Trước
                </Button>
                <span className="px-3 py-1 text-muted">
                  Trang {pagination.page + 1} / {pagination.totalPages || 1}
                </span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages - 1}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          </Card.Footer>
        )}
      </Card>
      <PolicyFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        policy={selectedPolicy}
        onSave={handleSave}
        isCreating={isCreating}
        loading={modalLoading}
        activeType={activeTab}
      />
    </div>
  );
};

export default PolicyManagement;
