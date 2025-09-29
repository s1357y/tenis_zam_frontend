import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RegisterForm } from '@/types';
import { FiUser, FiPhone } from 'react-icons/fi';
import { handlePhoneInputChange } from '@/utils/phoneFormat';

export default function RegisterPage() {
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterForm>();

  // 이미 로그인된 사용자는 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsSubmitting(true);
      await registerUser(data.name, data.phone);
      
      // 회원가입 성공 후 로그인 페이지로 이동 (자동 승인이 아닌 경우)
      // 자동 승인인 경우 AuthContext에서 자동으로 메인 페이지로 이동
      setTimeout(() => {
        if (!isAuthenticated) {
          router.push('/login');
        }
      }, 2000);
    } catch (error) {
      // 에러는 AuthContext에서 토스트로 처리됨
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-3xl">🎾</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            잠중 테니스 회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            이름과 전화번호로 간편하게 가입하세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* 이름 입력 */}
            <div>
              <label htmlFor="name" className="sr-only">
                이름
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name', {
                    required: '이름을 입력해주세요.',
                    minLength: {
                      value: 2,
                      message: '이름은 2자 이상 입력해주세요.',
                    },
                    maxLength: {
                      value: 50,
                      message: '이름은 50자 이하로 입력해주세요.',
                    },
                  })}
                  type="text"
                  placeholder="이름"
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* 전화번호 입력 */}
            <div>
              <label htmlFor="phone" className="sr-only">
                전화번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone', {
                    required: '전화번호를 입력해주세요.',
                    pattern: {
                      value: /^010-\d{4}-\d{4}$/,
                      message: '010-xxxx-xxxx 형식으로 입력해주세요. (예: 010-1234-5678)',
                    },
                  })}
                  type="tel"
                  placeholder="전화번호 (010-1234-5678)"
                  className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  onChange={(e) => {
                    handlePhoneInputChange(e.target.value, (value) => {
                      setValue('phone', value);
                    });
                  }}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  가입 중...
                </div>
              ) : (
                '회원가입'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                로그인
              </Link>
            </p>
          </div>
        </form>

        {/* 안내 사항 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>안내사항:</strong><br />
            • 가입 후 자동으로 승인되어 바로 이용하실 수 있습니다.<br />
            • 첫 번째 가입자는 자동으로 관리자 권한이 부여됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}