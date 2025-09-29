import axios, { AxiosResponse } from 'axios';
import { AuthResponse, ApiResponse, User, Schedule, ScheduleDetail, MyParticipation } from '@/types';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// API 기본 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://teniszam.netlify.app' 
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 인증 실패
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {  // 회원가입
  register: async (name: string, phone: string): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/register', {
        name,
        phone,
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 로그인
  login: async (name: string, phone: string): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/api/auth/login', {
        name,
        phone,
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '로그인 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 내 정보 조회
  getMe: async (): Promise<User> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await api.get('/api/auth/me');
      const serverData = response.data.data!;
      // 서버 응답 형식을 User 타입으로 변환
      return {
        id: serverData.userId,
        name: serverData.name,
        phone: serverData.phone,
        is_approved: serverData.isApproved,
        is_admin: serverData.isAdmin,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '사용자 정보 조회 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },
};

// 일정 관련 API
export const scheduleAPI = {
  // 일정 목록 조회
  getSchedules: async (year?: number, month?: number): Promise<Schedule[]> => {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (month) params.append('month', month.toString());
      
      const response: AxiosResponse<ApiResponse<Schedule[]>> = await api.get(
        `/api/schedules?${params.toString()}`
      );
      return response.data.data!;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '일정 조회 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 일정 상세 조회
  getSchedule: async (scheduleId: number): Promise<ScheduleDetail> => {
    try {
      const response: AxiosResponse<ApiResponse<ScheduleDetail>> = await api.get(
        `/api/schedules/${scheduleId}`
      );
      return response.data.data!;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '일정 상세 조회 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 일정 생성
  createSchedule: async (scheduleData: Omit<Schedule, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'created_by_name'>): Promise<Schedule> => {
    try {
      const response: AxiosResponse<ApiResponse<Schedule>> = await api.post('/api/schedules', scheduleData);
      return response.data.data!;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '일정 생성 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 일정 수정
  updateSchedule: async (scheduleId: number, scheduleData: Omit<Schedule, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'created_by_name'>): Promise<Schedule> => {
    try {
      const response: AxiosResponse<ApiResponse<Schedule>> = await api.put(`/api/schedules/${scheduleId}`, scheduleData);
      return response.data.data!;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '일정 수정 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 일정 삭제
  deleteSchedule: async (scheduleId: number): Promise<void> => {
    try {
      await api.delete(`/api/schedules/${scheduleId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '일정 삭제 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 참여 상태 설정
  setParticipation: async (scheduleId: number, status: '참여' | '불참' | '미정'): Promise<void> => {
    try {
      await api.post(`/api/schedules/${scheduleId}/participate`, { status });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '참여 상태 설정 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 내 참여 상태 제거
  removeMyParticipation: async (scheduleId: number): Promise<void> => {
    try {
      await api.delete(`/api/schedules/${scheduleId}/participate`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '참여 상태 제거 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 내 참여 일정 조회
  getMyParticipations: async (): Promise<MyParticipation[]> => {
    try {
      const response: AxiosResponse<ApiResponse<MyParticipation[]>> = await api.get('/api/schedules/my-participations');
      return response.data.data!;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '참여 일정 조회 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },
};

// 사용자 관리 API (관리자용)
export const userAPI = {
  // 모든 사용자 조회
  getUsers: async (): Promise<User[]> => {
    try {
      const response: AxiosResponse<ApiResponse<User[]>> = await api.get('/api/users');
      return response.data.data!;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '사용자 목록 조회 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 승인 대기 사용자 조회
  getPendingUsers: async (): Promise<User[]> => {
    try {
      const response: AxiosResponse<ApiResponse<User[]>> = await api.get('/api/users/pending');
      return response.data.data!;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '승인 대기 사용자 조회 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 사용자 승인
  approveUser: async (userId: number): Promise<void> => {
    try {
      await api.patch(`/api/users/${userId}/approve`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '사용자 승인 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 승인 취소
  revokeUser: async (userId: number): Promise<void> => {
    try {
      await api.patch(`/api/users/${userId}/revoke`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '승인 취소 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 사용자 정보 수정
  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await api.put(`/api/users/${userId}`, userData);
      return response.data.data!;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '사용자 정보 수정 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 사용자 삭제
  deleteUser: async (userId: number): Promise<void> => {
    try {
      await api.delete(`/api/users/${userId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '사용자 삭제 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 다른 사용자 참여 상태 설정 (관리자용)
  setUserParticipation: async (scheduleId: number, userId: number, status: '참여' | '불참' | '미정'): Promise<void> => {
    try {
      await api.post(`/api/schedules/${scheduleId}/participate/${userId}`, { status });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '사용자 참여 상태 설정 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },

  // 참여자 완전 제거 (관리자용)
  removeParticipant: async (scheduleId: number, userId: number): Promise<void> => {
    try {
      await api.delete(`/api/schedules/${scheduleId}/participate/${userId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '참여자 제거 중 오류가 발생했습니다.';
      throw new Error(errorMessage);
    }
  },
};

export default api;