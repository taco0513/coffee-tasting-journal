import { useToastStore } from '../stores/toastStore';

// Toast 유틸리티 함수들
export const showSuccessToast = (title: string, message?: string) => {
  const { showSuccessToast } = useToastStore.getState();
  showSuccessToast(title, message);
};

export const showErrorToast = (title: string, message?: string) => {
  const { showErrorToast } = useToastStore.getState();
  showErrorToast(title, message);
};

export const showInfoToast = (title: string, message?: string) => {
  const { showInfoToast } = useToastStore.getState();
  showInfoToast(title, message);
};

export const hideToast = () => {
  const { hideToast } = useToastStore.getState();
  hideToast();
};

// 사용 예시
export const toastExamples = {
  // 저장 성공
  saveSuccess: () => showSuccessToast('저장 완료', '테이스팅이 저장되었습니다'),
  
  // 저장 실패
  saveError: () => showErrorToast('저장 실패', '저장에 실패했습니다'),
  
  // 삭제 성공
  deleteSuccess: () => showSuccessToast('삭제 완료', '테이스팅이 삭제되었습니다'),
  
  // 삭제 실패
  deleteError: () => showErrorToast('삭제 실패', '삭제에 실패했습니다'),
  
  // 네트워크 에러
  networkError: () => showErrorToast('네트워크 오류', '인터넷 연결을 확인해주세요'),
  
  // 정보 알림
  infoMessage: () => showInfoToast('알림', '새로운 업데이트가 있습니다'),
};