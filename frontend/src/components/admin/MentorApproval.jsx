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
  Nav,
  Tab,
  Alert,
  ProgressBar,
  Spinner,
} from "react-bootstrap";
import {
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaDownload,
  FaGraduationCap,
  FaBriefcase,
  FaCertificate,
  FaUser,
  FaGlobe,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  getAllMentors,
  getMentorById,
  approveMentor,
  rejectMentor,
  bulkApproveMentors,
  bulkRejectMentors,
  deleteMentor,
  getMentorStatistics,
  getMentorEducation,
  getMentorExperience,
  getMentorCertificates,
  getMentorServices,
  getMentorCountries,
  approveEducation,
  rejectEducation,
  approveExperience,
  rejectExperience,
  approveCertificate,
  rejectCertificate,
  approveService,
  rejectService,
} from "../../services/admin";
import { useToast } from "../../contexts/ToastContext";

const MentorApproval = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mentorApplications, setMentorApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMentorIds, setSelectedMentorIds] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [mentorEducation, setMentorEducation] = useState([]);
  const [mentorExperience, setMentorExperience] = useState([]);
  const [mentorCertificates, setMentorCertificates] = useState([]);
  const [mentorServices, setMentorServices] = useState([]);
  const [mentorCountries, setMentorCountries] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState({
    education: false,
    experience: false,
    certificates: false,
    services: false,
    countries: false,
  });
  const [imageModal, setImageModal] = useState({ show: false, url: "" });
  const { showToast } = useToast();
  const headerCheckboxRef = useRef(null);

  // Fetch mentors 
  useEffect(() => {
    fetchMentors();
  }, [filterStatus, pagination.page]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const params = {
        keySearch: searchTerm || "",
        status:
          filterStatus !== "all" ? getStatusIdFromFilter(filterStatus) : null,
        page: pagination.page,
        size: pagination.size,
      };

      const response = await getAllMentors(params);

      if (response.respCode === "0" || response.success) {
        const data = response.data;
        const mentorsList = data.content || [];
        setMentorApplications(mentorsList);

        setPagination((prev) => ({
          ...prev,
          page: data.currentPage || 1,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
        }));
      } else {
        showToast(
          response.description || "Không thể tải danh sách mentor",
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching mentors:", error);
      showToast("Không thể tải danh sách mentor", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIdFromFilter = (filterValue) => {
    const statusMap = {
      PENDING: 3,
      APPROVED: 4,
      REJECTED: 5,
    };
    return statusMap[filterValue] || null;
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchMentors();
  };

  const getStatusBadgeVariant = (statusName) => {
    if (!statusName) return "secondary";
    const status = statusName.toUpperCase();
    if (status.includes("PENDING") || status.includes("CHỜ")) return "warning";
    if (
      status.includes("ACTIVE") ||
      status.includes("APPROVED") ||
      status.includes("HOẠT ĐỘNG")
    )
      return "success";
    if (
      status.includes("INACTIVE") ||
      status.includes("REJECTED") ||
      status.includes("TỪ CHỐI")
    )
      return "danger";
    return "secondary";
  };

  const getStatusText = (statusName) => {
    if (!statusName) return "Không xác định";
    return statusName;
  };

  const handleViewMentor = async (mentor) => {
    try {
      setMentorEducation([]);
      setMentorExperience([]);
      setMentorCertificates([]);
      setMentorServices([]);
      setMentorCountries([]);
      const response = await getMentorById(mentor.id);

      if (response.respCode === "0" || response.success) {
        const mentorData = response.data;
        setSelectedMentor(mentorData);
        setShowModal(true);

        // Set initial data if available
        const educations =
          mentorData.mentorEducations || mentorData.educations || [];
        const experiences =
          mentorData.mentorExperiences || mentorData.experiences || [];
        const certificates =
          mentorData.mentorTests ||
          mentorData.tests ||
          mentorData.certificates ||
          [];
        const services = mentorData.mentorServices || mentorData.services || [];
        const countries = mentorData.mentorCountries || mentorData.countries || [];

        setMentorEducation(educations);
        setMentorExperience(experiences);
        setMentorCertificates(certificates);
        setMentorServices(services);
        setMentorCountries(countries);

        // Always fetch fresh data from dedicated endpoints
        fetchMentorEducation(mentor.id);
        fetchMentorExperience(mentor.id);
        fetchMentorCertificates(mentor.id);
        fetchMentorServices(mentor.id);
        fetchMentorCountries(mentor.id);
      } else {
        showToast("Không thể tải thông tin mentor", "error");
      }
    } catch (error) {
      console.error("Error fetching mentor details:", error);
      showToast("Không thể tải thông tin mentor", "error");
    }
  };

  const openImage = (url) => {
    if (!url) return;
    setImageModal({ show: true, url });
  };

  const closeImage = () => setImageModal({ show: false, url: "" });

  // Fetch mentor education
  const fetchMentorEducation = async (mentorId) => {
    try {
      setLoadingDetails((prev) => ({ ...prev, education: true }));
      const response = await getMentorEducation(mentorId);

      if (response.respCode === "0" || response.success) {
        setMentorEducation(response.data || []);
      } else {
        showToast("Không thể tải thông tin học vấn", "error");
      }
    } catch (error) {
      console.error("Error fetching mentor education:", error);
      showToast("Không thể tải thông tin học vấn", "error");
    } finally {
      setLoadingDetails((prev) => ({ ...prev, education: false }));
    }
  };

  // Fetch mentor experience
  const fetchMentorExperience = async (mentorId) => {
    try {
      setLoadingDetails((prev) => ({ ...prev, experience: true }));
      const response = await getMentorExperience(mentorId);

      if (response.respCode === "0" || response.success) {
        setMentorExperience(response.data || []);
      } else {
        showToast("Không thể tải thông tin kinh nghiệm", "error");
      }
    } catch (error) {
      console.error("Error fetching mentor experience:", error);
      showToast("Không thể tải thông tin kinh nghiệm", "error");
    } finally {
      setLoadingDetails((prev) => ({ ...prev, experience: false }));
    }
  };

  // Fetch mentor certificates
  const fetchMentorCertificates = async (mentorId) => {
    try {
      setLoadingDetails((prev) => ({ ...prev, certificates: true }));
      const response = await getMentorCertificates(mentorId);

      if (response.respCode === "0" || response.success) {
        setMentorCertificates(response.data || []);
      } else {
        showToast("Không thể tải thông tin chứng chỉ", "error");
      }
    } catch (error) {
      console.error("Error fetching mentor certificates:", error);
      showToast("Không thể tải thông tin chứng chỉ", "error");
    } finally {
      setLoadingDetails((prev) => ({ ...prev, certificates: false }));
    }
  };

  // Fetch mentor services
  const fetchMentorServices = async (mentorId) => {
    try {
      setLoadingDetails((prev) => ({ ...prev, services: true }));
      const response = await getMentorServices(mentorId);

      if (response.respCode === "0" || response.success) {
        setMentorServices(response.data || []);
      } else {
        showToast("Không thể tải thông tin dịch vụ", "error");
      }
    } catch (error) {
      console.error("Error fetching mentor services:", error);
      showToast("Không thể tải thông tin dịch vụ", "error");
    } finally {
      setLoadingDetails((prev) => ({ ...prev, services: false }));
    }
  };

  // Fetch mentor countries
  const fetchMentorCountries = async (mentorId) => {
    try {
      setLoadingDetails((prev) => ({ ...prev, countries: true }));
      const response = await getMentorCountries(mentorId);

      if (response.respCode === "0" || response.success) {
        setMentorCountries(response.data || []);
      } else {
        showToast("Không thể tải thông tin quốc gia", "error");
      }
    } catch (error) {
      console.error("Error fetching mentor countries:", error);
      showToast("Không thể tải thông tin quốc gia", "error");
    } finally {
      setLoadingDetails((prev) => ({ ...prev, countries: false }));
    }
  };

  const handleApproveMentor = async (mentorId) => {
    try {
      const response = await approveMentor(mentorId);

      if (response.respCode === "0" || response.success) {
        showToast(
          "Đã duyệt mentor và tất cả thông tin liên quan (học vấn, kinh nghiệm, chứng chỉ, dịch vụ) thành công",
          "success"
        );
        fetchMentors();
        fetchStatistics();
        setShowModal(false);
      } else {
        showToast(response.description || "Không thể duyệt mentor", "error");
      }
    } catch (error) {
      console.error("Error approving mentor:", error);
      showToast("Không thể duyệt mentor", "error");
    }
  };

  const handleRejectMentor = async (mentorId) => {
    try {
      const response = await rejectMentor(mentorId);

      if (response.respCode === "0" || response.success) {
        showToast(
          "Đã từ chối mentor và tất cả thông tin liên quan (học vấn, kinh nghiệm, chứng chỉ, dịch vụ)",
          "success"
        );
        fetchMentors();
        fetchStatistics();
        setShowModal(false);
      } else {
        showToast(response.description || "Không thể từ chối mentor", "error");
      }
    } catch (error) {
      console.error("Error rejecting mentor:", error);
      showToast("Không thể từ chối mentor", "error");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedMentorIds.length === 0) {
      showToast("Vui lòng chọn ít nhất một mentor", "warning");
      return;
    }

    try {
      const response = await bulkApproveMentors(selectedMentorIds);

      if (response.respCode === "0" || response.success) {
        showToast(
          `Đã duyệt ${selectedMentorIds.length} mentor và tất cả thông tin liên quan thành công`,
          "success"
        );
        setSelectedMentorIds([]);
        fetchMentors();
        fetchStatistics();
      } else {
        showToast(response.description || "Không thể duyệt mentor", "error");
      }
    } catch (error) {
      console.error("Error bulk approving mentors:", error);
      showToast("Không thể duyệt mentor", "error");
    }
  };

  const handleBulkReject = async () => {
    if (selectedMentorIds.length === 0) {
      showToast("Vui lòng chọn ít nhất một mentor", "warning");
      return;
    }

    try {
      const response = await bulkRejectMentors(selectedMentorIds);

      if (response.respCode === "0" || response.success) {
        showToast(
          `Đã từ chối ${selectedMentorIds.length} mentor và tất cả thông tin liên quan`,
          "success"
        );
        setSelectedMentorIds([]);
        fetchMentors();
        fetchStatistics();
      } else {
        showToast(response.description || "Không thể từ chối mentor", "error");
      }
    } catch (error) {
      console.error("Error bulk rejecting mentors:", error);
      showToast("Không thể từ chối mentor", "error");
    }
  };

  const handleSelectMentor = (mentorId) => {
    setSelectedMentorIds((prev) => {
      if (prev.includes(mentorId)) {
        return prev.filter((id) => id !== mentorId);
      } else {
        return [...prev, mentorId];
      }
    });
  };

  const handleSelectAll = () => {
    const allIdsOnPage = mentorApplications.map((m) => m.id);
    const allSelected =
      allIdsOnPage.length > 0 &&
      allIdsOnPage.every((id) => selectedMentorIds.includes(id));
    if (allSelected) {
      setSelectedMentorIds((prev) =>
        prev.filter((id) => !allIdsOnPage.includes(id))
      );
    } else {
      setSelectedMentorIds((prev) =>
        Array.from(new Set([...prev, ...allIdsOnPage]))
      );
    }
  };

  const handleDeleteMentor = async (mentorId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mentor này?")) {
      return;
    }

    try {
      const response = await deleteMentor(mentorId);

      if (response.respCode === "0" || response.success) {
        showToast("Đã xóa mentor thành công", "success");
        fetchMentors();
        if (showModal && selectedMentor?.id === mentorId) {
          setShowModal(false);
        }
      } else {
        showToast(response.description || "Không thể xóa mentor", "error");
      }
    } catch (error) {
      console.error("Error deleting mentor:", error);
      showToast("Không thể xóa mentor", "error");
    }
  };

  // ========== Individual Item Approval/Rejection Handlers ==========
  
  // Education handlers
  const handleApproveEducation = async (educationId) => {
    try {
      const response = await approveEducation(educationId);
      if (response.respCode === "0" || response.success) {
        showToast("Đã duyệt học vấn thành công", "success");
        if (selectedMentor) {
          await fetchMentorEducation(selectedMentor.id);
        }
      } else {
        showToast(response.description || "Không thể duyệt học vấn", "error");
      }
    } catch (error) {
      console.error("Error approving education:", error);
      showToast("Không thể duyệt học vấn", "error");
    }
  };

  const handleRejectEducation = async (educationId) => {
    try {
      const response = await rejectEducation(educationId);
      if (response.respCode === "0" || response.success) {
        showToast("Đã từ chối học vấn", "success");
        if (selectedMentor) {
          await fetchMentorEducation(selectedMentor.id);
        }
      } else {
        showToast(response.description || "Không thể từ chối học vấn", "error");
      }
    } catch (error) {
      console.error("Error rejecting education:", error);
      showToast("Không thể từ chối học vấn", "error");
    }
  };

  // Experience handlers
  const handleApproveExperience = async (experienceId) => {
    try {
      const response = await approveExperience(experienceId);
      if (response.respCode === "0" || response.success) {
        showToast("Đã duyệt kinh nghiệm thành công", "success");
        if (selectedMentor) {
          await fetchMentorExperience(selectedMentor.id);
        }
      } else {
        showToast(response.description || "Không thể duyệt kinh nghiệm", "error");
      }
    } catch (error) {
      console.error("Error approving experience:", error);
      showToast("Không thể duyệt kinh nghiệm", "error");
    }
  };

  const handleRejectExperience = async (experienceId) => {
    try {
      const response = await rejectExperience(experienceId);
      if (response.respCode === "0" || response.success) {
        showToast("Đã từ chối kinh nghiệm", "success");
        if (selectedMentor) {
          await fetchMentorExperience(selectedMentor.id);
        }
      } else {
        showToast(response.description || "Không thể từ chối kinh nghiệm", "error");
      }
    } catch (error) {
      console.error("Error rejecting experience:", error);
      showToast("Không thể từ chối kinh nghiệm", "error");
    }
  };

  // Certificate handlers
  const handleApproveCertificate = async (certificateId) => {
    try {
      const response = await approveCertificate(certificateId);
      if (response.respCode === "0" || response.success) {
        showToast("Đã duyệt chứng chỉ thành công", "success");
        if (selectedMentor) {
          await fetchMentorCertificates(selectedMentor.id);
        }
      } else {
        showToast(response.description || "Không thể duyệt chứng chỉ", "error");
      }
    } catch (error) {
      console.error("Error approving certificate:", error);
      showToast("Không thể duyệt chứng chỉ", "error");
    }
  };

  const handleRejectCertificate = async (certificateId) => {
    try {
      const response = await rejectCertificate(certificateId);
      if (response.respCode === "0" || response.success) {
        showToast("Đã từ chối chứng chỉ", "success");
        if (selectedMentor) {
          await fetchMentorCertificates(selectedMentor.id);
        }
      } else {
        showToast(response.description || "Không thể từ chối chứng chỉ", "error");
      }
    } catch (error) {
      console.error("Error rejecting certificate:", error);
      showToast("Không thể từ chối chứng chỉ", "error");
    }
  };

  // Service handlers
  const handleApproveService = async (serviceId) => {
    try {
      const response = await approveService(serviceId);
      if (response.respCode === "0" || response.success) {
        showToast("Đã duyệt dịch vụ thành công", "success");
        if (selectedMentor) {
          await fetchMentorServices(selectedMentor.id);
        }
      } else {
        showToast(response.description || "Không thể duyệt dịch vụ", "error");
      }
    } catch (error) {
      console.error("Error approving service:", error);
      showToast("Không thể duyệt dịch vụ", "error");
    }
  };

  const handleRejectService = async (serviceId) => {
    try {
      const response = await rejectService(serviceId);
      if (response.respCode === "0" || response.success) {
        showToast("Đã từ chối dịch vụ", "success");
        if (selectedMentor) {
          await fetchMentorServices(selectedMentor.id);
        }
      } else {
        showToast(response.description || "Không thể từ chối dịch vụ", "error");
      }
    } catch (error) {
      console.error("Error rejecting service:", error);
      showToast("Không thể từ chối dịch vụ", "error");
    }
  };

  // Indeterminate state for header checkbox
  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    const allIdsOnPage = mentorApplications.map((m) => m.id);
    const selectedOnPage = allIdsOnPage.filter((id) =>
      selectedMentorIds.includes(id)
    );
    const allSelectedOnPage =
      selectedOnPage.length === allIdsOnPage.length && allIdsOnPage.length > 0;
    const someSelectedOnPage = selectedOnPage.length > 0 && !allSelectedOnPage;
    headerCheckboxRef.current.indeterminate = someSelectedOnPage;
  }, [mentorApplications, selectedMentorIds]);

  return (
    <div className="mentor-approval">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Duyệt/xác thực mentor</h4>
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
                  placeholder="Tìm theo tên hoặc email..."
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
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Applications Table */}
      <Card>
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              Đơn đăng ký mentor ({pagination.totalElements || 0})
            </h6>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleSelectAll}
                disabled={mentorApplications.length === 0}
              >
                {selectedMentorIds.length === mentorApplications.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </Button>
              <Button
                variant="outline-success"
                size="sm"
                onClick={handleBulkApprove}
                disabled={selectedMentorIds.length === 0}
              >
                Duyệt đã chọn ({selectedMentorIds.length})
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleBulkReject}
                disabled={selectedMentorIds.length === 0}
              >
                Từ chối đã chọn ({selectedMentorIds.length})
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : mentorApplications.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Không có dữ liệu</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th width="5%">
                    <Form.Check
                      type="checkbox"
                      ref={headerCheckboxRef}
                      checked={
                        mentorApplications.length > 0 &&
                        mentorApplications.every((m) =>
                          selectedMentorIds.includes(m.id)
                        )
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th width="25%">Thông tin cá nhân</th>
                  <th width="25%">Chuyên môn</th>
                  <th width="15%">Trạng thái</th>
                  <th width="20%">Ngày nộp</th>
                  <th width="10%">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {mentorApplications.map((mentor) => {
                  const isPending =
                    mentor.statusName &&
                    mentor.statusName.toUpperCase().includes("PENDING");
                  return (
                    <tr key={mentor.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedMentorIds.includes(mentor.id)}
                          onChange={() => handleSelectMentor(mentor.id)}
                        />
                      </td>
                      <td>
                        <div className="fw-medium">
                          {mentor.fullname || "N/A"}
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">
                            {mentor.title || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(mentor.statusName)}>
                          {getStatusText(mentor.statusName)}
                        </Badge>
                      </td>
                      <td>
                        <span className="text-muted">
                          {mentor.createdAt
                            ? new Date(mentor.createdAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </span>
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
                              onClick={() => handleViewMentor(mentor)}
                            >
                              Xem
                            </Dropdown.Item>
                            {isPending && (
                              <>
                                <Dropdown.Item
                                  onClick={() => handleApproveMentor(mentor.id)}
                                >
                                  Duyệt
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => handleRejectMentor(mentor.id)}
                                >
                                  Từ chối
                                </Dropdown.Item>
                              </>
                            )}
                            <Dropdown.Divider />
                            <Dropdown.Item
                              onClick={() => handleDeleteMentor(mentor.id)}
                              className="text-danger"
                            >
                              Xóa
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
        {!loading && pagination.totalPages > 1 && (
          <Card.Footer>
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Hiển thị {mentorApplications.length} /{" "}
                {pagination.totalElements} kết quả
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Trước
                </Button>
                <span className="align-self-center">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Sau
                </Button>
              </div>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Image Viewer Modal */}
      <Modal show={imageModal.show} onHide={closeImage} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Xem ảnh</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-0">
          {imageModal.url && (
            <img
              src={imageModal.url}
              alt="Full size"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeImage}>
            Đóng
          </Button>
          {imageModal.url && (
            <Button
              variant="primary"
              as="a"
              href={imageModal.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDownload className="me-1" />
              Mở trong tab mới
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Mentor Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn đăng ký mentor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMentor && (
            <Tab.Container defaultActiveKey="personal">
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="personal">
                    <FaUser className="me-1" />
                    Thông tin cá nhân
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="services">
                    <FaBriefcase className="me-1" />
                    Dịch vụ
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="education">
                    <FaGraduationCap className="me-1" />
                    Học vấn
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="experience">
                    <FaBriefcase className="me-1" />
                    Kinh nghiệm
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="tests">
                    <FaCertificate className="me-1" />
                    Chứng chỉ
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="personal">
                  <Row>
                    <Col md={6}>
                      <p>
                        <strong>Họ tên:</strong>{" "}
                        {selectedMentor.fullname || "N/A"}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedMentor.email || "N/A"}
                      </p>
                      <p>
                        <strong>Điện thoại:</strong>{" "}
                        {selectedMentor.phone || "N/A"}
                      </p>
                      <p>
                        <strong>Chức danh:</strong>{" "}
                        {selectedMentor.title || "N/A"}
                      </p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>Bằng cấp cao nhất:</strong>{" "}
                        {selectedMentor.highestDegreeName || "N/A"}
                      </p>
                      {selectedMentor.linkedinUrl && (
                        <p>
                          <strong>LinkedIn:</strong>
                          <a
                            href={selectedMentor.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ms-2"
                          >
                            {selectedMentor.linkedinUrl}
                          </a>
                        </p>
                      )}
                      <p>
                        <strong>Trạng thái:</strong>
                        <Badge
                          bg={getStatusBadgeVariant(selectedMentor.statusName)}
                          className="ms-2"
                        >
                          {getStatusText(selectedMentor.statusName)}
                        </Badge>
                      </p>
                    </Col>
                  </Row>
                  {selectedMentor.intro && (
                    <div className="mb-3">
                      <strong>Giới thiệu bản thân:</strong>
                      <div className="p-3 bg-light rounded mt-2">
                        {selectedMentor.intro}
                      </div>
                    </div>
                  )}
                  {/* Display Countries */}
                  {mentorCountries.length > 0 && (
                    <div>
                      <strong><FaGlobe className="me-2" />Quốc gia dạy học:</strong>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {mentorCountries.map((country, index) => (
                          <Badge 
                            key={index}
                            bg={
                              country.statusCode === "APPROVED"
                                ? "success"
                                : country.statusCode === "PENDING"
                                ? "warning"
                                : country.statusCode === "REJECTED"
                                ? "danger"
                                : "secondary"
                            }
                            className="px-3 py-2"
                            style={{ fontSize: "0.9rem" }}
                          >
                            {country.countryName || country.name || "N/A"}
                            {country.statusName && (
                              <span className="ms-2 opacity-75">
                                ({country.statusName})
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="services">
                  {loadingDetails.services ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2 text-muted">Đang tải dịch vụ...</p>
                    </div>
                  ) : (
                    <div>
                      {mentorServices.length > 0 ? (
                        <Table responsive hover>
                          <thead className="bg-light">
                            <tr>
                              <th>Tên dịch vụ</th>
                              <th>Mô tả</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mentorServices.map((service, index) => (
                              <tr key={index}>
                                <td className="fw-medium">
                                  {service.serviceName || service.name || "N/A"}
                                </td>
                                <td>{service.description || "N/A"}</td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <Badge
                                      bg={
                                        service.statusCode === "APPROVED"
                                          ? "success"
                                          : service.statusCode === "PENDING"
                                          ? "warning"
                                          : service.statusCode === "REJECTED"
                                          ? "danger"
                                          : "secondary"
                                      }
                                      className="small px-2 py-1"
                                    >
                                      {service.statusName || "N/A"}
                                    </Badge>
                                    {service.statusCode === "PENDING" && (
                                      <div className="d-flex gap-1">
                                        <Button
                                          variant="success"
                                          size="sm"
                                          onClick={() => handleApproveService(service.id)}
                                        >
                                          <FaCheck />
                                        </Button>
                                        <Button
                                          variant="danger"
                                          size="sm"
                                          onClick={() => handleRejectService(service.id)}
                                        >
                                          <FaTimes />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <div className="text-center py-4">
                          <FaBriefcase size={48} className="text-muted mb-3" />
                          <p className="text-muted">
                            Chưa có thông tin dịch vụ
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="education">
                  {loadingDetails.education ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2 text-muted">Đang tải học vấn...</p>
                    </div>
                  ) : mentorEducation.length === 0 ? (
                    <div className="text-center py-5">
                      <FaGraduationCap size={48} className="text-muted mb-3" />
                      <p className="text-muted mb-2">
                        Chưa có thông tin học vấn
                      </p>
                      <small className="text-muted">
                        Bằng cấp cao nhất:{" "}
                        <strong>
                          {selectedMentor.highestDegreeName || "Chưa cập nhật"}
                        </strong>
                      </small>
                    </div>
                  ) : (
                    <div>
                      {mentorEducation.map((edu, index) => (
                          <Card key={index} className="mb-3">
                            <Card.Body>
                              <Row>
                                <Col md={edu.certificateImage ? 6 : 8}>
                                  <h6 className="fw-bold mb-2">
                                    <FaGraduationCap className="me-2 text-primary" />
                                    {edu.degree || edu.schoolName || "N/A"}
                                  </h6>
                                  <p className="mb-1 fw-medium">
                                    {edu.institution || edu.major || "N/A"}
                                  </p>
                                  <p className="mb-1 text-muted">
                                    {edu.fieldOfStudy || edu.major || "N/A"}
                                  </p>
                                  {edu.description && (
                                    <p className="mb-0 text-muted small">
                                      {edu.description}
                                    </p>
                                  )}
                                </Col>
                                {edu.certificateImage && (
                                  <Col md={2} className="text-center">
                                    <div
                                      style={{
                                        cursor: "pointer",
                                        border: "2px solid #dee2e6",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        height: "100px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                      onClick={() =>
                                        openImage(edu.certificateImage)
                                      }
                                    >
                                      <img
                                        src={edu.certificateImage}
                                        alt="Certificate"
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                        }}
                                      />
                                    </div>
                                    <small className="text-muted d-block mt-1">
                                      Click để phóng to
                                    </small>
                                  </Col>
                                )}
                                <Col md={4} className="text-end">
                                  <div className="mb-1">
                                    <Badge
                                      bg="secondary"
                                      className="small px-2 py-1"
                                    >
                                      {edu.startDate && edu.endDate
                                        ? `${new Date(
                                            edu.startDate
                                          ).getFullYear()} - ${new Date(
                                            edu.endDate
                                          ).getFullYear()}`
                                        : "N/A"}
                                    </Badge>
                                    {edu.current && (
                                      <Badge
                                        bg="success"
                                        className="ms-2 small px-2 py-1"
                                      >
                                        Hiện tại
                                      </Badge>
                                    )}
                                  </div>
                                  {edu.statusCode && (
                                    <div className="d-flex flex-column gap-2">
                                      <Badge
                                        bg={
                                          edu.statusCode === "APPROVED"
                                            ? "success"
                                            : edu.statusCode === "PENDING"
                                            ? "warning"
                                            : "danger"
                                        }
                                        className="small px-2 py-1"
                                      >
                                        {edu.statusName || edu.status}
                                      </Badge>
                                      {edu.statusCode === "PENDING" && (
                                        <div className="d-flex gap-1">
                                          <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleApproveEducation(edu.id)}
                                          >
                                            <FaCheck /> Duyệt
                                          </Button>
                                          <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRejectEducation(edu.id)}
                                          >
                                            <FaTimes /> Từ chối
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                      ))}
                    </div>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="experience">
                  {loadingDetails.experience ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2 text-muted">Đang tải kinh nghiệm...</p>
                    </div>
                  ) : mentorExperience.length === 0 ? (
                    <div className="text-center py-5">
                      <FaBriefcase size={48} className="text-muted mb-3" />
                      <p className="text-muted mb-2">
                        Chưa có thông tin kinh nghiệm làm việc
                      </p>
                      <small className="text-muted">
                        Chức danh hiện tại:{" "}
                        <strong>
                          {selectedMentor.title || "Chưa cập nhật"}
                        </strong>
                      </small>
                    </div>
                  ) : (
                    <div>
                      {mentorExperience.map((exp, index) => (
                        <Card key={index} className="mb-3">
                          <Card.Body>
                            <Row>
                              <Col md={exp.experienceImage ? 6 : 8}>
                                <h6 className="fw-bold mb-2">
                                  <FaBriefcase className="me-2 text-success" />
                                  {exp.title || exp.position || "N/A"}
                                </h6>
                                <p className="mb-1 fw-medium">
                                  {exp.company || exp.companyName || "N/A"}
                                </p>
                                <p className="mb-1 text-muted">
                                  {exp.location || "N/A"}
                                </p>
                                {exp.description && (
                                  <p className="mb-0 text-muted small">
                                    {exp.description}
                                  </p>
                                )}
                              </Col>
                              {exp.experienceImage && (
                                <Col md={2} className="text-center">
                                  <div
                                    style={{
                                      cursor: "pointer",
                                      border: "2px solid #dee2e6",
                                      borderRadius: "8px",
                                      overflow: "hidden",
                                      height: "100px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                    onClick={() =>
                                      openImage(exp.experienceImage)
                                    }
                                  >
                                    <img
                                      src={exp.experienceImage}
                                      alt="Experience"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </div>
                                  <small className="text-muted d-block mt-1">
                                    Click để phóng to
                                  </small>
                                </Col>
                              )}
                              <Col md={4} className="text-end">
                                <div className="mb-1">
                                  <Badge
                                    bg="secondary"
                                    className="small px-2 py-1"
                                  >
                                    {exp.startDate && exp.endDate
                                      ? `${new Date(
                                          exp.startDate
                                        ).getFullYear()} - ${new Date(
                                          exp.endDate
                                        ).getFullYear()}`
                                      : "N/A"}
                                  </Badge>
                                  {exp.current && (
                                    <Badge
                                      bg="success"
                                      className="ms-2 small px-2 py-1"
                                    >
                                      Hiện tại
                                    </Badge>
                                  )}
                                </div>
                                {exp.statusCode && (
                                  <div className="d-flex flex-column gap-2">
                                    <Badge
                                      bg={
                                        exp.statusCode === "APPROVED"
                                          ? "success"
                                          : exp.statusCode === "PENDING"
                                          ? "warning"
                                          : "danger"
                                      }
                                      className="small px-2 py-1"
                                    >
                                      {exp.statusName || exp.status}
                                    </Badge>
                                    {exp.statusCode === "PENDING" && (
                                      <div className="d-flex gap-1">
                                        <Button
                                          variant="success"
                                          size="sm"
                                          onClick={() => handleApproveExperience(exp.id)}
                                        >
                                          <FaCheck /> Duyệt
                                        </Button>
                                        <Button
                                          variant="danger"
                                          size="sm"
                                          onClick={() => handleRejectExperience(exp.id)}
                                        >
                                          <FaTimes /> Từ chối
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="tests">
                  {loadingDetails.certificates ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2 text-muted">Đang tải chứng chỉ...</p>
                    </div>
                  ) : mentorCertificates.length === 0 ? (
                    <div className="text-center py-5">
                      <FaCertificate size={48} className="text-muted mb-3" />
                      <p className="text-muted">
                        Chưa có chứng chỉ hoặc bài test nào
                      </p>
                    </div>
                  ) : (
                    <div>
                      {mentorCertificates.map((cert, index) => {
                        const imageUrl = cert.credentialUrl || cert.scoreImage;
                        return (
                          <Card key={index} className="mb-3">
                            <Card.Body>
                              <Row>
                                <Col md={imageUrl ? 6 : 8}>
                                  <h6 className="fw-bold mb-2">
                                    <FaCertificate className="me-2 text-warning" />
                                    {cert.name || cert.testName || "N/A"}
                                  </h6>
                                  <p className="mb-1 text-muted small">
                                    <strong>Tổ chức:</strong>{" "}
                                    {cert.organization || "N/A"}
                                  </p>
                                  {cert.score && (
                                    <p className="mb-1 text-muted small">
                                      <strong>Điểm số:</strong> {cert.score}
                                    </p>
                                  )}
                                  <p className="mb-1 text-muted small">
                                    <strong>Ngày cấp:</strong>{" "}
                                    {cert.issueDate
                                      ? new Date(
                                          cert.issueDate
                                        ).toLocaleDateString("vi-VN")
                                      : "N/A"}
                                  </p>
                                  {cert.expiryDate && (
                                    <p className="mb-1 text-muted small">
                                      <strong>Ngày hết hạn:</strong>{" "}
                                      {new Date(
                                        cert.expiryDate
                                      ).toLocaleDateString("vi-VN")}
                                    </p>
                                  )}
                                  {cert.credentialId && (
                                    <p className="mb-1 text-muted small">
                                      <strong>ID:</strong> {cert.credentialId}
                                    </p>
                                  )}
                                </Col>
                                {imageUrl && (
                                  <Col md={2} className="text-center">
                                    <div
                                      style={{
                                        cursor: "pointer",
                                        border: "2px solid #dee2e6",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        height: "100px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                      onClick={() => openImage(imageUrl)}
                                    >
                                      <img
                                        src={imageUrl}
                                        alt="Certificate"
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                        }}
                                      />
                                    </div>
                                    <small className="text-muted d-block mt-1">
                                      Click để phóng to
                                    </small>
                                  </Col>
                                )}
                                <Col md={4} className="text-end">
                                  {cert.statusCode && (
                                    <div className="d-flex flex-column gap-2 align-items-end">
                                      <Badge
                                        bg={
                                          cert.statusCode === "APPROVED"
                                            ? "success"
                                            : cert.statusCode === "PENDING"
                                            ? "warning"
                                            : "danger"
                                        }
                                        className="small px-2 py-1"
                                      >
                                        {cert.statusName}
                                      </Badge>
                                      {cert.statusCode === "PENDING" && (
                                        <div className="d-flex gap-1">
                                          <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleApproveCertificate(cert.id)}
                                          >
                                            <FaCheck /> Duyệt
                                          </Button>
                                          <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRejectCertificate(cert.id)}
                                          >
                                            <FaTimes /> Từ chối
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </Tab.Pane>
              </Tab.Content>

              {selectedMentor.statusName &&
                selectedMentor.statusName.toUpperCase().includes("PENDING") && (
                  <Alert variant="warning" className="mt-3">
                    <strong>Đơn đăng ký đang chờ duyệt</strong>
                    <div className="mt-2">
                      <Button
                        variant="success"
                        className="me-2"
                        onClick={() => handleApproveMentor(selectedMentor.id)}
                      >
                        <FaCheck className="me-1" />
                        Phê duyệt
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleRejectMentor(selectedMentor.id)}
                      >
                        <FaTimes className="me-1" />
                        Từ chối
                      </Button>
                    </div>
                  </Alert>
                )}
            </Tab.Container>
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

export default MentorApproval;
