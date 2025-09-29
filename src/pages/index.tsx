import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ko';
import ScheduleModal from '@/components/modals/ScheduleModal';
import ScheduleDetailModal from '@/components/modals/ScheduleDetailModal';
import { scheduleAPI } from '@/utils/api';
import { Schedule, CalendarView, ScheduleDetail } from '@/types';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FiCalendar, FiList, FiPlus, FiMapPin, FiClock, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// moment 로케일 설정
moment.locale('ko');

// react-big-calendar 로컬라이저 설정
const localizer = momentLocalizer(moment);

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<CalendarView>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleDetail | null>(null);
  const [calendarView, setCalendarView] = useState<any>(Views.MONTH);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  // 일정 데이터 로드 함수
  const loadSchedules = useCallback(async () => {
    try {
      setIsLoadingSchedules(true);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const data = await scheduleAPI.getSchedules(year, month);
      setSchedules(data);
    } catch (error: any) {
      toast.error(error.message || '일정을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingSchedules(false);
    }
  }, [selectedDate]);

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // 일정 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadSchedules();
    }
  }, [isAuthenticated, loadSchedules]);

  // 컴포넌트 언마운트 시 타임아웃 클리어
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  // 특정 날짜의 일정 조회
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => 
      isSameDay(parseISO(schedule.date), date)
    );
  };

  // 일정 클릭 핸들러
  const handleScheduleClick = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
    setShowDetailModal(true);
  };

  // 일정 수정 핸들러
  const handleEditSchedule = (schedule: ScheduleDetail) => {
    setEditingSchedule(schedule);
    setShowDetailModal(false);
    setShowCreateModal(true);
  };

  // 모달 성공 핸들러
  const handleModalSuccess = () => {
    loadSchedules();
    setEditingSchedule(null);
  };

  // 모달 닫기 핸들러
  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setEditingSchedule(null);
    setSelectedScheduleId(null);
  };

  // react-big-calendar용 이벤트 데이터 변환
  const events = schedules.map(schedule => {
    // date가 ISO 문자열인 경우 YYYY-MM-DD 형식으로 변환
    let dateStr;
    if (schedule.date.includes('T')) {
      // UTC 날짜를 로컬 날짜로 변환
      const utcDate = new Date(schedule.date);
      // getTimezoneOffset()은 음수이므로 빼기
      const localDate = new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
      dateStr = localDate.toISOString().split('T')[0];
    } else {
      dateStr = schedule.date;
    }
    
    const startDate = new Date(`${dateStr}T${schedule.start_time}`);
    const endDate = new Date(`${dateStr}T${schedule.end_time}`);
    
    return {
      id: schedule.id,
      title: schedule.title,
      start: startDate,
      end: endDate,
      resource: schedule
    };
  });

  // 이벤트 선택 핸들러
  const handleSelectEvent = (event: any) => {
    handleScheduleClick(event.id);
  };

  // 더블 클릭 핸들러 (일정 추가)
  const handleDoubleClickEvent = (event: any) => {
    // 이벤트 더블 클릭 시에는 아무것도 하지 않음
  };

  // 날짜 선택 핸들러 (더블 클릭 감지)
  const handleSelectSlot = (slotInfo: any) => {
    // 기존 타임아웃이 있으면 클리어
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      // 더블 클릭으로 간주하고 모달 열기
      setSelectedDate(slotInfo.start);
      setShowCreateModal(true);
    } else {
      // 첫 번째 클릭 - 300ms 후에 타임아웃 설정
      const timeout = setTimeout(() => {
        setClickTimeout(null);
        // 단일 클릭으로 간주 - 아무것도 하지 않음
      }, 300);
      setClickTimeout(timeout);
    }
  };

  // 로딩 중이거나 인증되지 않은 경우
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const selectedDateSchedules = getSchedulesForDate(selectedDate);

  return (
    <Layout title="테니스 캘린더">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {format(selectedDate, 'yyyy년 M월', { locale: ko })}
            </h1>
            <p className="text-gray-600">
              {user?.name}님, 안녕하세요! 이번 달 테니스 일정을 확인해보세요.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* 뷰 전환 버튼 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('calendar')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiCalendar className="w-4 h-4 mr-2 inline" />
                캘린더
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiList className="w-4 h-4 mr-2 inline" />
                목록
              </button>
            </div>

            {/* 일정 추가 버튼 */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              일정 추가
            </button>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 캘린더/목록 뷰 */}
          <div className="xl:col-span-3">
            {view === 'calendar' ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCalendarView(Views.MONTH)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        calendarView === Views.MONTH
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      월
                    </button>
                    <button
                      onClick={() => setCalendarView(Views.WEEK)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        calendarView === Views.WEEK
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      주
                    </button>
                    <button
                      onClick={() => setCalendarView(Views.DAY)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        calendarView === Views.DAY
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      일
                    </button>
                  </div>
                </div>
                <div style={{ height: '600px' }}>
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    view={calendarView}
                    onView={setCalendarView}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    onDoubleClickEvent={handleDoubleClickEvent}
                    selectable
                    popup
                    step={30}
                    timeslots={2}
                    messages={{
                      next: '다음',
                      previous: '이전',
                      today: '오늘',
                      month: '월',
                      week: '주',
                      day: '일',
                      agenda: '일정',
                      date: '날짜',
                      time: '시간',
                      event: '이벤트',
                      noEventsInRange: '이 기간에 일정이 없습니다.',
                      showMore: (total: number) => `+${total}개 더 보기`
                    }}
                    eventPropGetter={(event, start, end, isSelected) => {
                      const isMonthView = calendarView === Views.MONTH;
                      return {
                        style: {
                          backgroundColor: '#3B82F6',
                          border: 'none',
                          borderRadius: '3px',
                          color: 'white',
                          fontSize: isMonthView ? '11px' : '12px',
                          padding: isMonthView ? '1px 3px' : '2px 4px',
                          fontWeight: '500',
                          height: isMonthView ? '18px' : 'auto',
                          lineHeight: isMonthView ? '16px' : '1.2',
                          minHeight: isMonthView ? '18px' : '20px'
                        }
                      };
                    }}
                    components={{
                      event: ({ event }: any) => (
                        <div className="rbc-event-content">
                          <div className="font-medium text-xs truncate">{event.title}</div>
                          {calendarView !== Views.MONTH && (
                            <div className="text-xs opacity-90">
                              {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                            </div>
                          )}
                        </div>
                      )
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-medium text-gray-900">
                    이번 달 일정 목록
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {isLoadingSchedules ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">일정을 불러오는 중...</p>
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">이번 달에 등록된 일정이 없습니다.</p>
                    </div>
                  ) : (
                    schedules.map((schedule) => (
                      <div 
                        key={schedule.id} 
                        className="p-6 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleScheduleClick(schedule.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900">
                              {schedule.title}
                            </h4>
                            {schedule.description && (
                              <p className="mt-1 text-gray-600">{schedule.description}</p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <FiCalendar className="w-4 h-4 mr-1" />
                                {format(parseISO(schedule.date), 'M월 d일 (EEEE)', { locale: ko })}
                              </span>
                              <span className="flex items-center">
                                <FiClock className="w-4 h-4 mr-1" />
                                {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                              </span>
                              {schedule.location && (
                                <span className="flex items-center">
                                  <FiMapPin className="w-4 h-4 mr-1" />
                                  {schedule.location}
                                </span>
                              )}
                              <span className="flex items-center">
                                <FiUsers className="w-4 h-4 mr-1" />
                                참여: {schedule.confirmed_count || 0}명
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 사이드바 - 선택된 날짜의 일정 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })} 일정
              </h3>
              {selectedDateSchedules.length === 0 ? (
                <p className="text-gray-500 text-sm">이 날에는 일정이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-3 border border-gray-200 rounded-md hover:border-blue-300 cursor-pointer transition-colors"
                      onClick={() => handleScheduleClick(schedule.id)}
                    >
                      <h4 className="font-medium text-gray-900">{schedule.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                      </p>
                      {schedule.location && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                          <FiMapPin className="w-3 h-3 mr-1" />
                          {schedule.location}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <FiUsers className="w-3 h-3 mr-1" />
                        참여: {schedule.confirmed_count || 0}명
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 일정 생성/수정 모달 */}
      <ScheduleModal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onSuccess={handleModalSuccess}
        schedule={editingSchedule || undefined}
        defaultDate={selectedDate}
      />

      {/* 일정 상세보기 모달 */}
      <ScheduleDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModals}
        scheduleId={selectedScheduleId}
        onEdit={handleEditSchedule}
        onDelete={handleModalSuccess}
      />
    </Layout>
  );
}