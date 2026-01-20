import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Button,
  Badge,
  Alert,
  Dropdown,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../../styles/components/MentorDashboard.css";

// Import components
import {
  MentorOverview,
  ScheduleManagementCRUD as ScheduleManagement,
  BookingManagement,
  ReviewManagement,
  ServiceManagement,
  MentorTestManagement,
  MentorEducationManagement,
  MentorExperienceManagement,
  ContentManagement,
  MyAdsManagement,
} from "../../../components/mentor/dashboard";
import { useAuth } from "../../../contexts";
import MentorService from "../../../services/mentor/MentorService";
import PaymentHistoryService from "../../../services/mentor/PaymentHistoryService";
import { colors } from "@mui/material";

const MentorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [mentor, setMentor] = useState(null);
  const [activity, setActivity] = useState(null);
  const [earnings, setEarnings] = useState(null);

  // Fetch mentor profile and activity for the logged-in mentor
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1) Get current mentor profile for reliable fullname, avatar, rating, booking count
        const profileRes = await MentorService.getCurrentMentorProfile();
        const profile = profileRes?.data || profileRes;
        setMentor(profile || null);

        // 2) Get activity lists (pending/confirmed/completed/cancelled)
        const act = await MentorService.getMentorActivity();
        const actData = act?.data || act;
        setActivity(actData || null);

        // 3) Get earnings data
        const earningsRes = await PaymentHistoryService.getMyEarnings();
        const earningsData = earningsRes?.data || earningsRes;
        setEarnings(earningsData || null);
      } catch (err) {
        console.error("Error loading mentor dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Compose statistics for the top cards
  const mentorData = useMemo(() => {
    const rating = mentor?.rating ?? mentor?.averageRating ?? 0;
    const numberOfBooking =
      mentor?.numberOfBooking ?? mentor?.bookingsCount ?? 0;
    const fullname =
      mentor?.fullname || mentor?.name || user?.email || "Mentor";
    const avatarUrl =
      mentor?.avatarUrl || mentor?.avatar_url || "/images/default-avatar.svg";

    const completedCount = activity?.completed?.length || 0;
    const pendingCount = activity?.pending?.length || 0;

    return {
      fullname,
      title: mentor?.title || mentor?.jobTitle || "",
      avatar_url: avatarUrl,
      rating: Number(rating) || 0,
      number_of_booking: Number(numberOfBooking) || 0,
      totalEarnings: earnings?.totalEarnings || 0,
      platformCommission: earnings?.platformCommission || 0,
      netEarnings: earnings?.netEarnings || 0,
      pendingBookings: pendingCount,
      completedBookings: completedCount,
      upcomingSessions: activity?.confirmed?.length || 0,
    };
  }, [mentor, activity, earnings, user]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <MentorOverview mentorData={mentorData} />;
      case "schedule":
        return <ScheduleManagement />;
      case "bookings":
        return <BookingManagement />;
      case "reviews":
        return <ReviewManagement />;
      case "services":
        return <ServiceManagement />;
      case "tests":
        return <MentorTestManagement />;
      case "educations":
        return <MentorEducationManagement />;
      case "experiences":
        return <MentorExperienceManagement />;
      case "ads":
        return <MyAdsManagement />;
      case "content":
        return <ContentManagement />;
      default:
        return <MentorOverview mentorData={mentorData} />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const goToProfile = () => {
    navigate("/mentor/profile");
  };

  return (
    <div className="mentor-dashboard">
      <Container fluid>
        <Row>
          {/* Sidebar Navigation */}
          <Col lg={3} md={4} className="sidebar-col">
            <Card className="mentor-sidebar">
              <Card.Body>
                {/* Mentor Profile Summary */}
                <div className="mentor-profile-summary text-center mb-4">
                  <div className="avatar-container mb-3">
                    <img
                      src={mentorData.avatar_url}
                      alt={mentorData.fullname}
                      className="mentor-avatar"
                    />
                    <div className="status-indicator online"></div>
                  </div>
                  <h5 className="mentor-name">{mentorData.fullname}</h5>
                  {mentorData.title && (
                    <p className="mentor-title text-muted">
                      {mentorData.title}
                    </p>
                  )}
                  <div className="rating-info">
                    <span className="rating-score">
                      <i className="bi bi-star-fill text-warning"></i>
                      {mentorData.rating}
                    </span>
                    <span className="text-muted ms-2">
                      ({mentorData.number_of_booking} lượt đặt lịch)
                    </span>
                  </div>
                </div>

                {/* Navigation Menu */}
                <Nav variant="pills" className="flex-column mentor-nav">
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "overview"}
                      onClick={() => setActiveTab("overview")}
                      className="mentor-nav-link"
                    >
                      <i className="bi bi-speedometer2 me-2"></i>
                      <span style={{ color: "black" }}>Tổng quan</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "schedule"}
                      onClick={() => setActiveTab("schedule")}
                      className="mentor-nav-link"
                    >
                      <i className="bi bi-calendar-check me-2"></i>
                      <span style={{ color: "black" }}>Lịch làm việc</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "bookings"}
                      onClick={() => setActiveTab("bookings")}
                      className="mentor-nav-link"
                    >
                      <i className="bi bi-journal-bookmark me-2"></i>
                      <span style={{ color: "black" }}>Quản lý lịch</span>
                      {mentorData.pendingBookings > 0 && (
                        <Badge bg="danger" className="ms-2">
                          {mentorData.pendingBookings}
                        </Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>

                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "reviews"}
                      onClick={() => setActiveTab("reviews")}
                      className="mentor-nav-link"
                    >
                      <i className="bi bi-star me-2"></i>
                      <span style={{ color: "black" }}>Đánh giá</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "services"}
                      onClick={() => setActiveTab("services")}
                      className="mentor-nav-link"
                    >
                      <i className="bi bi-gear me-2"></i>
                      <span style={{ color: "black" }}>Dịch vụ</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "tests"}
                      onClick={() => setActiveTab("tests")}
                      className="mentor-nav-link"
                    >
                      <i className="bi bi-file-earmark-text me-2"></i>
                      <span style={{ color: "black" }}>Bài test</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "educations"}
                      onClick={() => setActiveTab("educations")}
                      className="mentor-nav-link"
                    >
                      <i className="bi bi-mortarboard me-2"></i>
                      <span style={{ color: "black" }}>Học vấn</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "experiences"}
                      onClick={() => setActiveTab("experiences")}
                      className="mentor-nav-link"
                    >
                      <i className="bi bi-briefcase me-2"></i>
                      <span style={{ color: "black" }}>Kinh nghiệm</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "ads"}
                      onClick={() => setActiveTab("ads")}
                      className="mentor-nav-link"
                    >
                      <i className="bi bi-badge-ad me-2"></i>
                      <span style={{ color: "black" }}>Quảng cáo</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link
                      active={activeTab === "content"}
                      onClick={() => setActiveTab("content")}
                      className="mentor-nav-link"
                    >
                      <i className="bi bi-pencil-square me-2"></i>
                      <span style={{ color: "black" }}>Nội dung</span>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content */}
          <Col lg={9} md={8}>
            <div className="dashboard-header mb-4">
              <Row className="align-items-center">
                <Col>
                  <h2 className="dashboard-title mb-0">Dashboard Mentor</h2>
                  <p className="text-muted">
                    Chào mừng trở lại, {mentorData.fullname}!
                  </p>
                </Col>
                <Col xs="auto" className="d-flex align-items-center gap-2">
                  <Button variant="primary">
                    <i className="bi bi-bell me-2"></i>
                    Thông báo
                    <Badge bg="danger" className="ms-2">
                      3
                    </Badge>
                  </Button>
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="outline-light"
                      className="user-menu-toggle"
                    >
                      <i className="bi bi-person-circle me-2"></i>
                      {user?.email || "Tài khoản"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={goToProfile}>
                        <i className="bi bi-person me-2"></i>Hồ sơ
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : (
              <div className="tab-content">{renderTabContent()}</div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MentorDashboard;
