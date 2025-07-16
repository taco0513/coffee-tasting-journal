import { StyleSheet, Platform } from 'react-native';

// Apple HIG 기준 공통 스타일 정의
export const HIGConstants = {
  // 터치 타겟 최소 크기 (44pt)
  MIN_TOUCH_TARGET: 44,
  
  // 기본 패딩
  HORIZONTAL_PADDING: 16,
  VERTICAL_PADDING: 12,
  
  // 버튼 높이
  BUTTON_HEIGHT_LARGE: 50,
  BUTTON_HEIGHT_MEDIUM: 44,
  BUTTON_HEIGHT_SMALL: 36,
  
  // 폰트 크기
  FONT_SIZE_LARGE: 18,
  FONT_SIZE_MEDIUM: 16,
  FONT_SIZE_SMALL: 14,
  
  // 모서리 둥글기
  BORDER_RADIUS: 8,
  BORDER_RADIUS_LARGE: 12,
  
  // 간격
  SPACING_XS: 4,
  SPACING_SM: 8,
  SPACING_MD: 12,
  SPACING_LG: 16,
  SPACING_XL: 20,
};

// Apple HIG 색상 시스템
export const HIGColors = {
  // 시스템 색상
  blue: '#007AFF',
  green: '#2E7D32', // Updated for better contrast
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  purple: '#AF52DE',
  pink: '#FF2D92',
  
  // 그레이 스케일
  gray: '#8E8E93',
  gray2: '#AEAEB2',
  gray3: '#C7C7CC',
  gray4: '#D1D1D6',
  gray5: '#E5E5EA',
  gray6: '#F2F2F7',
  
  // 라벨 색상
  label: '#000000',
  secondaryLabel: '#3C3C43',
  tertiaryLabel: '#3C3C43',
  quaternaryLabel: '#3C3C43',
  
  // 배경 색상
  systemBackground: '#FFFFFF',
  secondarySystemBackground: '#F2F2F7',
  tertiarySystemBackground: '#FFFFFF',
  
  // 다크 모드 대응
  ...(Platform.OS === 'ios' && {
    dynamicBlue: { light: '#007AFF', dark: '#0A84FF' },
    dynamicGreen: { light: '#34C759', dark: '#30D158' },
    dynamicRed: { light: '#FF3B30', dark: '#FF453A' },
  }),
};

// 공통 버튼 스타일
export const commonButtonStyles = StyleSheet.create({
  // 기본 버튼 스타일 (Apple HIG 준수)
  buttonCommon: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    paddingHorizontal: HIGConstants.HORIZONTAL_PADDING,
    paddingVertical: HIGConstants.VERTICAL_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: HIGConstants.BORDER_RADIUS,
  },
  
  // 주요 액션 버튼 (Primary)
  buttonPrimary: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    paddingHorizontal: HIGConstants.HORIZONTAL_PADDING,
    paddingVertical: HIGConstants.VERTICAL_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: HIGConstants.BORDER_RADIUS,
    backgroundColor: HIGColors.blue,
  },
  
  // 성공/확인 버튼
  buttonSuccess: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    paddingHorizontal: HIGConstants.HORIZONTAL_PADDING,
    paddingVertical: HIGConstants.VERTICAL_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: HIGConstants.BORDER_RADIUS,
    backgroundColor: HIGColors.green,
  },
  
  // 위험/삭제 버튼
  buttonDanger: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    paddingHorizontal: HIGConstants.HORIZONTAL_PADDING,
    paddingVertical: HIGConstants.VERTICAL_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: HIGConstants.BORDER_RADIUS,
    backgroundColor: HIGColors.red,
  },
  
  // 보조 버튼 (Secondary)
  buttonSecondary: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    paddingHorizontal: HIGConstants.HORIZONTAL_PADDING,
    paddingVertical: HIGConstants.VERTICAL_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: HIGConstants.BORDER_RADIUS,
    backgroundColor: HIGColors.gray,
  },
  
  // 비활성화 버튼
  buttonDisabled: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    paddingHorizontal: HIGConstants.HORIZONTAL_PADDING,
    paddingVertical: HIGConstants.VERTICAL_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: HIGConstants.BORDER_RADIUS,
    backgroundColor: HIGColors.gray3,
  },
  
  // 테두리 버튼 (Outline)
  buttonOutline: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    paddingHorizontal: HIGConstants.HORIZONTAL_PADDING,
    paddingVertical: HIGConstants.VERTICAL_PADDING,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: HIGConstants.BORDER_RADIUS,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: HIGColors.blue,
  },
  
  // 큰 버튼 (Large)
  buttonLarge: {
    minHeight: HIGConstants.BUTTON_HEIGHT_LARGE,
    paddingHorizontal: HIGConstants.SPACING_XL,
    paddingVertical: HIGConstants.SPACING_MD,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: HIGConstants.BORDER_RADIUS_LARGE,
  },
  
  // 작은 버튼 (Small) - 시각적으로는 작지만 터치 영역은 44pt 유지
  buttonSmall: {
    minHeight: HIGConstants.BUTTON_HEIGHT_SMALL,
    paddingHorizontal: HIGConstants.SPACING_MD,
    paddingVertical: HIGConstants.SPACING_SM,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: HIGConstants.BORDER_RADIUS,
  },
});

// 공통 텍스트 스타일
export const commonTextStyles = StyleSheet.create({
  // 버튼 텍스트
  buttonText: {
    fontSize: HIGConstants.FONT_SIZE_MEDIUM,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  // 버튼 텍스트 (큰 버튼용)
  buttonTextLarge: {
    fontSize: HIGConstants.FONT_SIZE_LARGE,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  // 버튼 텍스트 (작은 버튼용)
  buttonTextSmall: {
    fontSize: HIGConstants.FONT_SIZE_SMALL,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  // 테두리 버튼 텍스트
  buttonTextOutline: {
    fontSize: HIGConstants.FONT_SIZE_MEDIUM,
    fontWeight: '600',
    color: HIGColors.blue,
    textAlign: 'center',
  },
  
  // 비활성화 버튼 텍스트
  buttonTextDisabled: {
    fontSize: HIGConstants.FONT_SIZE_MEDIUM,
    fontWeight: '600',
    color: HIGColors.gray,
    textAlign: 'center',
  },
});

// 터치 영역 확장을 위한 hitSlop 설정
export const hitSlop = {
  // 기본 터치 영역 (44pt 보장)
  default: { top: 8, bottom: 8, left: 8, right: 8 },
  
  // 작은 버튼용 터치 영역 확장
  small: { top: 12, bottom: 12, left: 12, right: 12 },
  
  // 매우 작은 요소용 터치 영역 확장
  tiny: { top: 16, bottom: 16, left: 16, right: 16 },
};

// Add HIT_SLOP constant for backward compatibility
HIGConstants.HIT_SLOP = hitSlop.default;

// 공통 레이아웃 스타일
export const commonLayoutStyles = StyleSheet.create({
  // 버튼 컨테이너
  buttonContainer: {
    padding: HIGConstants.SPACING_LG,
    gap: HIGConstants.SPACING_MD,
  },
  
  // 수평 버튼 컨테이너
  buttonContainerHorizontal: {
    flexDirection: 'row',
    padding: HIGConstants.SPACING_LG,
    gap: HIGConstants.SPACING_MD,
  },
  
  // 버튼 그룹 (여러 버튼이 함께)
  buttonGroup: {
    flexDirection: 'row',
    gap: HIGConstants.SPACING_SM,
  },
  
  // 풀 너비 버튼
  buttonFullWidth: {
    width: '100%',
  },
  
  // 플렉스 버튼 (같은 크기로)
  buttonFlex: {
    flex: 1,
  },
});

// 그림자 스타일 (iOS용)
export const shadowStyles = StyleSheet.create({
  buttonShadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  }),
  
  cardShadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.15,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
});

// 사용 예시 헬퍼
export const createButtonStyle = (
  type: 'primary' | 'success' | 'danger' | 'secondary' | 'outline' = 'primary',
  size: 'small' | 'medium' | 'large' = 'medium',
  disabled: boolean = false
) => {
  const baseStyle = [commonButtonStyles.buttonCommon];
  
  // 타입별 스타일
  switch (type) {
    case 'primary':
      baseStyle.push(commonButtonStyles.buttonPrimary);
      break;
    case 'success':
      baseStyle.push(commonButtonStyles.buttonSuccess);
      break;
    case 'danger':
      baseStyle.push(commonButtonStyles.buttonDanger);
      break;
    case 'secondary':
      baseStyle.push(commonButtonStyles.buttonSecondary);
      break;
    case 'outline':
      baseStyle.push(commonButtonStyles.buttonOutline);
      break;
  }
  
  // 크기별 스타일
  switch (size) {
    case 'small':
      baseStyle.push(commonButtonStyles.buttonSmall);
      break;
    case 'large':
      baseStyle.push(commonButtonStyles.buttonLarge);
      break;
  }
  
  // 비활성화 상태
  if (disabled) {
    baseStyle.push(commonButtonStyles.buttonDisabled);
  }
  
  return baseStyle;
};