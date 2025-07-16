import { TextStyle } from 'react-native';

// 폰트 크기 상수 (최소 12pt 유지)
export const FONT_SIZE = {
  TINY: 12,      // 최소 크기 - 힌트 텍스트, 날짜 표시, 작은 라벨
  SMALL: 14,     // 작은 텍스트 - 보조 설명, 메타데이터, 라벨
  MEDIUM: 16,    // 기본 텍스트 - 본문, 입력 필드, 버튼
  LARGE: 18,     // 큰 텍스트 - 섹션 제목, 중요 정보
  XLARGE: 20,    // 더 큰 텍스트 - 아이콘, 서브 헤딩
  XXLARGE: 24,   // 매우 큰 텍스트 - 화면 제목, 점수 표시
  HUGE: 28,      // 거대한 텍스트 - 주요 화면 제목
  GIANT: 32,     // 매우 거대한 텍스트 - 통계 수치
  MEGA: 48,      // 초대형 텍스트 - 대시보드 강조 수치
} as const;

// 텍스트 스타일 프리셋
export const TEXT_STYLES = {
  // 제목 스타일
  HEADING_1: {
    fontSize: FONT_SIZE.HUGE,      // 28pt - 주요 화면 제목 (SensoryScreen, FlavorScreen 등)
    fontWeight: 'bold' as const,
  } as TextStyle,
  
  HEADING_2: {
    fontSize: FONT_SIZE.XXLARGE,   // 24pt - 서브 화면 제목, 결과 화면 점수
    fontWeight: 'bold' as const,
  } as TextStyle,
  
  HEADING_3: {
    fontSize: FONT_SIZE.XLARGE,    // 20pt - 섹션 헤더, 카드 제목
    fontWeight: '600' as const,
  } as TextStyle,
  
  // 본문 스타일
  BODY_LARGE: {
    fontSize: FONT_SIZE.LARGE,     // 18pt - 중요 본문, 커피 이름, 점수
    fontWeight: '400' as const,
  } as TextStyle,
  
  BODY: {
    fontSize: FONT_SIZE.MEDIUM,    // 16pt - 일반 본문, 입력 필드, 버튼 텍스트
    fontWeight: '400' as const,
  } as TextStyle,
  
  BODY_SMALL: {
    fontSize: FONT_SIZE.SMALL,     // 14pt - 보조 텍스트, 설명, 메타데이터
    fontWeight: '400' as const,
  } as TextStyle,
  
  // 캡션 스타일
  CAPTION: {
    fontSize: FONT_SIZE.TINY,      // 12pt - 최소 텍스트, 힌트, 날짜
    fontWeight: '400' as const,
  } as TextStyle,
  
  // 버튼 스타일
  BUTTON: {
    fontSize: FONT_SIZE.MEDIUM,    // 16pt - 버튼 텍스트
    fontWeight: '600' as const,
  } as TextStyle,
  
  BUTTON_LARGE: {
    fontSize: FONT_SIZE.LARGE,     // 18pt - 큰 버튼 텍스트
    fontWeight: '600' as const,
  } as TextStyle,
  
  // 라벨 스타일
  LABEL: {
    fontSize: FONT_SIZE.SMALL,     // 14pt - 입력 필드 라벨
    fontWeight: '600' as const,
  } as TextStyle,
  
  // 링크 스타일
  LINK: {
    fontSize: FONT_SIZE.MEDIUM,    // 16pt - 링크 텍스트
    fontWeight: '400' as const,
  } as TextStyle,
} as const;

// 줄 높이 계산 함수 (폰트 크기의 1.4배)
export const getLineHeight = (fontSize: number): number => {
  return Math.round(fontSize * 1.4);
};

// 반응형 폰트 크기 계산 함수 (추후 구현 가능)
export const getResponsiveFontSize = (baseSize: number): number => {
  // 현재는 기본 크기 반환, 추후 화면 크기에 따른 조정 가능
  return baseSize;
};