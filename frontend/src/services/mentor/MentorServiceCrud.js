import { instance } from '../../api/axios';

// Small helper to normalize axios interceptor shapes
const unwrap = (res) => (res && res.data !== undefined ? res.data : res);

/**
 * Mentor Services CRUD client matching backend controller:
 * Base path: /api/mentor/services
 */
class MentorServiceCrud {
  // Create new mentor service (status will be PENDING on server)
  static async create(mentorId, payload) {
    const res = await instance.post(`/api/mentor/services/${mentorId}`, payload);
    return unwrap(res);
  }

  // Get mentor service by id (only APPROVED is returned by backend)
  static async getById(serviceId) {
    const res = await instance.get(`/api/mentor/services/${serviceId}`);
    return unwrap(res);
  }

  // List all services for a mentor (any status)
  static async listByMentor(mentorId) {
    const res = await instance.get(`/api/mentor/services/mentor/${mentorId}`);
    return unwrap(res);
  }

  // Paginated list for a mentor
  static async listByMentorPaginated(mentorId, page = 1, size = 10) {
    const res = await instance.get(`/api/mentor/services/mentor/${mentorId}/paginated`, {
      params: { page, size }
    });
    return unwrap(res);
  }

  // Update a mentor service (server resets status to PENDING)
  static async update(serviceId, mentorId, payload) {
    const res = await instance.put(`/api/mentor/services/${serviceId}/mentor/${mentorId}`, payload);
    return unwrap(res);
  }

  // Delete a mentor service
  static async remove(serviceId, mentorId) {
    const res = await instance.delete(`/api/mentor/services/${serviceId}/mentor/${mentorId}`);
    return unwrap(res);
  }

  // Filter by mentor and status code (APPROVED, PENDING, REJECTED)
  static async byMentorAndStatus(mentorId, statusCode) {
    const res = await instance.get(`/api/mentor/services/mentor/${mentorId}/status/${statusCode}`);
    return unwrap(res);
  }

  // Public approved services
  static async approvedAll() {
    const res = await instance.get(`/api/mentor/services/approved`);
    return unwrap(res);
  }

  // Public approved services for a mentor
  static async approvedByMentor(mentorId) {
    const res = await instance.get(`/api/mentor/services/mentor/${mentorId}/approved`);
    return unwrap(res);
  }

  // ===== Admin endpoints =====
  static async adminListByStatus(statusCode) {
    const res = await instance.get(`/api/mentor/services/admin/status/${statusCode}`);
    return unwrap(res);
  }

  static async adminSearch(keyword, statusCode, page = 1, size = 10) {
    const res = await instance.get(`/api/mentor/services/admin/search`, {
      params: { keyword, statusCode, page, size }
    });
    return unwrap(res);
  }

  static async adminApprove(serviceId) {
    const res = await instance.put(`/api/mentor/services/admin/${serviceId}/approve`);
    return unwrap(res);
  }

  static async adminReject(serviceId) {
    const res = await instance.put(`/api/mentor/services/admin/${serviceId}/reject`);
    return unwrap(res);
  }
}

export default MentorServiceCrud;
