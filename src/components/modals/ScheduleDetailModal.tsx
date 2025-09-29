import React, { useState, useEffect, useCallback } from 'react';
import { FiX, FiCalendar, FiClock, FiMapPin, FiUser, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { ScheduleDetail, ParticipationStatus, User } from '@/types';
import { scheduleAPI, userAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface ScheduleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: number | null;
  onEdit: (schedule: ScheduleDetail) => void;
  onDelete: () => void;
}

export default function ScheduleDetailModal({
  isOpen,
  onClose,
  scheduleId,
  onEdit,
  onDelete
}: ScheduleDetailModalProps) {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingParticipation, setIsUpdatingParticipation] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);

  // 일정 상세 정보 로드 함수
  const loadScheduleDetail = useCallback(async () => {
    if (!scheduleId) return;

    try {
      setIsLoading(true);
      const data = await scheduleAPI.getSchedule(scheduleId);
      setSchedule(data);
    } catch (error: any) {
      toast.error(error.message || '일정 정보를 불러오는 중 오류가 발생했습니다.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId, onClose]);

  // 사용자 목록 로드 (관리자용)
  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const usersData = await userAPI.getUsers();
      setUsers(usersData.filter(u => u.is_approved));
    } catch (error: any) {
      toast.error(error.message || '사용자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // 일정 상세 정보 로드
  useEffect(() => {
    if (isOpen && scheduleId) {
      loadScheduleDetail();
      if (user?.is_admin) {
        loadUsers();
      }
    }
  }, [isOpen, scheduleId, user, loadScheduleDetail]);

  // 참여 상태 변경 (토글 기능)
  const handleParticipationChange = async (status: ParticipationStatus) => {
    if (!schedule || !user) return;

    // 현재 선택된 상태와 같은 상태를 클릭하면 참여자 목록에서 제거
    if (myParticipation?.status === status) {
      try {
        setIsUpdatingParticipation(true);
        await scheduleAPI.removeMyParticipation(schedule.id);
        toast.success('참여 상태가 제거되었습니다.');
        
        // 상세 정보 다시 로드
        await loadScheduleDetail();
      } catch (error: any) {
        toast.error(error.message || '참여 상태 제거 중 오류가 발생했습니다.');
      } finally {
        setIsUpdatingParticipation(false);
      }
    } else {
      // 다른 상태로 변경
      try {
        setIsUpdatingParticipation(true);
        await scheduleAPI.setParticipation(schedule.id, status);
        toast.success(`참여 상태가 "${status}"으로 변경되었습니다.`);
        
        // 상세 정보 다시 로드
        await loadScheduleDetail();
      } catch (error: any) {
        toast.error(error.message || '참여 상태 변경 중 오류가 발생했습니다.');
      } finally {
        setIsUpdatingParticipation(false);
      }
    }
  };

  // 관리자용 다른 사용자 참여 상태 변경
  const handleUserParticipationChange = async (userId: number, userName: string, status: ParticipationStatus) => {
    if (!schedule) return;

    try {
      setIsUpdatingParticipation(true);
      await userAPI.setUserParticipation(schedule.id, userId, status);
      toast.success(`${userName}님의 참여 상태가 "${status}"으로 변경되었습니다.`);
      
      // 상세 정보 다시 로드
      await loadScheduleDetail();
    } catch (error: any) {
      toast.error(error.message || '참여 상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdatingParticipation(false);
    }
  };

  // 참여자 추가
  const handleAddParticipant = async (userId: number) => {
    if (!schedule) return;
    
    const selectedUser = users.find(u => u.id === userId);
    if (!selectedUser) return;

    await handleUserParticipationChange(userId, selectedUser.name, '미정');
    setShowAddParticipant(false);
  };

  // 참여자 제거
  const handleRemoveParticipant = async (userId: number, userName: string) => {
    if (!schedule) return;

    if (window.confirm(`${userName}님을 참여자 목록에서 제거하시겠습니까?`)) {
      try {
        setIsUpdatingParticipation(true);
        // 참여자 완전 제거
        await userAPI.removeParticipant(schedule.id, userId);
        toast.success(`${userName}님이 참여자 목록에서 제거되었습니다.`);
        
        await loadScheduleDetail();
      } catch (error: any) {
        toast.error(error.message || '참여자 제거 중 오류가 발생했습니다.');
      } finally {
        setIsUpdatingParticipation(false);
      }
    }
  };

  // 일정 삭제
  const handleDelete = async () => {
    if (!schedule) return;

    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      try {
        await scheduleAPI.deleteSchedule(schedule.id);
        toast.success('일정이 삭제되었습니다.');
        onDelete();
        onClose();
      } catch (error: any) {
        toast.error(error.message || '일정 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  if (!isOpen) return null;

  // 현재 사용자의 참여 상태 찾기
  const myParticipation = schedule?.participants.find(p => p.user_id === user?.id);
  const canEdit = user && schedule && (schedule.created_by === user.id || user.is_admin);
  const canDelete = user && schedule && (schedule.created_by === user.id || user.is_admin);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">일정 상세</h2>
          <div className="flex items-center space-x-2">
            {canEdit ? (
              <button
                onClick={() => schedule && onEdit(schedule)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="수정"
              >
                <FiEdit2 className="w-5 h-5" />
              </button>
            ) : null}
            {canDelete ? (
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="삭제"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-600">일정 정보를 불러오는 중...</p>
            </div>
          ) : schedule ? (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {schedule.title}
                </h3>
                {schedule.description && (
                  <p className="text-gray-600">{schedule.description}</p>
                )}
              </div>

              {/* 일시 및 장소 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <FiCalendar className="w-5 h-5 mr-3 text-blue-500" />
                  <span>
                    {format(parseISO(schedule.date), 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiClock className="w-5 h-5 mr-3 text-blue-500" />
                  <span>
                    {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                  </span>
                </div>
                {schedule.location && (
                  <div className="md:col-span-2 flex items-center text-gray-600">
                    <FiMapPin className="w-5 h-5 mr-3 text-blue-500" />
                    <span>{schedule.location}</span>
                  </div>
                )}
                {schedule.location_detail && (
                  <div className="md:col-span-2 text-gray-600 ml-8">
                    <p className="text-sm">{schedule.location_detail}</p>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <FiUser className="w-5 h-5 mr-3 text-blue-500" />
                  <span>작성자: {schedule.created_by_name}</span>
                </div>
              </div>

              {/* 참여 상태 변경 */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">내 참여 상태</h4>
                <div className="flex space-x-3">
                  {(['참여', '불참', '미정'] as ParticipationStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleParticipationChange(status)}
                      disabled={isUpdatingParticipation}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        myParticipation?.status === status
                          ? status === '참여'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : status === '불참'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-300'
                          : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                {isUpdatingParticipation && (
                  <p className="mt-2 text-sm text-gray-500">참여 상태를 변경하는 중...</p>
                )}
              </div>

              {/* 참여자 목록 */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    참여자 ({schedule.participants.length}명)
                  </h4>
                  {user?.is_admin ? (
                    <button
                      onClick={() => setShowAddParticipant(!showAddParticipant)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      disabled={isUpdatingParticipation}
                    >
                      {showAddParticipant ? '취소' : '참여자 추가'}
                    </button>
                  ) : null}
                </div>

                {/* 참여자 추가 드롭다운 (관리자용) */}
                {user?.is_admin && showAddParticipant ? (
                  <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">사용자 선택</h5>
                    {isLoadingUsers ? (
                      <p className="text-sm text-gray-500">사용자 목록을 불러오는 중...</p>
                    ) : (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {users
                          .filter(u => !schedule.participants.some(p => p.user_id === u.id))
                          .map((userData) => (
                            <button
                              key={userData.id}
                              onClick={() => handleAddParticipant(userData.id)}
                              className="w-full text-left p-2 text-sm hover:bg-blue-100 rounded"
                              disabled={isUpdatingParticipation}
                            >
                              {userData.name} ({userData.phone})
                            </button>
                          ))}
                        {users.filter(u => !schedule.participants.some(p => p.user_id === u.id)).length === 0 && (
                          <p className="text-sm text-gray-500">추가할 수 있는 사용자가 없습니다.</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}

                {schedule.participants.length === 0 ? (
                  <p className="text-gray-500">아직 참여자가 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {schedule.participants.map((participant) => (
                      <div
                        key={participant.user_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {participant.user_name}
                          </span>
                          <span className="text-gray-500 text-sm ml-2">
                            {participant.user_phone}
                          </span>
                        </div>
                        
                        {/* 관리자용 참여 상태 변경 버튼 */}
                        {user?.is_admin && participant.user_id !== user.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              {(['참여', '불참', '미정'] as ParticipationStatus[]).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handleUserParticipationChange(participant.user_id, participant.user_name, status)}
                                  disabled={isUpdatingParticipation}
                                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                    participant.status === status
                                      ? status === '참여'
                                        ? 'bg-green-100 text-green-800 border border-green-300'
                                        : status === '불참'
                                        ? 'bg-red-100 text-red-800 border border-red-300'
                                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => handleRemoveParticipant(participant.user_id, participant.user_name)}
                              className="text-red-600 hover:text-red-800 text-xs"
                              disabled={isUpdatingParticipation}
                              title="참여자 제거"
                            >
                              제거
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              participant.status === '참여'
                                ? 'bg-green-100 text-green-800'
                                : participant.status === '불참'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {participant.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">일정 정보를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}