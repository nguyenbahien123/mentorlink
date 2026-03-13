import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Badge,
  Row,
  Col,
  Card,
  InputGroup,
  Modal,
  Alert,
} from "react-bootstrap";
import { FaPlus, FaTimes, FaGlobeAmericas, FaCheck } from "react-icons/fa";

const CountrySelector = ({
  selectedCountries = [],
  onCountriesChange,
  disabled = false,
}) => {
  // Danh sách các nước phổ biến (lấy từ API /api/mentor-countries/approved)
  const [popularCountries, setPopularCountries] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchApproved = async () => {
      try {
        // Lấy trực tiếp từ bảng country (các nước đã được duyệt)
        const resp = await fetch(
          "/api/countries"
        );
        const json = await resp.json();
        // Response: { data: [ { id, code, name, flagUrl, description } ] }
        const items = json.data || json;
        if (!mounted) return;
        const mapped = (items || []).map((country) => ({
          countryId: country.id || null,
          code: country.code || country.name?.slice(0, 3).toUpperCase() || "",
          name: country.name || "",
          flag: country.flagUrl || "",
        }));
        
        setPopularCountries(mapped);
      } catch (err) {
        console.error("Failed to load approved countries", err);
      }
    };
    fetchApproved();
    return () => {
      mounted = false;
    };
  }, []);

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customCountry, setCustomCountry] = useState({
    name: "",
    description: "",
  });
  const [pendingCountries, setPendingCountries] = useState([]);

  const handleCountrySelect = (country) => {
    if (disabled) return;

    const isSelected = selectedCountries.some(
      (c) => (typeof c === "string" ? c : c.countryName) === country.name
    );

    if (isSelected) {
      const updatedCountries = selectedCountries.filter(
        (c) => (typeof c === "string" ? c : c.countryName) !== country.name
      );
      onCountriesChange(updatedCountries);
    } else {
      const newCountry = {
        countryName: country.name,
        description: "",
        _uiFlag: country.flag,
        _uiCode: country.code,
        _uiCountryId: country.countryId,
      };
      onCountriesChange([...selectedCountries, newCountry]);
    }
  };

  const isCountrySelected = (country) => {
    return selectedCountries.some(
      (c) => (typeof c === "string" ? c : c.countryName) === country.name
    );
  };

  const handleCustomCountrySubmit = () => {
    if (!customCountry.name.trim()) return;

    const existsInPopular = popularCountries.some(
      (c) => c.name.toLowerCase() === customCountry.name.toLowerCase()
    );

    const existsInSelected = selectedCountries.some(
      (c) =>
        (typeof c === "string" ? c : c.countryName).toLowerCase() ===
        customCountry.name.toLowerCase()
    );

    if (existsInPopular || existsInSelected) {
      alert("Nước này đã có trong danh sách!");
      return;
    }
    const newCustomCountry = {
      countryName: customCountry.name.trim(),
      description: customCountry.description.trim(),
      _uiFlag: "🏳️",
      _uiIsPending: true,
    };

    onCountriesChange([...selectedCountries, newCustomCountry]);
    setPendingCountries([...pendingCountries, newCustomCountry]);

    setCustomCountry({ name: "", description: "" });
    setShowCustomModal(false);
  };

  const removeSelectedCountry = (countryToRemove) => {
    if (disabled) return;

    const updatedCountries = selectedCountries.filter(
      (c) =>
        (typeof c === "string" ? c : c.countryName) !==
        (typeof countryToRemove === "string"
          ? countryToRemove
          : countryToRemove.countryName)
    );
    onCountriesChange(updatedCountries);
  };

  return (
    <div className="country-selector">
      <Form.Group className="mb-4">
        <Form.Label className="d-flex align-items-center">
          <FaGlobeAmericas className="me-2 text-primary" />
          <span className="fw-semibold">Các nước bạn có thể hỗ trợ du học</span>
          <span className="text-danger ms-1">*</span>
        </Form.Label>

        <Card className="border-0 bg-light">
          <Card.Body className="p-3">
            {/* Danh sách nước đã chọn */}
            {selectedCountries.length > 0 && (
              <div className="mb-3">
                <small className="text-muted fw-semibold d-block mb-2">
                  Các nước đã chọn ({selectedCountries.length}):
                </small>
                <div className="d-flex flex-wrap gap-2">
                  {selectedCountries.map((country, index) => {
                    const countryName =
                      typeof country === "string"
                        ? country
                        : country.countryName;
                    const countryFlag =
                      typeof country === "string"
                        ? "🌍"
                        : country._uiFlag || "🌍";
                    const isPending =
                      typeof country === "object" && country._uiIsPending;

                    return (
                      <Badge
                        key={index}
                        bg={isPending ? "warning" : "primary"}
                        className="px-3 py-2 d-flex align-items-center"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <span className="me-2">
                          {countryFlag && countryFlag.startsWith("http") ? (
                            <img
                              src={countryFlag}
                              alt={countryName}
                              style={{
                                width: 20,
                                height: "auto",
                                borderRadius: 3,
                              }}
                            />
                          ) : (
                            countryFlag
                          )}
                        </span>
                        {countryName}
                        {isPending && (
                          <small className="ms-1">(chờ duyệt)</small>
                        )}
                        {!disabled && (
                          <FaTimes
                            className="ms-2 cursor-pointer"
                            style={{ cursor: "pointer" }}
                            onClick={() => removeSelectedCountry(country)}
                          />
                        )}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Danh sách nước phổ biến */}
            <div className="mb-3">
              <small className="text-muted fw-semibold d-block mb-2">
                Chọn từ danh sách các nước phổ biến:
              </small>
              <Row>
                {popularCountries.map((country, index) => {
                  const selected = isCountrySelected(country);
                  return (
                    <Col
                      key={`country-${country.countryId}-${country.name}-${index}`}
                      xs={6}
                      md={4}
                      lg={3}
                      className="mb-2"
                    >
                      <Button
                        variant={selected ? "primary" : "outline-secondary"}
                        size="sm"
                        className={`w-100 d-flex align-items-center justify-content-between ${
                          selected ? "selected-country" : ""
                        }`}
                        onClick={() => handleCountrySelect(country)}
                        disabled={disabled}
                      >
                        <span className="d-flex align-items-center">
                          <span className="me-2">
                            {country.flag ? (
                              <img
                                src={country.flag}
                                alt={country.name}
                                style={{
                                  width: 20,
                                  height: "auto",
                                  borderRadius: 3,
                                }}
                              />
                            ) : (
                              <span>🌍</span>
                            )}
                          </span>
                          <small>{country.name}</small>
                        </span>
                        {selected && <FaCheck size={12} />}
                      </Button>
                    </Col>
                  );
                })}
              </Row>
            </div>

            {/* Nút thêm nước tùy chỉnh */}
            {!disabled && (
              <div className="text-center">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowCustomModal(true)}
                  className="d-flex align-items-center mx-auto"
                >
                  <FaPlus className="me-2" />
                  Thêm nước khác không có trong danh sách
                </Button>
              </div>
            )}

            {/* Thông tin hướng dẫn */}
            <Alert variant="info" className="mt-3 mb-0">
              <small>
                <strong>Lưu ý:</strong> Hãy chọn các nước mà bạn có kinh nghiệm
                và kiến thức về hệ thống giáo dục để có thể tư vấn hiệu quả cho
                mentee.
              </small>
            </Alert>
          </Card.Body>
        </Card>
      </Form.Group>

      {/* Modal thêm nước tùy chỉnh */}
      <Modal show={showCustomModal} onHide={() => setShowCustomModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Đề xuất nước mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên nước *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ví dụ: Trung Quốc, Brazil, India..."
                value={customCountry.name}
                onChange={(e) =>
                  setCustomCountry({
                    ...customCountry,
                    name: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả về kinh nghiệm của bạn với nước này</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ví dụ: Tôi đã học tại nước này 2 năm và hiểu rõ về hệ thống giáo dục..."
                value={customCountry.description}
                onChange={(e) =>
                  setCustomCountry({
                    ...customCountry,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Alert variant="warning">
              <small>
                Nước này sẽ được gửi đến admin để xem xét và phê duyệt. Sau khi
                được duyệt, nó sẽ xuất hiện trong danh sách chính.
              </small>
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCustomModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleCustomCountrySubmit}
            disabled={!customCountry.name.trim()}
          >
            Gửi đề xuất
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .selected-country {
          transform: scale(0.98);
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3) !important;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .country-selector .btn:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default CountrySelector;
