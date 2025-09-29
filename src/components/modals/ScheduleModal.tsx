import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiCalendar, FiClock, FiMapPin, FiFileText } from 'react-icons/fi';
import { ScheduleForm, Schedule } from '@/types';
import { scheduleAPI } from '@/utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schedule?: Schedule; // 수정 모드일 때 전달
  defaultDate?: Date; // 기본 선택 날짜
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSuccess,
  schedule,
  defaultDate
}: ScheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!schedule;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<ScheduleForm>();

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && schedule) {
        // 수정 모드: 기존 데이터로 폼 채우기
        setValue('title', schedule.title);
        setValue('description', schedule.description || '');
        setValue('date', schedule.date);
        setValue('start_time', schedule.start_time);
        setValue('end_time', schedule.end_time);
        setValue('location', schedule.location || '');
        setValue('location_detail', schedule.location_detail || '');
      } else {
        // 생성 모드: 기본값 설정
        reset();
        if (defaultDate) {
          setValue('date', format(defaultDate, 'yyyy-MM-dd'));
        }
      }
    }
  }, [isOpen, isEditMode, schedule, defaultDate, setValue, reset]);

  const onSubmit = async (data: ScheduleForm) => {
    try {
      setIsSubmitting(true);

      // 시간 검증
      if (data.start_time >= data.end_time) {
        toast.error('종료 시간은 시작 시간보다 늦어야 합니다.');
        return;
      }

      if (isEditMode && schedule) {
        // 수정
        await scheduleAPI.updateSchedule(schedule.id, data);
        toast.success('일정이 수정되었습니다.');
      } else {
        // 생성
        await scheduleAPI.createSchedule(data);
        toast.success('일정이 생성되었습니다.');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || '일정 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? '일정 수정' : '새 일정 만들기'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* 제목 */}
          <div className="form-group">
            <label className="form-label flex items-center">
              <FiFileText className="w-4 h-4 mr-2" />
              제목 *
            </label>
            <input
              {...register('title', {
                required: '제목을 입력해주세요.',
                maxLength: {
                  value: 200,
                  message: '제목은 200자 이하로 입력해주세요.'
                }
              })}
              type="text"
              className="form-input"
              placeholder="테니스 일정 제목을 입력하세요"
            />
            {errors.title && (
              <p className="form-error">{errors.title.message}</p>
            )}
          </div>

          {/* 설명 */}
          <div className="form-group">
            <label className="form-label">설명</label>
            <textarea
              {...register('description')}
              className="form-textarea"
              placeholder="일정에 대한 상세 설명을 입력하세요"
              rows={3}
            />
          </div>

          {/* 날짜 및 시간 */}
          {/* 날짜 */}
          <div className="form-group">
            <label className="form-label flex items-center">
              <FiCalendar className="w-4 h-4 mr-2" />
              날짜 *
            </label>
            <input
              {...register('date', {
                required: '날짜를 선택해주세요.'
              })}
              type="date"
              className="form-input"
            />
            {errors.date && (
              <p className="form-error">{errors.date.message}</p>
            )}
          </div>


          {/* 시작 시간 */}
          <div className="form-group">
            <label className="form-label flex items-center">
              <FiClock className="w-4 h-4 mr-2" />
              시작 *
            </label>
            <input
              {...register('start_time', {
                required: '시작 시간을 입력해주세요.'
              })}
              type="time"
              className="form-input"
            />
            {errors.start_time && (
              <p className="form-error">{errors.start_time.message}</p>
            )}
          </div>

          {/* 종료 시간 */}
          <div className="form-group">
            <label className="form-label">종료 *</label>
            <input
              {...register('end_time', {
                required: '종료 시간을 입력해주세요.'
              })}
              type="time"
              className="form-input"
            />
            {errors.end_time && (
              <p className="form-error">{errors.end_time.message}</p>
            )}
          </div>

          {/* 장소 */}
          <div className="form-group">
            <label className="form-label flex items-center">
              <FiMapPin className="w-4 h-4 mr-2" />
              장소
            </label>
            <input
              {...register('location', {
                maxLength: {
                  value: 500,
                  message: '장소는 500자 이하로 입력해주세요.'
                }
              })}
              type="text"
              className="form-input"
              placeholder="테니스장 이름 또는 주소"
            />
            {errors.location && (
              <p className="form-error">{errors.location.message}</p>
            )}
          </div>

          {/* 장소 상세 */}
          <div className="form-group">
            <label className="form-label">장소 상세</label>
            <textarea
              {...register('location_detail')}
              className="form-textarea"
              placeholder="장소에 대한 상세 정보 (코트 번호, 주차 정보 등)"
              rows={2}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  처리 중...
                </div>
              ) : (
                isEditMode ? '수정하기' : '만들기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}