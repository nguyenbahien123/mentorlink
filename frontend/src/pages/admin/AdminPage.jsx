import React, { useState, useEffect, lazy, Suspense } from "react";
import { Container, Row, Col, Card, Nav, Tab, Alert, Spinner } from "react-bootstrap";
import {
  FaUsers,
  FaBlog,
  FaUserCog,
  FaChartBar,
  FaCalendarAlt,
  FaHistory,
  FaCommentDots,
  FaBullhorn,
  FaCog,
  FaShieldAlt,
  FaGlobeAmericas,
  FaFileAlt,
  FaAd,
} from "react-icons/fa";
import { AdminSidebar, PolicyManagement, MentorAdManagement } from "../../components/admin";
import {
  getAllUsers,
  getUserStatistics,
} from "../../services/user/userManagementService";
import { getAllBlogs } from "../../services/blog";
import MentorService from "../../services/mentor/MentorService";

// Lazy load components
const UserManagement = lazy(() => import("../../components/admin/UserManagement"));
const ContentManagement = lazy(() => import("../../components/admin/ContentManagement"));
const Analytics = lazy(() => import("../../components/admin/Analytics"));
const MentorApproval = lazy(() => import("../../components/admin/MentorApproval"));
const FeedbackManagement = lazy(() => import("../../components/admin/FeedbackManagement"));
const BookingManagement = lazy(() => import("../../components/admin/BookingManagement"));
const PaymentHistory = lazy(() => import("../../components/admin/PaymentHistory"));
const ReviewManagement = lazy(() => import("../../components/admin/ReviewManagement"));
const BannerManagement = lazy(() => import("../../components/admin/BannerManagement"));
const SystemSettings = lazy(() => import("../../components/admin/SystemSettings"));
const RolePermissions = lazy(() => import("../../components/admin/RolePermissions"));
const CountryManagement = lazy(() => import("../../components/admin/CountryManagement"));

import "../../styles/components/AdminPage.css";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [loadedTabs, setLoadedTabs] = useState(new Set(['users'])); // Track loaded tabs

  // State cho data từ API
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho pagination và search
  const [userPage, setUserPage] = useState(1);
  const [userSize] = useState(10);
  const [userSearch, setUserSearch] = useState("");
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [userTotalElements, setUserTotalElements] = useState(0);

  // Fetch users với pagination và search
  const fetchUsers = async (page = 1, search = "") => {
    try {
      setUsersLoading(true);
      const response = await getAllUsers({
        page,
        size: userSize,
        keySearch: search,
      });

      if (response?.respCode === "000" || response?.respCode === "0") {
        const rawUsers = response.data?.content || response.data?.data || [];

        const normalized = (rawUsers || []).map((u) => {
          const fullName = (u.fullName || u.name || "").toString().trim();
          let status = u.status;

          if (typeof status === "string") {
            const s = status.toLowerCase();
            if (s === "1" || s === "true" || /active/.test(s)) status = 1;
            else if (s === "0" || s === "false" || /inactive/.test(s))
              status = 0;
          }

          const role =
            u.role || (u.roleName ? { roleName: u.roleName } : undefined);

          return { ...u, fullName: fullName || null, status, role };
        });

        setUsers(normalized);
        setUserTotalPages(response.data?.totalPages || 0);
        setUserTotalElements(response.data?.totalElements || 0);
        console.log("Users loaded:", normalized);
        console.log("Total pages:", response.data?.totalPages);
        console.log("Total elements:", response.data?.totalElements);
      } else {
        console.error("Error loading users:", response);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu người dùng");
    } finally {
      setUsersLoading(false);
    }
  };

  // Handler cho search
  const handleUserSearch = (searchKeyword) => {
    setUserSearch(searchKeyword);
    setUserPage(1); // Reset về trang 1 khi search
    fetchUsers(1, searchKeyword);
  };

  // Handler cho page change
  const handleUserPageChange = (page) => {
    setUserPage(page);
    fetchUsers(page, userSearch);
  };

  // Handler refresh blogs
  const handleRefreshBlogs = async () => {
    try {
      setLoading(true);
      const blogsResponse = await getAllBlogs({ page: 0, size: 10 });
      if (blogsResponse?.respCode === "0" || blogsResponse?.success) {
        const blogsData = blogsResponse.data?.blogs || [];
        setBlogs(blogsData);
        console.log("Blogs refreshed:", blogsData.length, "items");
      }
    } catch (error) {
      console.error("Error refreshing blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await getUserStatistics();
      setStats(response.data);
      console.log("Stats loaded:", response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await getAllBlogs({ page: 0, size: 10 });
      if (response?.respCode === "0" || response?.success) {
        const blogsData = response.data?.blogs || [];
        setBlogs(blogsData);
        console.log("Blogs loaded successfully:", blogsData.length, "items");
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch mentors
  const fetchMentors = async () => {
    try {
      const response = await MentorService.getMentors({ page: 0, size: 50 });
      setMentors(response.data?.content || []);
      console.log("Mentors loaded:", response.data?.content);
    } catch (err) {
      console.error("Error fetching mentors:", err);
    }
  };

  // Load initial data cho tab users
  useEffect(() => {
    fetchUsers(userPage, userSearch);
  }, []);

  // Load data khi switch tab
  const handleTabChange = async (tabKey) => {
    setActiveTab(tabKey);
    
    // Chỉ load nếu tab chưa được load
    if (!loadedTabs.has(tabKey)) {
      try {
        setLoading(true);
        
        switch(tabKey) {
          case 'users':
            await fetchUsers(userPage, userSearch);
            break;
          case 'content':
            await fetchBlogs();
            break;
          case 'mentor-approval':
            if (!stats) await fetchStats();
            break;
          case 'analytics':
            if (!stats) await fetchStats();
            if (mentors.length === 0) await fetchMentors();
            break;
          case 'countries':
          case 'feedback':
          case 'booking':
          case 'payment':
          case 'reviews':
          case 'banners':
          case 'roles':
          case 'settings':
            // Các component này tự fetch data trong component
            break;
          default:
            break;
        }
        
        // Mark tab as loaded
        setLoadedTabs(prev => new Set([...prev, tabKey]));
      } catch (err) {
        console.error(`Error loading ${tabKey} data:`, err);
        setError(`Có lỗi xảy ra khi tải dữ liệu ${tabKey}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="text-center p-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted">Đang tải...</p>
    </div>
  );

  const menuItems = [
    {
      key: "users",
      icon: <FaUsers />,
      title: "Quản lý người dùng",
      badge: null,
      component: (
        <Suspense fallback={<LoadingFallback />}>
          <UserManagement
            users={users}
            stats={stats}
            loading={usersLoading}
            onSearch={handleUserSearch}
            onPageChange={handleUserPageChange}
            currentPage={userPage}
            totalPages={userTotalPages}
            totalElements={userTotalElements}
          />
        </Suspense>
      ),
    },
    {
      key: "content",
      icon: <FaBlog />,
      title: "Quản lý nội dung",
      badge: null,
      component: (
        <Suspense fallback={<LoadingFallback />}>
          <ContentManagement
            blogs={blogs}
            loading={loading}
            onRefresh={handleRefreshBlogs}
          />
        </Suspense>
      ),
    },
    {
      key: "mentor-approval",
      icon: <FaUserCog />,
      title: "Duyệt/xác thực mentor",
      badge: null,
      component: (
        <Suspense fallback={<LoadingFallback />}>
          <MentorApproval stats={stats} />
        </Suspense>
      ),
    },
    {
      key: "countries",
      icon: <FaGlobeAmericas />,
      title: "Quản lý các nước du học",
      badge: null,
      component: (
        <Suspense fallback={<LoadingFallback />}>
          <CountryManagement />
        </Suspense>
      ),
    },
    {
      key: "feedback",
      icon: <FaCommentDots />,
      title: "Quản lý phản hồi & báo cáo",
      badge: null,
      component: (
        <Suspense fallback={<LoadingFallback />}>
          <FeedbackManagement />
        </Suspense>
      ),
    },
    {
      key: "booking",
      icon: <FaCalendarAlt />,
      title: "Quản lý đặt lịch & lịch hẹn",
      badge: null,
      component: (
        <Suspense fallback={<LoadingFallback />}>
          <BookingManagement />
        </Suspense>
      ),
    },
    {
      key: "payment",
      icon: <FaHistory />,
      title: "Quản lý lịch sử thanh toán/giao dịch",
      badge: null,
      component: (
        <Suspense fallback={<LoadingFallback />}>
          <PaymentHistory />
        </Suspense>
      ),
    },
    {
      key: "reviews",
      icon: <FaCommentDots />,
      title: "Quản lý đánh giá & review",
      badge: null,
      component: (
        <Suspense fallback={<LoadingFallback />}>
          <ReviewManagement />
        </Suspense>
      ),
    },
    {
      key: "banners",
      icon: <FaBullhorn />,
      title: "Quản lý Banner & Quảng cáo",
      badge: null,
      component: (
        <Suspense fallback={<LoadingFallback />}>
          <BannerManagement />
        </Suspense>
      ),
    },
    {
      key: "analytics",
      icon: <FaChartBar />,
      title: "Báo cáo & thống kê",
      badge: null,
      component: (
        <Suspense fallback={<LoadingFallback />}>
          <Analytics stats={stats} mentors={mentors} />
        </Suspense>
      ),
    },
    {
      key: "mentor-ads",
      icon: <FaAd />,
      title: "Duyệt QC Mentor",
      badge: null,
      component: <MentorAdManagement />,
    },
    {
      key: "policies",
      icon: <FaFileAlt />,
      title: "Quản lý chính sách",
      badge: null,
      component: <PolicyManagement />,
    },
    {
      key: "roles",
      icon: <FaShieldAlt />,
      title: "Quản lý quyền & vai trò",
      badge: null,
      component: (
        <Suspense fallback={<LoadingFallback />}>
          <RolePermissions />
        </Suspense>
      ),
    },
    {
      key: "settings",
      icon: <FaCog />,
      title: "Cấu hình hệ thống",
      badge: null,
      component: (
        <Suspense fallback={<LoadingFallback />}>
          <SystemSettings />
        </Suspense>
      ),
    },
  ];

  return (
    <Container fluid className="admin-page py-4">
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <h5 className="alert-heading mb-2">⚠️ Lỗi</h5>
              <p className="mb-0">{error}</p>
            </Alert>
          </Col>
        </Row>
      )}

      <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
        <Row>
          <Col lg={3} md={4} className="mb-4">
            <AdminSidebar menuItems={menuItems} activeTab={activeTab} />
          </Col>

          <Col lg={9} md={8}>
            <Tab.Content>
              {menuItems.map((item) => (
                <Tab.Pane key={item.key} eventKey={item.key}>
                  {item.component}
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default AdminPage;
