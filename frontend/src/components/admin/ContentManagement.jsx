import React, { useState, useEffect, useRef } from "react";
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
  Pagination,
  Nav,
  Tab,
  Alert,
  Spinner,
  Dropdown,
} from "react-bootstrap";
import {
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaEdit,
  FaBlog,
  FaUser,
  FaClock,
  FaChartLine,
  FaTrash,
  FaEyeSlash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Editor } from "@tinymce/tinymce-react";
import {
  getAllBlogs,
  moderateBlog,
  deleteBlog,
  togglePublishStatus,
} from "../../services/blog";
import {
  getAllFaqsForAdmin,
  togglePublishFaq,
  deleteFaq,
  updateFaq,
} from "../../services/faq";
import { useToast } from "../../contexts/ToastContext";

const ContentManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [faqSearchTerm, setFaqSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [faqFilterStatus, setFaqFilterStatus] = useState("all");
  const [blogs, setBlogs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    views: 0,
  });
  const [loading, setLoading] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [faqPagination, setFaqPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const { showToast } = useToast();

  // Selection state for bulk actions (Blogs & FAQs)
  const [selectedBlogIds, setSelectedBlogIds] = useState(new Set());
  const [selectedFaqIds, setSelectedFaqIds] = useState(new Set());
  const blogHeaderCheckboxRef = useRef(null);
  const faqHeaderCheckboxRef = useRef(null);

  // Fetch blogs from API
  useEffect(() => {
    console.log(
      "Fetching blogs - page:",
      pagination.page,
      "filter:",
      filterStatus,
      "search:",
      searchTerm
    );
    fetchBlogs();
  }, [filterStatus, pagination.page, searchTerm]);

  // Fetch FAQs from API
  useEffect(() => {
    console.log(
      "Fetching FAQs - page:",
      faqPagination.page,
      "filter:",
      faqFilterStatus,
      "search:",
      faqSearchTerm
    );
    fetchFaqs();
  }, [faqPagination.page, faqFilterStatus, faqSearchTerm]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        keyword: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      };

      const response = await getAllBlogs(params);

      if (response.respCode === "0" || response.success) {
        const data = response.data;
        const blogsList = data.blogs || [];
        setBlogs(blogsList);
        setPagination((prev) => ({
          ...prev,
          page: data.pageNumber || 0,
          size: data.pageSize || 10,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
        }));
      }
    } catch (error) {
      showToast("Không thể tải danh sách bài viết", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchFaqs = async () => {
    try {
      setFaqLoading(true);
      const params = {
        page: faqPagination.page,
        size: faqPagination.size,
        keyword: faqSearchTerm || undefined,
        published:
          faqFilterStatus !== "all"
            ? faqFilterStatus === "published"
            : undefined,
        sort: "createdAt,desc",
      };

      const response = await getAllFaqsForAdmin(params);

      if (response.respCode === "0" || response.success) {
        const data = response.data;
        const faqsList = data.content || [];
        setFaqs(faqsList);
        setFaqPagination((prev) => ({
          ...prev,
          page: data.pageNumber ?? data.number ?? prev.page ?? 0,
          size: data.pageSize ?? prev.size ?? 10,
          totalPages: data.totalPages ?? 0,
          totalElements: data.totalElements ?? 0,
        }));
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        showToast("Không thể tải danh sách FAQ", "error");
      } else {
        console.log("No FAQs found or endpoint not available");
      }
      setFaqs([]);
      setFaqStats({ total: 0, published: 0 });
    } finally {
      setFaqLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "APPROVED":
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
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      default:
        return status;
    }
  };

  const handleViewBlog = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  const handleApproveBlog = async (blogId) => {
    try {
      const response = await moderateBlog(blogId, {
        decisionId: 4,
        comment: "Đã duyệt bởi admin",
      });
      if (response.respCode === "0" || response.success) {
        showToast("Đã duyệt bài viết thành công", "success");
        fetchBlogs();
        if (selectedBlog?.id === blogId) {
          setShowModal(false);
        }
      } else {
        showToast(
          "Không thể duyệt bài viết: " +
            (response.description || "Unknown error"),
          "error"
        );
      }
    } catch (error) {
      showToast(
        error.description || error.message || "Không thể duyệt bài viết",
        "error"
      );
    }
  };

  const handleRejectBlog = async (
    blogId,
    reason = "Không đáp ứng tiêu chuẩn"
  ) => {
    try {
      const response = await moderateBlog(blogId, {
        decisionId: 5,
        comment: reason,
      });
      console.log("Reject response:", response);

      if (response.respCode === "0" || response.success) {
        showToast("Đã từ chối bài viết", "success");
        fetchBlogs();
        if (selectedBlog?.id === blogId) {
          setShowModal(false);
        }
      } else {
        showToast(
          "Không thể từ chối bài viết: " +
            (response.description || "Unknown error"),
          "error"
        );
      }
    } catch (error) {
      showToast(
        error.description || error.message || "Không thể từ chối bài viết",
        "error"
      );
    }
  };

  const handleTogglePublish = async (blogId) => {
    try {
      const response = await togglePublishStatus(blogId);

      if (response.respCode === "0" || response.success) {
        showToast("Đã thay đổi trạng thái xuất bản", "success");
        fetchBlogs();
      } else {
        showToast(
          "Không thể thay đổi trạng thái: " +
            (response.description || "Unknown error"),
          "error"
        );
      }
    } catch (error) {
      showToast(
        error.description || error.message || "Không thể thay đổi trạng thái",
        "error"
      );
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      return;
    }

    try {
      const response = await deleteBlog(blogId);
      if (response.respCode === "0" || response.success) {
        showToast("Đã xóa bài viết", "success");
        fetchBlogs();
      }
    } catch (error) {
      showToast(
        error.description || error.message || "Không thể xóa bài viết",
        "error"
      );
    }
  };

  // Pagination helper: page argument is 1-based
  const handlePageChange = (page) => {
    if (typeof page !== "number") return;
    const total = pagination.totalPages || 1;
    let next = page;
    if (next < 1) next = 1;
    if (next > total) next = total;
    setPagination((prev) => ({ ...prev, page: next - 1 }));
  };

  // FAQ pagination helper: page argument is 1-based
  const handleFaqPageChange = (page) => {
    if (typeof page !== "number") return;
    const total = faqPagination.totalPages || 1;
    let next = page;
    if (next < 1) next = 1;
    if (next > total) next = total;
    setFaqPagination((prev) => ({ ...prev, page: next - 1 }));
  };

  // ===== Bulk selection helpers for Blogs =====
  const blogIdsOnPage = blogs.map((b) => b.id);
  const allBlogsSelectedOnPage =
    blogIdsOnPage.length > 0 &&
    blogIdsOnPage.every((id) => selectedBlogIds.has(id));
  const someBlogsSelectedOnPage =
    blogIdsOnPage.some((id) => selectedBlogIds.has(id)) &&
    !allBlogsSelectedOnPage;

  useEffect(() => {
    if (blogHeaderCheckboxRef.current) {
      blogHeaderCheckboxRef.current.indeterminate = someBlogsSelectedOnPage;
    }
  }, [someBlogsSelectedOnPage]);

  const toggleSelectBlog = (id) => {
    setSelectedBlogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllBlogsCurrentPage = () => {
    setSelectedBlogIds((prev) => {
      const next = new Set(prev);
      if (allBlogsSelectedOnPage) {
        blogIdsOnPage.forEach((id) => next.delete(id));
      } else {
        blogIdsOnPage.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleDeleteSelectedBlogs = async () => {
    const count = selectedBlogIds.size;
    if (count === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${count} bài viết đã chọn?`))
      return;
    try {
      const ids = Array.from(selectedBlogIds);
      const results = await Promise.allSettled(ids.map((id) => deleteBlog(id)));
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        showToast(
          `Một số bài viết không thể xóa (${failed.length}/${ids.length}).`,
          "warning"
        );
      } else {
        showToast("Đã xóa các bài viết đã chọn", "success");
      }
      setSelectedBlogIds(new Set());
      await fetchBlogs();
    } catch (err) {
      showToast("Có lỗi khi xóa nhiều bài viết", "error");
    }
  };

  const handleViewFaq = (faq) => {
    setSelectedFaq(faq);
    setShowFAQModal(true);
  };

  const handleTogglePublishFaq = async (faqId, currentStatus) => {
    try {
      const response = await togglePublishFaq(faqId, !currentStatus);
      if (response.respCode === "0" || response.success) {
        showToast(!currentStatus ? "Đã xuất bản FAQ" : "Đã ẩn FAQ", "success");
        fetchFaqs();
      }
    } catch (error) {
      showToast(error.description || "Không thể thay đổi trạng thái", "error");
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa FAQ này?")) {
      return;
    }

    try {
      const response = await deleteFaq(faqId);
      if (response.respCode === "0" || response.success) {
        showToast("Đã xóa FAQ", "success");
        fetchFaqs();
      }
    } catch (error) {
      showToast(error.description || "Không thể xóa FAQ", "error");
    }
  };

  // ===== Bulk selection helpers for FAQs =====
  const faqIdsOnPage = faqs.map((f) => f.id);
  const allFaqsSelectedOnPage =
    faqIdsOnPage.length > 0 &&
    faqIdsOnPage.every((id) => selectedFaqIds.has(id));
  const someFaqsSelectedOnPage =
    faqIdsOnPage.some((id) => selectedFaqIds.has(id)) && !allFaqsSelectedOnPage;

  useEffect(() => {
    if (faqHeaderCheckboxRef.current) {
      faqHeaderCheckboxRef.current.indeterminate = someFaqsSelectedOnPage;
    }
  }, [someFaqsSelectedOnPage]);

  const toggleSelectFaq = (id) => {
    setSelectedFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFaqsCurrentPage = () => {
    setSelectedFaqIds((prev) => {
      const next = new Set(prev);
      if (allFaqsSelectedOnPage) {
        faqIdsOnPage.forEach((id) => next.delete(id));
      } else {
        faqIdsOnPage.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleDeleteSelectedFaqs = async () => {
    const count = selectedFaqIds.size;
    if (count === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${count} FAQ đã chọn?`))
      return;
    try {
      const ids = Array.from(selectedFaqIds);
      const results = await Promise.allSettled(ids.map((id) => deleteFaq(id)));
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        showToast(
          `Một số FAQ không thể xóa (${failed.length}/${ids.length}).`,
          "warning"
        );
      } else {
        showToast("Đã xóa các FAQ đã chọn", "success");
      }
      setSelectedFaqIds(new Set());
      await fetchFaqs();
    } catch (err) {
      showToast("Có lỗi khi xóa nhiều FAQ", "error");
    }
  };

  // UI-friendly pagination object (1-based currentPage)
  const uiPagination = {
    currentPage: pagination.page + 1,
    pageSize: pagination.size,
    totalElements: pagination.totalElements,
    totalPages: pagination.totalPages || 1,
  };

  const uiFaqPagination = {
    currentPage: faqPagination.page + 1,
    pageSize: faqPagination.size,
    totalElements: faqPagination.totalElements,
    totalPages: faqPagination.totalPages || 1,
  };

  return (
    <div className="content-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Quản lý nội dung</h4>
        </div>
      </div>

      <Tab.Container defaultActiveKey="blogs">
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="blogs">Bài viết Blog</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="faq">FAQ & Hướng dẫn</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="blogs">
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
                        placeholder="Tìm theo tiêu đề hoặc tác giả..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setPagination((prev) => ({ ...prev, page: 0 }));
                        }}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setPagination((prev) => ({ ...prev, page: 0 }));
                      }}
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

            {/* Blogs Table */}
            <Card>
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    Danh sách bài viết ({pagination.totalElements})
                  </h6>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={handleSelectAllBlogsCurrentPage}
                      disabled={blogs.length === 0}
                    >
                      Chọn tất cả
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleDeleteSelectedBlogs}
                      disabled={selectedBlogIds.size === 0}
                    >
                      Xóa đã chọn{" "}
                      {selectedBlogIds.size > 0
                        ? `(${selectedBlogIds.size})`
                        : ""}
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
                ) : blogs.length === 0 ? (
                  <div className="text-center py-5">
                    <FaBlog size={48} className="text-muted mb-3" />
                    <p className="text-muted">Không có bài viết nào</p>
                  </div>
                ) : (
                  <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th width="4%">
                          <Form.Check
                            type="checkbox"
                            checked={allBlogsSelectedOnPage}
                            onChange={handleSelectAllBlogsCurrentPage}
                            ref={blogHeaderCheckboxRef}
                          />
                        </th>
                        <th width="30%">Tiêu đề</th>
                        <th width="20%">Tác giả</th>
                        <th width="12%">Trạng thái</th>
                        <th width="8%">Xuất bản</th>
                        <th width="8%">Lượt xem</th>
                        <th width="13%">Ngày tạo</th>
                        <th width="5%">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map((blog) => (
                        <tr key={blog.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedBlogIds.has(blog.id)}
                              onChange={() => toggleSelectBlog(blog.id)}
                            />
                          </td>
                          <td>
                            <div>
                              <div className="fw-medium">{blog.title}</div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaUser className="me-2 text-muted" />
                              <span>
                                {blog.authorName || blog.author || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <Badge
                              bg={getStatusBadgeVariant(
                                blog.statusName || blog.status
                              )}
                            >
                              {getStatusText(blog.statusName || blog.status)}
                            </Badge>
                          </td>
                          <td className="text-center">
                            {blog.isPublished ? (
                              <Badge
                                bg="success"
                                className="d-flex align-items-center justify-content-center gap-1"
                                style={{ width: "fit-content" }}
                              >
                                <FaEye size={10} /> Hiện
                              </Badge>
                            ) : (
                              <Badge
                                bg="secondary"
                                className="d-flex align-items-center justify-content-center gap-1"
                                style={{ width: "fit-content" }}
                              >
                                <FaEyeSlash size={10} /> Ẩn
                              </Badge>
                            )}
                          </td>
                          <td>
                            <span className="text-muted">
                              {(blog.viewCount || 0).toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <span className="text-muted">
                              {blog.createdAt
                                ? new Date(blog.createdAt).toLocaleDateString(
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
                                aria-label="Thao tác"
                                className="no-caret"
                              >
                                <BsThreeDotsVertical />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => handleViewBlog(blog)}
                                >
                                  Xem
                                </Dropdown.Item>
                                {(blog.statusName === "PENDING" ||
                                  blog.status === "PENDING") && (
                                  <>
                                    <Dropdown.Item
                                      onClick={() => handleApproveBlog(blog.id)}
                                    >
                                      Duyệt
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      onClick={() => handleRejectBlog(blog.id)}
                                    >
                                      Từ chối
                                    </Dropdown.Item>
                                  </>
                                )}
                                {(blog.statusName === "APPROVED" ||
                                  blog.status === "APPROVED") && (
                                  <Dropdown.Item
                                    onClick={() => handleTogglePublish(blog.id)}
                                  >
                                    {blog.isPublished
                                      ? "Ẩn bài viết"
                                      : "Hiển thị bài viết"}
                                  </Dropdown.Item>
                                )}
                                <Dropdown.Item
                                  onClick={() => handleDeleteBlog(blog.id)}
                                  className="text-danger"
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

              {/* Pagination (blogs) - render only when we have data and not loading */}
              {!loading && blogs.length > 0 && (
                <Card.Footer className="bg-white border-top">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="text-muted small">
                      Hiển thị{" "}
                      <strong>
                        {(uiPagination.currentPage - 1) *
                          uiPagination.pageSize +
                          1}
                      </strong>{" "}
                      -{" "}
                      <strong>
                        {Math.min(
                          uiPagination.currentPage * uiPagination.pageSize,
                          uiPagination.totalElements
                        )}
                      </strong>{" "}
                      trong tổng số{" "}
                      <strong>{uiPagination.totalElements}</strong> bài viết
                    </div>
                    <Pagination className="mb-0" size="sm">
                      <Pagination.Prev
                        onClick={() =>
                          handlePageChange(uiPagination.currentPage - 1)
                        }
                        disabled={uiPagination.currentPage === 1}
                      />

                      {(() => {
                        const items = [];
                        const total = uiPagination.totalPages;
                        const current = uiPagination.currentPage;
                        const maxVisible = 5;

                        if (total <= maxVisible) {
                          for (let i = 1; i <= total; i++) {
                            items.push(
                              <Pagination.Item
                                key={i}
                                active={i === current}
                                onClick={() => handlePageChange(i)}
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
                              onClick={() => handlePageChange(1)}
                            >
                              1
                            </Pagination.Item>
                          );

                          let startPage = Math.max(2, current - 1);
                          let endPage = Math.min(total - 1, current + 1);

                          if (startPage > 2) {
                            items.push(
                              <Pagination.Ellipsis
                                key="ellipsis-start"
                                disabled
                              />
                            );
                            startPage = Math.max(startPage, current - 1);
                          }

                          for (let i = startPage; i <= endPage; i++) {
                            items.push(
                              <Pagination.Item
                                key={i}
                                active={i === current}
                                onClick={() => handlePageChange(i)}
                              >
                                {i}
                              </Pagination.Item>
                            );
                          }

                          if (endPage < total - 1) {
                            items.push(
                              <Pagination.Ellipsis
                                key="ellipsis-end"
                                disabled
                              />
                            );
                          }
                          items.push(
                            <Pagination.Item
                              key={total}
                              active={total === current}
                              onClick={() => handlePageChange(total)}
                            >
                              {total}
                            </Pagination.Item>
                          );
                        }

                        return items;
                      })()}

                      <Pagination.Next
                        onClick={() =>
                          handlePageChange(uiPagination.currentPage + 1)
                        }
                        disabled={
                          uiPagination.currentPage === uiPagination.totalPages
                        }
                      />
                    </Pagination>
                  </div>
                </Card.Footer>
              )}
            </Card>
          </Tab.Pane>

          {/* FAQ Management Tab */}
          <Tab.Pane eventKey="faq">
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
                        placeholder="Tìm theo câu hỏi..."
                        value={faqSearchTerm}
                        onChange={(e) => {
                          setFaqSearchTerm(e.target.value);
                          setFaqPagination((prev) => ({ ...prev, page: 0 }));
                        }}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={faqFilterStatus}
                      onChange={(e) => {
                        setFaqFilterStatus(e.target.value);
                        setFaqPagination((prev) => ({ ...prev, page: 0 }));
                      }}
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="published">Đã xuất bản</option>
                      <option value="unpublished">Chưa xuất bản</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Danh sách FAQ</h6>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={handleSelectAllFaqsCurrentPage}
                      disabled={faqs.length === 0}
                    >
                      Chọn tất cả
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleDeleteSelectedFaqs}
                      disabled={selectedFaqIds.size === 0}
                    >
                      Xóa đã chọn{" "}
                      {selectedFaqIds.size > 0
                        ? `(${selectedFaqIds.size})`
                        : ""}
                    </Button>
                    {/* <Button variant="primary" size="sm" disabled>
                                            <FaEdit className="me-1" />
                                            Thêm FAQ mới
                                        </Button> */}
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {faqLoading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                  </div>
                ) : faqs.length === 0 ? (
                  <div className="text-center py-5">
                    <FaBlog size={48} className="text-muted mb-3" />
                    <p className="text-muted">Không có FAQ nào</p>
                  </div>
                ) : (
                  <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th width="4%">
                          <Form.Check
                            type="checkbox"
                            checked={allFaqsSelectedOnPage}
                            onChange={handleSelectAllFaqsCurrentPage}
                            ref={faqHeaderCheckboxRef}
                          />
                        </th>
                        <th width="42%">Câu hỏi</th>
                        <th width="14%">Mức độ</th>
                        <th width="10%">Trạng thái</th>
                        <th width="10%">Lượt xem</th>
                        <th width="10%">Ngày tạo</th>
                        <th width="8%">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faqs.map((faq) => (
                        <tr key={faq.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedFaqIds.has(faq.id)}
                              onChange={() => toggleSelectFaq(faq.id)}
                            />
                          </td>
                          <td>
                            <div>
                              <div className="fw-medium">{faq.question}</div>
                              {/* {faq.answer && (
                                                                <small className="text-muted">
                                                                    {faq.answer.substring(0, 50)}...
                                                                </small>
                                                            )} */}
                            </div>
                          </td>
                          <td>
                            <Badge
                              bg={
                                faq.urgency === "HIGH"
                                  ? "danger"
                                  : faq.urgency === "MEDIUM"
                                  ? "warning"
                                  : "info"
                              }
                            >
                              {faq.urgency === "HIGH"
                                ? "Cao"
                                : faq.urgency === "MEDIUM"
                                ? "Trung bình"
                                : "Thấp"}
                            </Badge>
                          </td>
                          <td>
                            {faq.published ? (
                              <Badge
                                bg="success"
                                className="d-flex align-items-center justify-content-center gap-1"
                                style={{ width: "fit-content" }}
                              >
                                <FaEye size={10} /> Hiện
                              </Badge>
                            ) : (
                              <Badge
                                bg="secondary"
                                className="d-flex align-items-center justify-content-center gap-1"
                                style={{ width: "fit-content" }}
                              >
                                <FaEyeSlash size={10} /> Ẩn
                              </Badge>
                            )}
                          </td>
                          <td className="text-center">
                            <span className="text-muted">
                              {(faq.viewCount || 0).toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <span className="text-muted">
                              {faq.createdAt
                                ? new Date(faq.createdAt).toLocaleDateString(
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
                                aria-label="Thao tác"
                                className="no-caret"
                              >
                                <BsThreeDotsVertical />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => handleViewFaq(faq)}
                                >
                                  Xem
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() =>
                                    handleTogglePublishFaq(
                                      faq.id,
                                      faq.published
                                    )
                                  }
                                >
                                  {faq.published ? "Ẩn FAQ" : "Hiển thị FAQ"}
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => handleDeleteFaq(faq.id)}
                                  className="text-danger"
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
              {!faqLoading && faqs.length > 0 && (
                <Card.Footer className="bg-light">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="text-muted small">
                      Hiển thị{" "}
                      <strong>
                        {(uiFaqPagination.currentPage - 1) *
                          uiFaqPagination.pageSize +
                          1}
                      </strong>{" "}
                      -{" "}
                      <strong>
                        {Math.min(
                          uiFaqPagination.currentPage *
                            uiFaqPagination.pageSize,
                          uiFaqPagination.totalElements
                        )}
                      </strong>{" "}
                      trong tổng số{" "}
                      <strong>{uiFaqPagination.totalElements}</strong> FAQ
                    </div>
                    <Pagination className="mb-0" size="sm">
                      <Pagination.Prev
                        onClick={() =>
                          handleFaqPageChange(uiFaqPagination.currentPage - 1)
                        }
                        disabled={uiFaqPagination.currentPage === 1}
                      />

                      {(() => {
                        const items = [];
                        const total = uiFaqPagination.totalPages;
                        const current = uiFaqPagination.currentPage;
                        const maxVisible = 5;

                        if (total <= maxVisible) {
                          for (let i = 1; i <= total; i++) {
                            items.push(
                              <Pagination.Item
                                key={i}
                                active={i === current}
                                onClick={() => handleFaqPageChange(i)}
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
                              onClick={() => handleFaqPageChange(1)}
                            >
                              1
                            </Pagination.Item>
                          );

                          let startPage = Math.max(2, current - 1);
                          let endPage = Math.min(total - 1, current + 1);

                          if (startPage > 2) {
                            items.push(
                              <Pagination.Ellipsis
                                key="faq-ellipsis-start"
                                disabled
                              />
                            );
                            startPage = Math.max(startPage, current - 1);
                          }

                          for (let i = startPage; i <= endPage; i++) {
                            items.push(
                              <Pagination.Item
                                key={`faq-${i}`}
                                active={i === current}
                                onClick={() => handleFaqPageChange(i)}
                              >
                                {i}
                              </Pagination.Item>
                            );
                          }

                          if (endPage < total - 1) {
                            items.push(
                              <Pagination.Ellipsis
                                key="faq-ellipsis-end"
                                disabled
                              />
                            );
                          }
                          items.push(
                            <Pagination.Item
                              key={`faq-${total}`}
                              active={total === current}
                              onClick={() => handleFaqPageChange(total)}
                            >
                              {total}
                            </Pagination.Item>
                          );
                        }

                        return items;
                      })()}

                      <Pagination.Next
                        onClick={() =>
                          handleFaqPageChange(uiFaqPagination.currentPage + 1)
                        }
                        disabled={
                          uiFaqPagination.currentPage ===
                          uiFaqPagination.totalPages
                        }
                      />
                    </Pagination>
                  </div>
                </Card.Footer>
              )}
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Blog Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết bài viết</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBlog && (
            <div>
              <Row className="mb-3">
                <Col>
                  <h5>{selectedBlog.title}</h5>
                  <div className="d-flex gap-3 text-muted mb-3">
                    <span>
                      <FaUser className="me-1" />
                      {selectedBlog.author}
                    </span>
                    <span>
                      <FaClock className="me-1" />
                      {selectedBlog.createdAt}
                    </span>
                    <span>
                      <FaChartLine className="me-1" />
                      {selectedBlog.viewCount} lượt xem
                    </span>
                  </div>
                  <Badge
                    bg={getStatusBadgeVariant(
                      selectedBlog.statusName || selectedBlog.status
                    )}
                    className="mb-3"
                  >
                    {getStatusText(
                      selectedBlog.statusName || selectedBlog.status
                    )}
                  </Badge>
                </Col>
              </Row>

              <div className="blog-content">
                <h6>Nội dung:</h6>
                <div className="border rounded">
                  <Editor
                    value={selectedBlog.content}
                    init={{
                      height: 400,
                      menubar: false,
                      toolbar: false,
                      statusbar: false,
                      readonly: true,
                      inline: false,
                      content_style:
                        'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px; padding: 10px; }',
                    }}
                    disabled={true}
                  />
                </div>
              </div>

              {(selectedBlog.statusName === "PENDING" ||
                selectedBlog.status === "PENDING") && (
                <Alert variant="warning" className="mt-3">
                  <strong>Bài viết đang chờ duyệt</strong>
                  <div className="mt-2">
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleApproveBlog(selectedBlog.id)}
                    >
                      <FaCheck className="me-1" />
                      Duyệt bài viết
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejectBlog(selectedBlog.id)}
                    >
                      <FaTimes className="me-1" />
                      Từ chối
                    </Button>
                  </div>
                </Alert>
              )}
              {(selectedBlog.statusName === "REJECTED" ||
                selectedBlog.status === "REJECTED") && (
                <Alert variant="danger" className="mt-3">
                  <strong>Bài viết đã bị từ chối</strong>
                </Alert>
              )}
              {(selectedBlog.statusName === "APPROVED" ||
                selectedBlog.status === "APPROVED") && (
                <Alert variant="success" className="mt-3">
                  <strong>Bài viết đã được duyệt</strong>
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          <Button variant="primary">Chỉnh sửa</Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showFAQModal}
        onHide={() => {
          setShowFAQModal(false);
          setSelectedFaq(null);
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết FAQ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFaq ? (
            <div>
              <Row className="mb-3">
                <Col>
                  <h5>{selectedFaq.question}</h5>
                  <div className="d-flex gap-3 text-muted mb-3">
                    <span>
                      <FaClock className="me-1" />
                      {selectedFaq.createdAt
                        ? new Date(selectedFaq.createdAt).toLocaleString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </span>
                    <span>
                      <FaChartLine className="me-1" />
                      {(selectedFaq.viewCount || 0).toLocaleString()} lượt xem
                    </span>
                  </div>
                  <div className="d-flex gap-2 mb-3">
                    <Badge
                      bg={
                        selectedFaq.urgency === "HIGH"
                          ? "danger"
                          : selectedFaq.urgency === "MEDIUM"
                          ? "warning"
                          : "info"
                      }
                    >
                      Mức độ:{" "}
                      {selectedFaq.urgency === "HIGH"
                        ? "Cao"
                        : selectedFaq.urgency === "MEDIUM"
                        ? "Trung bình"
                        : "Thấp"}
                    </Badge>
                    {/* <Badge bg={selectedFaq.isPublished ? 'success' : 'secondary'}>
                                            {selectedFaq.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
                                        </Badge> */}
                  </div>
                </Col>
              </Row>

              {selectedFaq.answer ? (
                <div className="faq-answer">
                  <h6>Câu trả lời:</h6>
                  <div
                    className="p-3 bg-light rounded"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {selectedFaq.answer}
                  </div>
                </div>
              ) : (
                <Alert variant="warning">
                  <strong>Chưa có câu trả lời</strong>
                  <p className="mb-0 mt-2">
                    FAQ này chưa được trả lời. Vui lòng thêm câu trả lời.
                  </p>
                </Alert>
              )}
            </div>
          ) : (
            <Alert variant="info">
              <strong>Lưu ý:</strong> Chức năng quản lý FAQ đang trong quá trình
              phát triển.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowFAQModal(false);
              setSelectedFaq(null);
            }}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ContentManagement;
