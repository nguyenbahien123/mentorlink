import { useState, useEffect } from 'react';
import MentorService from '../services/mentor/MentorService';
import { useQuery } from "@tanstack/react-query"

const useMentors = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalPages: 0,
        totalElements: 0
    });

    const fetchMentors = async (params = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await MentorService.getMentors(params);

            if (response.respCode === "0") {
                setMentors(response.data.mentors);
                setPagination({
                    pageNumber: response.data.pageNumber,
                    pageSize: response.data.pageSize,
                    totalPages: response.data.totalPages,
                    totalElements: response.data.totalElements
                });
            } else {
                setError('Failed to fetch mentors');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
            console.error('Error fetching mentors:', err);
        } finally {
            setLoading(false);
        }
    };

    const searchMentors = async (keyword, options = {}) => {
        try {
            await fetchMentors({ keyword, ...options });
        } catch (err) {
            setError(err.message || 'Search failed');
        }
    };

    const getFeaturedMentors = async (limit = 6) => {
        try {
            const response = await MentorService.getFeaturedMentors(limit);
            if (response.respCode === "0") {
                return response.data.mentors;
            }
            return [];
        } catch (err) {
            console.error('Error fetching featured mentors:', err);
            return [];
        }
    };

    return {
        mentors,
        loading,
        error,
        pagination,
        fetchMentors,
        searchMentors,
        getFeaturedMentors
    };
}; export default useMentors;

export const useGetMentorActivity = () => {
    return useQuery({
        queryKey: ['mentorActivity'],
        queryFn: () =>  MentorService.getMentorActivity(),
    });
} 