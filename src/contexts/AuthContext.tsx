import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';
import { authAPI } from '@/utils/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // localStorage에서 사용자 정보 로드
  const loadUserFromStorage = () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        // 서버 응답 형식을 AuthContext 형식으로 변환
        if (userData.userId) {
          return {
            id: userData.userId,
            name: userData.name,
            phone: userData.phone,
            is_approved: userData.isApproved,
            is_admin: userData.isAdmin,
          };
        }
        return userData;
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      localStorage.removeItem('user');
    }
    return null;
  };

  // localStorage에 사용자 정보 저장
  const saveUserToStorage = (userData: User | null) => {
    try {
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
    }
  };

  // 초기 인증 상태 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = Cookies.get('token');
        const savedUser = loadUserFromStorage();
        
        if (savedToken && savedUser) {
          // localStorage에 사용자 정보가 있으면 즉시 설정
          setToken(savedToken);
          setUser(savedUser);
          
          // 서버에서 최신 사용자 정보 확인
          try {
            const userData = await authAPI.getMe();
            setUser(userData);
            saveUserToStorage(userData);
          } catch (error) {
            console.error('서버 사용자 정보 확인 실패:', error);
            // 서버 확인 실패 시 localStorage 정보 유지
          }
        } else if (savedToken) {
          // 토큰만 있는 경우 서버에서 사용자 정보 가져오기
          setToken(savedToken);
          const userData = await authAPI.getMe();
          setUser(userData);
          saveUserToStorage(userData);
        } else {
          // 토큰이 없으면 localStorage도 정리
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('인증 초기화 실패:', error);
        // 토큰이 유효하지 않으면 제거
        Cookies.remove('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 로그인
  const login = async (name: string, phone: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(name, phone);
      
      if (response.success && response.data) {
        const { token: newToken, ...userData } = response.data;
        
        const userInfo = {
          id: userData.userId,
          name: userData.name,
          phone: userData.phone,
          is_approved: userData.isApproved,
          is_admin: userData.isAdmin,
        };
        
        // 토큰 저장 (7일 유효)
        Cookies.set('token', newToken, { expires: 7 });
        setToken(newToken);
        setUser(userInfo);
        saveUserToStorage(userInfo);
        
        toast.success('로그인에 성공했습니다!');
      } else {
        throw new Error(response.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      toast.error(error.message || '로그인 중 오류가 발생했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입
  const register = async (name: string, phone: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(name, phone);
      
      if (response.success) {
        if (response.data?.token) {
          // 자동 승인된 경우
          const { token: newToken, ...userData } = response.data;
          
          const userInfo = {
            id: userData.userId,
            name: userData.name,
            phone: userData.phone,
            is_approved: userData.isApproved,
            is_admin: userData.isAdmin,
          };
          
          Cookies.set('token', newToken, { expires: 7 });
          setToken(newToken);
          setUser(userInfo);
          saveUserToStorage(userInfo);
          
          toast.success('회원가입이 완료되었습니다!');
        } else {
          // 승인 대기 상태
          toast.success('회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.');
        }
      } else {
        throw new Error(response.message || '회원가입에 실패했습니다.');
      }
    } catch (error: any) {
      toast.error(error.message || '회원가입 중 오류가 발생했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const logout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('로그아웃되었습니다.');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}