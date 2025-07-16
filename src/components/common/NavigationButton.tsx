import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import {
  commonButtonStyles,
  commonTextStyles,
  hitSlop,
  HIGColors,
  HIGConstants,
} from '../../styles/common';

export type NavigationButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

interface NavigationButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: NavigationButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  fullWidth = true,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = [
      commonButtonStyles.buttonCommon,
      styles.navigationButton,
      fullWidth && styles.fullWidth,
    ];

    switch (variant) {
      case 'primary':
        baseStyle.push(commonButtonStyles.buttonPrimary);
        break;
      case 'secondary':
        baseStyle.push(commonButtonStyles.buttonSecondary);
        break;
      case 'outline':
        baseStyle.push(commonButtonStyles.buttonOutline);
        break;
      case 'text':
        baseStyle.push(styles.textButton);
        break;
    }

    if (disabled) {
      baseStyle.push(commonButtonStyles.buttonDisabled);
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle as ViewStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = [commonTextStyles.buttonText];

    switch (variant) {
      case 'primary':
      case 'secondary':
        baseTextStyle.push(commonTextStyles.buttonText);
        break;
      case 'outline':
        baseTextStyle.push(commonTextStyles.buttonTextOutline);
        break;
      case 'text':
        baseTextStyle.push(styles.textButtonText);
        break;
    }

    if (disabled) {
      baseTextStyle.push(commonTextStyles.buttonTextDisabled);
    }

    if (textStyle) {
      baseTextStyle.push(textStyle);
    }

    return baseTextStyle as TextStyle;
  };


  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop.default}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  navigationButton: {
    minHeight: HIGConstants.MIN_TOUCH_TARGET,
    paddingHorizontal: HIGConstants.SPACING_XL,
    paddingVertical: HIGConstants.SPACING_MD,
    borderRadius: HIGConstants.BORDER_RADIUS_LARGE,
    marginVertical: HIGConstants.SPACING_SM,
  },
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  textButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: HIGConstants.SPACING_MD,
  },
  textButtonText: {
    color: HIGColors.blue,
    fontSize: HIGConstants.FONT_SIZE_MEDIUM,
    fontWeight: '600',
  },
});

export default NavigationButton;