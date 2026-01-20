import { instance } from '../../api/axios';

// Small helper to normalize axios interceptor shapes
const unwrap = (res) => (res && res.data !== undefined ? res.data : res);

/**
 * Mentor Education CRUD client matching backend controller:
 * Base path: /api/mentor/educations
 */
class MentorEducationService {
  // Create new mentor education (status will be PENDING on server)
  static async create(mentorId, formData) {
    const res = await instance.post(`/api/mentor/educations/${mentorId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return unwrap(res);
  }

  // Get mentor education by id
  static async getById(educationId) {
    const res = await instance.get(`/api/mentor/educations/${educationId}`);
    return unwrap(res);
  }

  // List all educations for a mentor (any status)
  static async listByMentor(mentorId) {
    const res = await instance.get(`/api/mentor/educations/mentor/${mentorId}`);
    return unwrap(res);
  }

  // Paginated list for a mentor
  static async listByMentorPaginated(mentorId, page = 1, size = 10) {
    const res = await instance.get(`/api/mentor/educations/mentor/${mentorId}/paginated`, {
      params: { page, size }
    });
    return unwrap(res);
  }

  // Update a mentor education (server resets status to PENDING)
  static async update(educationId, mentorId, formData) {
    const res = await instance.put(`/api/mentor/educations/${educationId}/mentor/${mentorId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return unwrap(res);
  }

  // Delete a mentor education
  static async remove(educationId, mentorId) {
    const res = await instance.delete(`/api/mentor/educations/${educationId}/mentor/${mentorId}`);
    return unwrap(res);
  }

  // Filter by mentor and status code (APPROVED, PENDING, REJECTED)
  static async byMentorAndStatus(mentorId, statusCode) {
    const res = await instance.get(`/api/mentor/educations/mentor/${mentorId}/status/${statusCode}`);
    return unwrap(res);
  }

  // Public approved educations
  static async approvedAll() {
    const res = await instance.get(`/api/mentor/educations/approved`);
    return unwrap(res);
  }

  // Public approved educations for a mentor
  static async approvedByMentor(mentorId) {
    const res = await instance.get(`/api/mentor/educations/mentor/${mentorId}/approved`);
    return unwrap(res);
  }

  // ===== Admin endpoints =====
  static async adminApprove(educationId) {
    const res = await instance.put(`/api/mentor/educations/admin/${educationId}/approve`);
    return unwrap(res);
  }

  static async adminReject(educationId) {
    const res = await instance.put(`/api/mentor/educations/admin/${educationId}/reject`);
    return unwrap(res);
  }
}

export default MentorEducationService;
