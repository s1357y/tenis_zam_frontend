/**
 * 전화번호 포맷팅 유틸리티 함수들
 */

/**
 * 숫자만 추출하여 전화번호 포맷팅
 * @param value 입력값
 * @returns 포맷팅된 전화번호 (010-xxxx-xxxx)
 */
export const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, '');
  
  // 010으로 시작하는 11자리 숫자인지 확인
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else if (numbers.length <= 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  } else {
    // 11자리를 초과하면 11자리까지만 사용
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
};

/**
 * 전화번호 유효성 검증
 * @param phone 포맷팅된 전화번호
 * @returns 유효성 검증 결과
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * 전화번호에서 하이픈 제거
 * @param phone 포맷팅된 전화번호
 * @returns 숫자만 포함된 전화번호
 */
export const removePhoneFormatting = (phone: string): string => {
  return phone.replace(/-/g, '');
};

/**
 * 전화번호 입력 핸들러 (자동 포맷팅)
 * @param value 입력값
 * @param onChange 변경 이벤트 핸들러
 */
export const handlePhoneInputChange = (
  value: string,
  onChange: (value: string) => void
) => {
  const formatted = formatPhoneNumber(value);
  onChange(formatted);
};
