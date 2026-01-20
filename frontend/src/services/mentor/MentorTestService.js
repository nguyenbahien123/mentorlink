import { instance } from '../../api/axios';

// Small helper to normalize axios interceptor shapes
const unwrap = (res) => (res && res.data !== undefined ? res.data : res);

/**
 * Mentor Tests CRUD client matching backend controller:
 * Base path: /api/mentor/tests
 */
class MentorTestService {
  // Create new mentor test (status will be PENDING on server)
  static async create(mentorId, payload) {
    const res = await instance.post(`/api/mentor/tests/${mentorId}`, payload);
    return unwrap(res);
  }

  // Get mentor test by id
  static async getById(testId) {
    const res = await instance.get(`/api/mentor/tests/${testId}`);
    return unwrap(res);
  }

  // List all tests for a mentor (any status)
  static async listByMentor(mentorId) {
    const res = await instance.get(`/api/mentor/tests/mentor/${mentorId}`);
    return unwrap(res);
  }

  // Paginated list for a mentor
  static async listByMentorPaginated(mentorId, page = 1, size = 10) {
    const res = await instance.get(`/api/mentor/tests/mentor/${mentorId}/paginated`, {
      params: { page, size }
    });
    return unwrap(res);
  }

  // Update a mentor test (server resets status to PENDING)
  static async update(testId, mentorId, payload) {
    const res = await instance.put(`/api/mentor/tests/${testId}/mentor/${mentorId}`, payload);
    return unwrap(res);
  }

  // Delete a mentor test
  static async remove(testId, mentorId) {
    const res = await instance.delete(`/api/mentor/tests/${testId}/mentor/${mentorId}`);
    return unwrap(res);
  }

  // Filter by mentor and status code (APPROVED, PENDING, REJECTED)
  static async byMentorAndStatus(mentorId, statusCode) {
    const res = await instance.get(`/api/mentor/tests/mentor/${mentorId}/status/${statusCode}`);
    return unwrap(res);
  }

  // Public approved tests
  static async approvedAll() {
    const res = await instance.get(`/api/mentor/tests/approved`);
    return unwrap(res);
  }

  // Public approved tests for a mentor
  static async approvedByMentor(mentorId) {
    const res = await instance.get(`/api/mentor/tests/mentor/${mentorId}/approved`);
    return unwrap(res);
  }

  // ===== Admin endpoints =====
  static async adminApprove(testId) {
    const res = await instance.put(`/api/mentor/tests/admin/${testId}/approve`);
    return unwrap(res);
  }

  static async adminReject(testId) {
    const res = await instance.put(`/api/mentor/tests/admin/${testId}/reject`);
    return unwrap(res);
  }
}

export default MentorTestService;
