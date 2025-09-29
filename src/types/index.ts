// 사용자 관련 타입
export interface User {
  id: number;
  name: string;
  phone: string;
  is_approved: boolean;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
}

// 로그인/회원가입 응답 타입
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    userId: number;
    name: string;
    phone: string;
    isApproved: boolean;
    isAdmin: boolean;
    token: string;
  };
  errors?: any[];
}

// 일정 관련 타입
export interface Schedule {
  id: number;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD 형식
  start_time: string; // HH:MM 형식
  end_time: string; // HH:MM 형식
  location?: string;
  location_detail?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  participant_count?: number;
  confirmed_count?: number;
}

// 일정 상세 정보 (참여자 포함)
export interface ScheduleDetail extends Schedule {
  participants: Participant[];
}

// 참여자 정보
export interface Participant {
  user_id: number;
  user_name: string;
  user_phone: string;
  status: ParticipationStatus;
}

// 참여 상태
export type ParticipationStatus = '참여' | '불참' | '미정';

// 내 참여 일정
export interface MyParticipation {
  id: number;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  my_status: ParticipationStatus;
  created_by_name: string;
}

// API 응답 기본 형태
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// 폼 입력 타입
export interface RegisterForm {
  name: string;
  phone: string;
}

export interface LoginForm {
  name: string;
  phone: string;
}

export interface ScheduleForm {
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  location_detail?: string;
}

// 로딩 상태
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// 페이지 프롭스
export interface PageProps {
  children?: React.ReactNode;
  title?: string;
}

// 모달 프롭스
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// 버튼 변형
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger';

// 캘린더 뷰 타입
export type CalendarView = 'calendar' | 'list';

// 환경 변수 타입
export interface EnvConfig {
  API_URL: string;
}

// 인증 컨텍스트 타입
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (name: string, phone: string) => Promise<void>;
  register: (name: string, phone: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}