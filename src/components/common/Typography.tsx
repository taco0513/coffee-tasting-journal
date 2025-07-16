import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface TypographyProps extends TextProps {
  color?: string;
  children: React.ReactNode;
}

/**
 * Typography Components for consistent text styling
 * 
 * Usage examples:
 * 
 * <Heading1>Main Title</Heading1>
 * <Heading1 color={Colors.SUCCESS_GREEN}>Green Title</Heading1>
 * <Heading1 style={{ marginBottom: 20 }}>Custom Margin Title</Heading1>
 * 
 * <Heading2>Section Header</Heading2>
 * <Heading3>Subsection Header</Heading3>
 * 
 * <BodyText>Regular paragraph text goes here...</BodyText>
 * <BodyText color={Colors.TEXT_SECONDARY}>Secondary text</BodyText>
 * 
 * <Caption>Small helper text</Caption>
 * <Caption color={Colors.TEXT_DISABLED}>Disabled caption</Caption>
 */

export const Heading1: React.FC<TypographyProps> = ({ 
  color = Colors.TEXT_PRIMARY, 
  style, 
  children, 
  allowFontScaling = true,
  ...props 
}) => {
  return (
    <Text 
      style={[styles.heading1, { color }, style]} 
      allowFontScaling={allowFontScaling}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Heading2: React.FC<TypographyProps> = ({ 
  color = Colors.TEXT_PRIMARY, 
  style, 
  children, 
  allowFontScaling = true,
  ...props 
}) => {
  return (
    <Text 
      style={[styles.heading2, { color }, style]} 
      allowFontScaling={allowFontScaling}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Heading3: React.FC<TypographyProps> = ({ 
  color = Colors.TEXT_PRIMARY, 
  style, 
  children, 
  allowFontScaling = true,
  ...props 
}) => {
  return (
    <Text 
      style={[styles.heading3, { color }, style]} 
      allowFontScaling={allowFontScaling}
      {...props}
    >
      {children}
    </Text>
  );
};

export const BodyText: React.FC<TypographyProps> = ({ 
  color = Colors.TEXT_PRIMARY, 
  style, 
  children, 
  allowFontScaling = true,
  ...props 
}) => {
  return (
    <Text 
      style={[styles.bodyText, { color }, style]} 
      allowFontScaling={allowFontScaling}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Caption: React.FC<TypographyProps> = ({ 
  color = Colors.TEXT_SECONDARY, 
  style, 
  children, 
  allowFontScaling = true,
  ...props 
}) => {
  return (
    <Text 
      style={[styles.caption, { color }, style]} 
      allowFontScaling={allowFontScaling}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  heading3: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  bodyText: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 18,
  },
});