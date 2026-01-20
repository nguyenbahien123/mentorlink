import { instance, authInstance }  from '../../api/axios';

export const getActiveMentorAds = () => {
  return authInstance.get('/api/public/mentor-ads/active');
};


export const getMentorAdsForAdmin = (params) => {
  return instance.get('/api/admin/mentor-ads', { params });
};

export const reviewMentorAd = (adId, reviewData) => {
  return instance.patch(`/api/admin/mentor-ads/${adId}/review`, reviewData);
};

export const getMentorAdStats = () => {
  return instance.get('/api/admin/mentor-ads/stats');
}

export const uploadMentorAd = (formData) => {
  return instance.post('/api/mentor-ads/upload', formData);
};

export const getMyMentorAds = (params) => {
  return instance.get('/api/mentor-ads/my-ads', { params });
};