import React, { useState } from "react";
import { Container } from "react-bootstrap";
import UploadAdForm from "../UploadAdForm";
import MyAdsList from "../MyAdsList";

const MyAdsPage = () => {
  // State này dùng để trigger component list tải lại sau khi upload
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey((oldKey) => oldKey + 1); // Tăng key để tải lại list
  };

  return (
    <Container className="py-4">
      <h3 className="mb-4">Quản lý Quảng cáo</h3>
      <UploadAdForm onUploadSuccess={handleUploadSuccess} />
      <MyAdsList refreshKey={refreshKey} />
    </Container>
  );
};

export default MyAdsPage;
