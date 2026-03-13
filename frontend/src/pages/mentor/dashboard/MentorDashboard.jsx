import React, { useEffect, useMemo, useState, useRef } from "react";
import { Nav, Badge, Dropdown, Spinner } from "react-bootstrap";
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
  const contentRef = useRef(null);

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

        const monthlyRes = await PaymentHistoryService.getMyMonthlyEarnings();
        const monthlyData = monthlyRes?.data?.data || monthlyRes?.data || monthlyRes || [];

        setEarnings({ ...(earningsData || {}), monthlyEarnings: monthlyData });
      } catch (err) {
        console.error("Error loading mentor dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Scroll to top khi switch tab
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

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
      {/* Compact User Menu in Top Right */}
      <div className="dashboard-top-bar">
        <div className="top-bar-container">
          <Dropdown align="end" className="user-menu-dropdown">
            <Dropdown.Toggle variant="link" className="user-menu-toggle">
              <img
                src={mentorData.avatar_url}
                alt={mentorData.fullname}
                className="user-avatar-small"
              />
              <span className="user-name-small">{mentorData.fullname}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={goToProfile}>
                <i className="bi bi-person me-2"></i>Xem hồ sơ
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <div className="dashboard-row">
        {/* Sidebar Navigation (compact, no profile card) */}
        <div className="sidebar-col">
          <div className="mentor-sidebar bare">
            <div className="mentor-nav-wrapper">
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
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="content-col">
          <div className="content-area" ref={contentRef}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : (
              <div className="tab-content">{renderTabContent()}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
