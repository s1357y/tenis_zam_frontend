import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { userAPI } from '@/utils/api';
import { User } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiCheck, FiX, FiTrash2, FiUserCheck, FiUserX, FiShield, FiEdit, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import UserEditModal from '@/components/modals/UserEditModal';

export default function AdminUsersPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 관리자가 아닌 경우 접근 제한
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // 데이터 로드
  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      loadUsers();
      loadPendingUsers();
    }
  }, [isAuthenticated, user]);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const data = await userAPI.getUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.message || '사용자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadPendingUsers = async () => {
    try {
      const data = await userAPI.getPendingUsers();
      setPendingUsers(data);
    } catch (error: any) {
      toast.error(error.message || '승인 대기 사용자 조회 중 오류가 발생했습니다.');
    }
  };

  // 사용자 승인
  const handleApproveUser = async (userId: number) => {
    try {
      await userAPI.approveUser(userId);
      toast.success('사용자가 승인되었습니다.');
      loadUsers();
      loadPendingUsers();
    } catch (error: any) {
      toast.error(error.message || '사용자 승인 중 오류가 발생했습니다.');
    }
  };

  // 승인 취소
  const handleRevokeUser = async (userId: number) => {
    if (window.confirm('정말로 이 사용자의 승인을 취소하시겠습니까?')) {
      try {
        await userAPI.revokeUser(userId);
        toast.success('사용자 승인이 취소되었습니다.');
        loadUsers();
        loadPendingUsers();
      } catch (error: any) {
        toast.error(error.message || '승인 취소 중 오류가 발생했습니다.');
      }
    }
  };

  // 사용자 삭제
  const handleDeleteUser = async (userId: number, userName: string) => {
    if (window.confirm(`정말로 "${userName}" 사용자를 삭제하시겠습니까?`)) {
      try {
        await userAPI.deleteUser(userId);
        toast.success('사용자가 삭제되었습니다.');
        loadUsers();
        loadPendingUsers();
      } catch (error: any) {
        toast.error(error.message || '사용자 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 사용자 정보 수정 모달 열기
  const handleEditUser = (targetUser: User) => {
    setEditingUser(targetUser);
    setIsEditModalOpen(true);
  };

  // 사용자 정보 수정 모달 닫기
  const handleCloseEditModal = () => {
    setEditingUser(null);
    setIsEditModalOpen(false);
  };

  // 사용자 정보 업데이트 후 처리
  const handleUserUpdated = (updatedUser: User) => {
    // 전체 사용자 목록 업데이트
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
    );
    
    // 승인 대기 사용자 목록 업데이트
    setPendingUsers(prevUsers => 
      prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
    );
  };

  if (isLoading || !isAuthenticated || !user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const displayUsers = activeTab === 'all' ? users : pendingUsers;

  return (
    <Layout title="사용자 관리">
      <div className="space-y-6">
        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <FiShield className="w-5 h-5 text-blue-600 mr-2" />
            <p className="text-blue-800">
              <strong>관리자 권한:</strong> 사용자 승인, 승인 취소, 삭제 및 참여 상태 관리가 가능합니다.
            </p>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              전체 사용자 ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              승인 대기 ({pendingUsers.length})
              {pendingUsers.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {pendingUsers.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* 사용자 목록 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {isLoadingUsers ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">사용자 목록을 불러오는 중...</p>
            </div>
          ) : displayUsers.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">
                {activeTab === 'all' ? '등록된 사용자가 없습니다.' : '승인 대기 중인 사용자가 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {displayUsers.map((targetUser) => (
                <div key={targetUser.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          {targetUser.name}
                        </h3>
                        {targetUser.is_admin ? (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FiShield className="w-3 h-3 mr-1" />
                            관리자
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FiUser className="w-3 h-3 mr-1" />
                            사용자
                          </span>
                        )
                      }
                        {!targetUser.is_approved && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            승인 대기
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{targetUser.phone}</p>
                      {targetUser.created_at && (
                        <p className="text-sm text-gray-500">
                          가입일: {format(new Date(targetUser.created_at), 'yyyy년 M월 d일', { locale: ko })}
                        </p>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center space-x-2">
                      {/* 수정 버튼 (모든 사용자) */}
                      <button
                        onClick={() => handleEditUser(targetUser)}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="사용자 정보 수정"
                      >
                        <FiEdit className="w-4 h-4 mr-1" />
                        수정
                      </button>

                      {/* 기존 액션 버튼들 (자기 자신 제외) */}
                      {targetUser.id !== user.id && (
                        <>
                          {targetUser.is_approved ? (
                            // 승인된 사용자
                            <>
                              {!targetUser.is_admin && (
                                <button
                                  onClick={() => handleRevokeUser(targetUser.id)}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  title="승인 취소"
                                >
                                  <FiUserX className="w-4 h-4 mr-1" />
                                  승인 취소
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(targetUser.id, targetUser.name)}
                                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                title="사용자 삭제"
                              >
                                <FiTrash2 className="w-4 h-4 mr-1" />
                                삭제
                              </button>
                            </>
                          ) : (
                            // 승인 대기 사용자
                            <>
                              <button
                                onClick={() => handleApproveUser(targetUser.id)}
                                className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <FiUserCheck className="w-4 h-4 mr-1" />
                                승인
                              </button>
                              <button
                                onClick={() => handleDeleteUser(targetUser.id, targetUser.name)}
                                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <FiTrash2 className="w-4 h-4 mr-1" />
                                거부
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 사용자 정보 수정 모달 */}
        <UserEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          user={editingUser}
          onUserUpdated={handleUserUpdated}
          currentUserId={user?.id || 0}
        />
      </div>
    </Layout>
  );
}