import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  InputGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import CountrySelector from "../../components/mentor/CountrySelector";
import { MentorPolicyModal } from "../../components/common";
import { AuthService } from "../../services";
import { OtpService } from "../../services/auth";
import OtpVerification from "../../components/auth/OtpVerification";
import "../../styles/components/MentorRegister.css";

const RegisterMentorPage = () => {
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    personalInfo: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: "",
      location: "",
      phone: "",
      title: "",
      education: "",
      linkedinUrl: "",
      bio: "",
    },
  });

  // State for approved countries
  const [selectedCountries, setSelectedCountries] = useState([]);

  // State for avatar
  const [avatar, setAvatar] = useState(null);

  // State for policy modal
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [hasPolicyAccepted, setHasPolicyAccepted] = useState(false);

  // State for loading and error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State for OTP verification
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  // State for form sections - ✅ SINGLE FILE (not array)
  const [educations, setEducations] = useState([
    {
      school: "",
      major: "",
      startDate: "",
      endDate: "",
      certificate: null, // ✅ Single file
    },
  ]);
  const [experiences, setExperiences] = useState([
    {
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      proof: null, // ✅ Single file
    },
  ]);
  const [testScores, setTestScores] = useState([
    {
      testName: "",
      score: "",
      certificate: null, // ✅ Single file
    },
  ]);

  // Handlers for adding items
  const addEducation = () => {
    setEducations([
      ...educations,
      { school: "", major: "", startDate: "", endDate: "", certificate: null },
    ]);
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { company: "", position: "", startDate: "", endDate: "", proof: null },
    ]);
  };

  const addTestScore = () => {
    setTestScores([
      ...testScores,
      { testName: "", score: "", certificate: null },
    ]);
  };

  // Handlers for removing items
  const removeEducation = (index) => {
    if (educations.length > 1) {
      const newEducations = [...educations];
      newEducations.splice(index, 1);
      setEducations(newEducations);
    }
  };

  const removeExperience = (index) => {
    if (experiences.length > 1) {
      const newExperiences = [...experiences];
      newExperiences.splice(index, 1);
      setExperiences(newExperiences);
    }
  };

  const removeTestScore = (index) => {
    if (testScores.length > 1) {
      const newTestScores = [...testScores];
      newTestScores.splice(index, 1);
      setTestScores(newTestScores);
    }
  };

  // Handle personal info changes
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        [name]: value,
      },
    });
  };

  // Handle education changes
  const handleEducationChange = (index, field, value) => {
    const updatedEducations = [...educations];
    updatedEducations[index] = {
      ...updatedEducations[index],
      [field]: value,
    };
    setEducations(updatedEducations);
  };

  // Handle experience changes
  const handleExperienceChange = (index, field, value) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value,
    };
    setExperiences(updatedExperiences);
  };

  // Handle test score changes
  const handleTestScoreChange = (index, field, value) => {
    const updatedTestScores = [...testScores];
    updatedTestScores[index] = {
      ...updatedTestScores[index],
      [field]: value,
    };
    setTestScores(updatedTestScores);
  };

    // ========= Custom validation trước khi gửi OTP =========
    const validateMentorForm = () => {
      const errors = [];

      // Personal info
      if (!formData.personalInfo.name.trim()) errors.push('Vui lòng nhập họ tên');
      if (!formData.personalInfo.email.trim()) errors.push('Vui lòng nhập email');
      if (!formData.personalInfo.password) errors.push('Vui lòng nhập mật khẩu');
      if (formData.personalInfo.password && formData.personalInfo.password.length < 8) errors.push('Mật khẩu phải tối thiểu 8 ký tự');
      if (formData.personalInfo.password !== formData.personalInfo.confirmPassword) errors.push('Mật khẩu xác nhận không khớp');
      if (!formData.personalInfo.birthDate) errors.push('Vui lòng chọn ngày sinh');
      if (!formData.personalInfo.location.trim()) errors.push('Vui lòng nhập nơi sinh sống');
      if (!formData.personalInfo.phone.trim()) errors.push('Vui lòng nhập số điện thoại');
      if (!formData.personalInfo.title.trim()) errors.push('Vui lòng nhập chức danh');
      if (!formData.personalInfo.education) errors.push('Vui lòng chọn trình độ học vấn');
      if (!formData.personalInfo.bio.trim()) errors.push('Vui lòng nhập giới thiệu bản thân');
      if (!avatar) errors.push('Vui lòng chọn ảnh đại diện');

      // Countries
      if (selectedCountries.length === 0) errors.push('Vui lòng chọn ít nhất một quốc gia bạn có thể hỗ trợ');

      // Educations
      educations.forEach((edu, idx) => {
        if (!edu.school?.trim()) errors.push(`Bằng cấp #${idx + 1}: thiếu tên trường`);
        if (!edu.major?.trim()) errors.push(`Bằng cấp #${idx + 1}: thiếu chuyên ngành`);
        if (!edu.startDate) errors.push(`Bằng cấp #${idx + 1}: thiếu ngày bắt đầu`);
        if (!edu.certificate) errors.push(`Bằng cấp #${idx + 1}: thiếu file ảnh / PDF`);
      });

      // Experiences
      experiences.forEach((exp, idx) => {
        if (!exp.company?.trim()) errors.push(`Kinh nghiệm #${idx + 1}: thiếu tên công ty`);
        if (!exp.position?.trim()) errors.push(`Kinh nghiệm #${idx + 1}: thiếu vị trí`);
        if (!exp.startDate) errors.push(`Kinh nghiệm #${idx + 1}: thiếu ngày bắt đầu`);
        if (!exp.proof) errors.push(`Kinh nghiệm #${idx + 1}: thiếu file minh chứng`);
      });

      // Certificates / Test scores
      testScores.forEach((test, idx) => {
        if (!test.testName?.trim()) errors.push(`Chứng chỉ #${idx + 1}: thiếu tên bài thi`);
        if (!test.score?.trim()) errors.push(`Chứng chỉ #${idx + 1}: thiếu điểm số`);
        if (!test.certificate) errors.push(`Chứng chỉ #${idx + 1}: thiếu file chứng chỉ`);
      });

      // Policy
      if (!hasPolicyAccepted) errors.push('Bạn cần chấp nhận chính sách mentor');

      return errors;
    };

const handleSubmit = async (e) => {
  e.preventDefault();

  setError(null);
  setSuccess(null);

    // Chạy full validation trước khi tạo FormData & gửi OTP
    const validationErrors = validateMentorForm();
    if (validationErrors.length > 0) {
      // Hiển thị gọn: lấy 1 lỗi đầu hoặc ghép bằng xuống dòng
      setError(validationErrors.slice(0,5).join('\n')); // tránh quá dài
      return;
    }

  // Validation
  if (formData.personalInfo.password !== formData.personalInfo.confirmPassword) {
    setError("Mật khẩu không khớp. Vui lòng kiểm tra lại!");
    return;
  }

  if (formData.personalInfo.password.length < 8) {
    setError("Mật khẩu phải có ít nhất 8 ký tự!");
    return;
  }

  if (selectedCountries.length === 0) {
    setError("Vui lòng chọn ít nhất một nước bạn có thể hỗ trợ du học!");
    return;
  }

  if (!hasPolicyAccepted) {
    setError("Vui lòng đọc và chấp nhận chính sách mentor trước khi đăng ký!");
    setShowPolicyModal(true);
    return;
  }

  if (!formData.personalInfo.email || !formData.personalInfo.email.trim()) {
    setError("Vui lòng nhập email hợp lệ!");
    return;
  }

  const formDataToSend = new FormData();

  formDataToSend.append("fullName", formData.personalInfo.name || "");
  formDataToSend.append("email", formData.personalInfo.email.trim()); 
  formDataToSend.append("password", formData.personalInfo.password || "");
  formDataToSend.append("confirmPassword", formData.personalInfo.confirmPassword || "");
  formDataToSend.append("dob", formData.personalInfo.birthDate || "");
  formDataToSend.append("address", formData.personalInfo.location || "");
  formDataToSend.append("phone", formData.personalInfo.phone || "");
  formDataToSend.append("title", formData.personalInfo.title || "");
  formDataToSend.append("levelOfEducation", formData.personalInfo.education || "");
  formDataToSend.append("linkedUrl", formData.personalInfo.linkedinUrl || "");
  formDataToSend.append("introduceYourself", formData.personalInfo.bio || "");

  // ✅ Avatar
  if (avatar) {
    formDataToSend.append("avatar", avatar);
  }

  // ✅ SAU ĐÓ MỚI APPEND NESTED ARRAYS
  // Educations
  educations.forEach((edu, index) => {
    formDataToSend.append(`mentorEducations[${index}].schoolName`, edu.school || "");
    formDataToSend.append(`mentorEducations[${index}].major`, edu.major || "");
    formDataToSend.append(`mentorEducations[${index}].startDate`, edu.startDate || "");
    formDataToSend.append(`mentorEducations[${index}].endDate`, edu.endDate || "");
    if (edu.certificate) {
      formDataToSend.append(`mentorEducations[${index}].degreesFile`, edu.certificate);
    }
  });

  // Certificates
  testScores.forEach((test, index) => {
    formDataToSend.append(`certificates[${index}].certificateName`, test.testName || "");
    formDataToSend.append(`certificates[${index}].score`, test.score || "");
    if (test.certificate) {
      formDataToSend.append(`certificates[${index}].certificatesFile`, test.certificate);
    }
  });

  // Experiences
  experiences.forEach((exp, index) => {
    formDataToSend.append(`experiences[${index}].company`, exp.company || "");
    formDataToSend.append(`experiences[${index}].position`, exp.position || "");
    formDataToSend.append(`experiences[${index}].startDate`, exp.startDate || "");
    formDataToSend.append(`experiences[${index}].endDate`, exp.endDate || "");
    if (exp.proof) {
      formDataToSend.append(`experiences[${index}].experiencesFile`, exp.proof);
    }
  });

  // Countries
  selectedCountries.forEach((country, index) => {
    if (typeof country === "string") {
      formDataToSend.append(`mentorCountries[${index}].countryName`, country);
      formDataToSend.append(`mentorCountries[${index}].description`, "");
    } else {
      formDataToSend.append(
        `mentorCountries[${index}].countryName`,
        country.countryName || country.name || ""
      );
      formDataToSend.append(
        `mentorCountries[${index}].description`,
        country.description || ""
      );
    }
  });

  console.log("=== FINAL FormData Check BEFORE SENDING OTP ===");
  console.log("FormData type:", formDataToSend instanceof FormData ? "✅ FormData" : "❌ NOT FormData");
  let emailFound = false;
  let fullNameFound = false;
  
  for (let [key, value] of formDataToSend.entries()) {
    console.log(key, ":", value instanceof File ? `[File: ${value.name}]` : value);
    if (key === 'email') {
      emailFound = true;
      console.log("✅ EMAIL FOUND:", value);
    }
    if (key === 'fullName') {
      fullNameFound = true;
      console.log("✅ FULLNAME FOUND:", value);
    }
  }
  
  if (!emailFound) {
    console.error("❌ EMAIL NOT IN FORMDATA!");
    setError("Lỗi kỹ thuật: Email không được gửi. Vui lòng liên hệ hỗ trợ!");
    return;
  }
  
  if (!fullNameFound) {
    console.error("❌ FULLNAME NOT IN FORMDATA!");
    setError("Lỗi kỹ thuật: Họ tên không được gửi. Vui lòng liên hệ hỗ trợ!");
    return;
  }

  // 🔐 BƯỚC 1: GỬI OTP TRƯỚC
  try {
    setIsSubmitting(true);
    console.log("� Gửi OTP đến email:", formData.personalInfo.email);
    
    const otpResult = await OtpService.sendOtp(formData.personalInfo.email);
    
    if (otpResult.success) {
      // Lưu FormData để sử dụng sau khi verify OTP
      setPendingFormData(formDataToSend);
      
      // Chuyển sang bước nhập OTP
      setShowOtpStep(true);
      setError('');
    } else {
      // Hiển thị lỗi cụ thể từ backend
      setError(otpResult.error || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    setError('Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại.');
  } finally {
    setIsSubmitting(false);
  }
};
  // Policy modal handlers
  const handlePolicyAccept = () => {
    setHasPolicyAccepted(true);
    setShowPolicyModal(false);
  };

  const handleShowPolicy = () => {
    setShowPolicyModal(true);
  };

  // 🔐 OTP Handlers
  const handleOtpVerify = async (otpCode) => {
    setOtpError('');
    setOtpLoading(true);

    try {
      // ✅ Tạo FormData mới để tránh append duplicate
      const formDataWithOtp = new FormData();
      
      // Copy tất cả entries từ pendingFormData
      for (let [key, value] of pendingFormData.entries()) {
        // Skip otpCode cũ nếu có
        if (key !== 'otpCode') {
          formDataWithOtp.append(key, value);
        }
      }
      
      // Append OTP code mới
      formDataWithOtp.append('otpCode', otpCode);

      console.log("🔐 Đăng ký mentor với OTP:", otpCode);
      const result = await OtpService.signUpMentorWithOtp(formDataWithOtp);

      if (result.success) {
        setSuccess("Đăng ký mentor thành công! Đang chuyển hướng...");
        setTimeout(() => {
          const user = AuthService.getCurrentUser();
          if (user) {
            navigate(AuthService.getRouteByRole(user.role));
          } else {
            navigate("/login");
          }
        }, 2000);
      } else {
        // Hiển thị lỗi cụ thể từ backend
        setOtpError(result.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setOtpError('Có lỗi xảy ra khi xác thực OTP. Vui lòng thử lại.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpResend = async () => {
    setOtpError('');
    setOtpLoading(true);

    try {
      const result = await OtpService.resendOtp(formData.personalInfo.email);
      
      if (!result.success) {
        setOtpError(result.error || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setOtpError('Có lỗi xảy ra khi gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleBackToForm = () => {
    setShowOtpStep(false);
    setOtpError('');
    setPendingFormData(null);
  };

  return (
    <div className="mentor-register-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} md={11} sm={12}>
            <div className="text-center mb-5">
              <h1 className="fw-bold display-4 page-title">Đăng ký làm Cố vấn</h1>
              <p className="lead page-subtitle">
                Hãy chia sẻ kinh nghiệm và kiến thức của bạn để giúp đỡ những người khác
              </p>
            </div>

            {/* 🔐 HIỂN THỊ OTP VERIFICATION NẾU showOtpStep = true */}
            {showOtpStep ? (
              <Card className="card-mentor">
                <Card.Body className="p-4 p-md-5">
                  <div className="mb-3">
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none"
                      onClick={handleBackToForm}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Quay lại
                    </Button>
                  </div>
                  <OtpVerification
                    email={formData.personalInfo.email}
                    onVerifySuccess={handleOtpVerify}
                    onResend={handleOtpResend}
                    loading={otpLoading}
                    error={otpError}
                  />
                  {success && (
                    <Alert variant="success" className="mt-3">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      {success}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            ) : (
              <>
            {/* 📝 FORM ĐĂNG KÝ THÔNG TIN MENTOR */}
            <Card className="card-mentor">
              <div className="card-header-gradient-primary">
                <h2 className="fs-4 fw-bold mb-0">Thông tin cá nhân</h2>
              </div>
              <Card.Body className="p-4 p-md-5">
                <Form onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Tên của bạn <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-0">
                            <i className="bi bi-person text-secondary"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.personalInfo.name}
                            onChange={handlePersonalInfoChange}
                            placeholder="Họ và tên đầy đủ của bạn"
                            className="bg-light py-2 enhanced-input"
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Email <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-0">
                            <i className="bi bi-envelope text-secondary"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.personalInfo.email}
                            onChange={handlePersonalInfoChange}
                            placeholder="you@yourdomain.com"
                            className="bg-light border-0 py-2"
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Mật khẩu <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-0">
                            <i className="bi bi-lock text-secondary"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.personalInfo.password}
                            onChange={handlePersonalInfoChange}
                            placeholder="Nhập mật khẩu của bạn"
                            className="bg-light border-0 py-2"
                            minLength="8"
                            required
                          />
                        </InputGroup>
                        <Form.Text className="text-muted">
                          Mật khẩu phải có ít nhất 8 ký tự
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Xác nhận mật khẩu <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-0">
                            <i className="bi bi-lock-fill text-secondary"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.personalInfo.confirmPassword}
                            onChange={handlePersonalInfoChange}
                            placeholder="Nhập lại mật khẩu"
                            className="bg-light border-0 py-2"
                            minLength="8"
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Ngày tháng năm sinh <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-0">
                            <i className="bi bi-calendar text-secondary"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="date"
                            name="birthDate"
                            value={formData.personalInfo.birthDate}
                            onChange={handlePersonalInfoChange}
                            className="bg-light border-0 py-2"
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Nơi đang sinh sống <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-0">
                            <i className="bi bi-geo-alt text-secondary"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="location"
                            value={formData.personalInfo.location}
                            onChange={handlePersonalInfoChange}
                            placeholder="Ví dụ như 'Hanoi, Vietnam,' 'New York, NY'"
                            className="bg-light border-0 py-2"
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Số điện thoại <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-0">
                            <i className="bi bi-telephone text-secondary"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="phone"
                            value={formData.personalInfo.phone}
                            onChange={handlePersonalInfoChange}
                            placeholder="Số điện thoại liên lạc"
                            className="bg-light border-0 py-2"
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Chức danh <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-0">
                            <i className="bi bi-briefcase text-secondary"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="title"
                            value={formData.personalInfo.title}
                            onChange={handlePersonalInfoChange}
                            placeholder="Ví dụ như 'Web Developer, Mara Technology'"
                            className="bg-light border-0 py-2"
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Trình độ học vấn cao nhất <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="education"
                          value={formData.personalInfo.education}
                          onChange={handlePersonalInfoChange}
                          className="bg-light border-0 py-2"
                          required
                        >
                          <option value="">Chọn trình độ học vấn</option>
                          <option value="HIGH_SCHOOL">Phổ thông</option>
                          <option value="BACHELOR">Đại học</option>
                          <option value="MASTER">Thạc sĩ</option>
                          <option value="PHD">Tiến sĩ</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>LinkedIn URL</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light border-0">
                            <i className="bi bi-linkedin text-secondary"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="linkedinUrl"
                            value={formData.personalInfo.linkedinUrl || ""}
                            onChange={handlePersonalInfoChange}
                            placeholder="URL trang LinkedIn của bạn"
                            className="bg-light border-0 py-2"
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Country Selection Component */}
                  <CountrySelector
                    selectedCountries={selectedCountries}
                    onCountriesChange={setSelectedCountries}
                  />

                  <Form.Group className="mb-4">
                    <Form.Label>
                      Ảnh đại diện <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="file"
                        onChange={(e) => setAvatar(e.target.files[0])}
                        className="bg-light border-0 py-2"
                        accept="image/*"
                        required
                      />
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Hãy chọn ảnh đại diện chuyên nghiệp để tạo ấn tượng tốt với học viên
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      Giới thiệu bản thân <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="bio"
                      value={formData.personalInfo.bio}
                      onChange={handlePersonalInfoChange}
                      rows={5}
                      placeholder="Viết giới thiệu ngắn gọn về bản thân, kinh nghiệm và lý do bạn muốn trở thành mentor..."
                      className="bg-light border-0"
                      required
                    />
                  </Form.Group>

                  {/* Policy Agreement Section */}
                  <div className="mb-4">
                    <Alert variant={hasPolicyAccepted ? "success" : "warning"} className="p-3">
                      <div className="d-flex align-items-start">
                        <i
                          className={`bi ${
                            hasPolicyAccepted
                              ? "bi-check-circle-fill text-success"
                              : "bi-exclamation-triangle-fill text-warning"
                          } me-2 mt-1`}
                        ></i>
                        <div className="flex-grow-1">
                          <h6 className="mb-2">
                            {hasPolicyAccepted ? "Đã chấp nhận chính sách" : "Chính sách và Điều khoản"}
                            <span className="text-danger"> *</span>
                          </h6>
                          <p className="mb-2 small">
                            {hasPolicyAccepted
                              ? "Bạn đã đọc và đồng ý với các chính sách mentor. Cảm ơn bạn!"
                              : "Trước khi đăng ký, vui lòng đọc và đồng ý với các chính sách dành cho mentor."}
                          </p>
                          <Button
                            variant={hasPolicyAccepted ? "outline-success" : "primary"}
                            size="sm"
                            onClick={handleShowPolicy}
                            className="d-flex align-items-center"
                          >
                            <i className="bi bi-file-text me-2"></i>
                            {hasPolicyAccepted ? "Xem lại chính sách" : "Đọc chính sách mentor"}
                          </Button>
                        </div>
                      </div>
                    </Alert>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <Card className="card-mentor">
              <div className="card-header-gradient-success">
                <h2 className="fs-4 fw-bold mb-0">
                  Bằng cấp <span className="text-white">*</span>
                </h2>
              </div>
              <Card.Body className="p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="d-flex align-items-center"
                    onClick={addEducation}
                  >
                    <i className="bi bi-plus-circle me-2"></i> Thêm bằng cấp
                  </Button>
                </div>

                <Form>
                  {educations.map((edu, index) => (
                    <div key={index} className="border rounded-3 p-3 mb-3 position-relative">
                      <div className="position-absolute top-0 end-0 mt-2 me-2">
                        <Button
                          variant="link"
                          className="text-secondary p-1"
                          onClick={() => removeEducation(index)}
                          disabled={educations.length <= 1}
                        >
                          <i className="bi bi-x-circle"></i>
                        </Button>
                      </div>

                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Trường <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={edu.school || ""}
                              onChange={(e) => handleEducationChange(index, "school", e.target.value)}
                              placeholder="Tên trường học"
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Chuyên ngành <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={edu.major || ""}
                              onChange={(e) => handleEducationChange(index, "major", e.target.value)}
                              placeholder="Chuyên ngành học"
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Ngày bắt đầu <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              type="date"
                              value={edu.startDate || ""}
                              onChange={(e) => handleEducationChange(index, "startDate", e.target.value)}
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Ngày kết thúc</Form.Label>
                            <Form.Control
                              type="date"
                              value={edu.endDate || ""}
                              onChange={(e) => handleEducationChange(index, "endDate", e.target.value)}
                              className="bg-light border-0 py-2"
                            />
                            <Form.Text className="text-muted">Để trống nếu bạn đang học</Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Ảnh bằng cấp <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="file"
                          onChange={(e) => handleEducationChange(index, "certificate", e.target.files[0])}
                          className="bg-light border-0 py-2"
                          accept="image/*,application/pdf"
                          required
                        />
                        <Form.Text className="text-muted">
                          Chọn 1 file ảnh hoặc PDF
                        </Form.Text>
                      </Form.Group>
                    </div>
                  ))}
                </Form>
              </Card.Body>
            </Card>

            <Card className="card-mentor">
              <div className="card-header-gradient-info">
                <h2 className="fs-4 fw-bold mb-0">Điểm bài thi chuẩn hóa</h2>
              </div>
              <Card.Body className="p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="d-flex align-items-center"
                    onClick={addTestScore}
                  >
                    <i className="bi bi-plus-circle me-2"></i> Thêm chứng chỉ
                  </Button>
                </div>

                <Form>
                  {testScores.map((test, index) => (
                    <div key={index} className="border rounded-3 p-3 mb-3 position-relative">
                      <div className="position-absolute top-0 end-0 mt-2 me-2">
                        <Button
                          variant="link"
                          className="text-secondary p-1"
                          onClick={() => removeTestScore(index)}
                          disabled={testScores.length <= 1}
                        >
                          <i className="bi bi-x-circle"></i>
                        </Button>
                      </div>

                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Tên bài thi <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={test.testName || ""}
                              onChange={(e) => handleTestScoreChange(index, "testName", e.target.value)}
                              placeholder="Ví dụ: IELTS, TOEFL, SAT, ACT, GRE, GMAT"
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Điểm số <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={test.score || ""}
                              onChange={(e) => handleTestScoreChange(index, "score", e.target.value)}
                              placeholder="Điểm số của bạn"
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Ảnh chứng chỉ <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="file"
                          onChange={(e) => handleTestScoreChange(index, "certificate", e.target.files[0])}
                          className="bg-light border-0 py-2"
                          accept="image/*,application/pdf"
                          required
                        />
                        <Form.Text className="text-muted">
                          Chọn 1 file ảnh hoặc PDF
                        </Form.Text>
                      </Form.Group>
                    </div>
                  ))}
                </Form>
              </Card.Body>
            </Card>

            <Card className="card-mentor">
              <div className="card-header-gradient-warning">
                <h2 className="fs-4 fw-bold mb-0">
                  Kinh nghiệm làm việc <span className="text-white">*</span>
                </h2>
              </div>
              <Card.Body className="p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="d-flex align-items-center"
                    onClick={addExperience}
                  >
                    <i className="bi bi-plus-circle me-2"></i> Thêm kinh nghiệm
                  </Button>
                </div>

                <Form>
                  {experiences.map((exp, index) => (
                    <div key={index} className="border rounded-3 p-3 mb-3 position-relative">
                      <div className="position-absolute top-0 end-0 mt-2 me-2">
                        <Button
                          variant="link"
                          className="text-secondary p-1"
                          onClick={() => removeExperience(index)}
                          disabled={experiences.length <= 1}
                        >
                          <i className="bi bi-x-circle"></i>
                        </Button>
                      </div>

                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Công ty <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={exp.company || ""}
                              onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                              placeholder="Tên công ty"
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Vị trí <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={exp.position || ""}
                              onChange={(e) => handleExperienceChange(index, "position", e.target.value)}
                              placeholder="Vị trí công việc"
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Ngày bắt đầu <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              type="date"
                              value={exp.startDate || ""}
                              onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                              className="bg-light border-0 py-2"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Ngày kết thúc</Form.Label>
                            <Form.Control
                              type="date"
                              value={exp.endDate || ""}
                              onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                              className="bg-light border-0 py-2"
                            />
                            <Form.Text className="text-muted">
                              Để trống nếu bạn vẫn đang làm việc
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Ảnh minh chứng kinh nghiệm <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="file"
                          onChange={(e) => handleExperienceChange(index, "proof", e.target.files[0])}
                          className="bg-light border-0 py-2"
                          accept="image/*,application/pdf"
                          required
                        />
                        <Form.Text className="text-muted">
                          Chọn 1 file ảnh hoặc PDF
                        </Form.Text>
                      </Form.Group>
                    </div>
                  ))}
                </Form>
              </Card.Body>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)} className="mt-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert variant="success" className="mt-3">
                <i className="bi bi-check-circle-fill me-2"></i>
                {success}
              </Alert>
            )}

            <div className="action-buttons-container">
              <div className="d-flex justify-content-between">
                <Button
                  variant="light"
                  className="fw-bold shadow-sm"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-arrow-left me-2"></i> Quay lại
                </Button>
                <div>
                  <Button
                    type="submit"
                    variant={hasPolicyAccepted ? "success" : "primary"}
                    className="mentor-submit-btn"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Đang gửi OTP...
                      </>
                    ) : hasPolicyAccepted ? (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Tiếp tục <i className="bi bi-arrow-right ms-2"></i>
                      </>
                    ) : (
                      <>
                        Đọc chính sách và tiếp tục <i className="bi bi-arrow-right ms-2"></i>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            </>
            )}
          </Col>
        </Row>
      </Container>
      <MentorPolicyModal
        show={showPolicyModal}
        onHide={() => setShowPolicyModal(false)}
        onAccept={handlePolicyAccept}
      />
    </div>
  );
};

export default RegisterMentorPage;