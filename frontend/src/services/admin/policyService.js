import { instance } from '../../api/axios';

const BASE_URL = '/api/admin/policies'; 

export const getAllPolicies = (type, params) => {
  return instance.get(BASE_URL, { params: { type, ...params } });
};

export const searchPolicies = (type, keyword, params) => {
  return instance.get(`${BASE_URL}/search`, { params: { type, keyword, ...params } });
};

export const getPolicyById = (id) => {
  return instance.get(`${BASE_URL}/${id}`);
};

export const createPolicy = (policyData) => {
  return instance.post(BASE_URL, policyData);
};

export const updatePolicy = (id, policyData) => {
  return instance.put(`${BASE_URL}/${id}`, policyData);
};

export const deletePolicy = (id) => {
  return instance.delete(`${BASE_URL}/${id}`);
};

export const togglePolicyStatus = (id) => {
  return instance.patch(`${BASE_URL}/${id}/toggle-status`);
};