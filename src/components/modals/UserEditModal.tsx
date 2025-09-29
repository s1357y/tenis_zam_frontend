import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { FiX, FiUser, FiPhone, FiShield, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: (updatedUser: User) => void;
  currentUserId: number;
}

export default function UserEditModal({ 
  isOpen, 
  onClose, 
  user, 
  onUserUpdated, 
  currentUserId 
}: UserEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    is_approved: false,
    is_admin: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // 모달이 열릴 때 사용자 정보로 폼 초기화
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name,
        phone: user.phone,
        is_approved: user.is_approved,
        is_admin: user.is_admin,
      });
    }
  }, [user, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // 자기 자신의 관리자 권한 변경 시도 방지
    if (user.id === currentUserId && formData.is_admin !== user.is_admin) {
      toast.error('자기 자신의 관리자 권한은 변경할 수 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const { userAPI } = await import('@/utils/api');
      const updatedUser = await userAPI.updateUser(user.id, formData);
      onUserUpdated(updatedUser);
      toast.success('사용자 정보가 성공적으로 수정되었습니다.');
      onClose();
    } catch (error: any) {
      toast.error(error.message || '사용자 정보 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const isCurrentUser = user.id === currentUserId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FiUser className="w-5 h-5 mr-2" />
            사용자 정보 수정
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 사용자 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="사용자 이름을 입력하세요"
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              <FiPhone className="w-4 h-4 inline mr-1" />
              전화번호
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="전화번호를 입력하세요"
            />
          </div>

          {/* 승인 상태 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_approved"
              name="is_approved"
              checked={formData.is_approved}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_approved" className="ml-2 block text-sm text-gray-700">
              <FiCheck className="w-4 h-4 inline mr-1" />
              승인된 사용자
            </label>
          </div>

          {/* 관리자 권한 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_admin"
              name="is_admin"
              checked={formData.is_admin}
              onChange={handleInputChange}
              disabled={isCurrentUser}
              className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <label 
              htmlFor="is_admin" 
              className={`ml-2 block text-sm text-gray-700 ${
                isCurrentUser ? 'opacity-50' : ''
              }`}
            >
              <FiShield className="w-4 h-4 inline mr-1" />
              관리자 권한
              {isCurrentUser && (
                <span className="ml-1 text-xs text-gray-500">(자기 자신은 변경 불가)</span>
              )}
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '수정 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
