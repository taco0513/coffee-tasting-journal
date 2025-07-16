import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { FONT_SIZE } from '../../constants/typography';

interface AutocompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (item: string) => void;
  onBlur?: () => void;
  suggestions: string[];
  placeholder: string;
  label?: string;
  maxSuggestions?: number;
  disabled?: boolean;
  style?: any;
  inputStyle?: any;
  containerStyle?: any;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChangeText,
  onSelect,
  onBlur,
  suggestions,
  placeholder,
  label,
  maxSuggestions = 10,
  disabled = false,
  style,
  inputStyle,
  containerStyle,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<View>(null);

  // Sync internal value with prop value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Show/hide suggestions based on focus and suggestions availability
  useEffect(() => {
    const shouldShow = inputFocused && 
                      suggestions.length > 0 && 
                      internalValue.length > 0 &&
                      !disabled;
    
    setShowSuggestions(shouldShow);
    
    // Reset selected index when suggestions change
    if (shouldShow) {
      setSelectedIndex(-1);
    }
  }, [inputFocused, suggestions, internalValue, disabled]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Get limited suggestions
  const limitedSuggestions = suggestions.slice(0, maxSuggestions);

  const handleSelect = (item: string, index?: number) => {
    onSelect(item);
    setShowSuggestions(false);
    setInputFocused(false);
    setSelectedIndex(-1);
    
    // Update internal value to selected item
    setInternalValue(item);
    
    // Blur the input
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleChangeText = (text: string) => {
    // Update internal value immediately for smooth typing
    setInternalValue(text);
    
    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Debounce the actual update to parent
    debounceTimer.current = setTimeout(() => {
      onChangeText(text);
      // Don't force showSuggestions here - let the parent component handle it
    }, 300); // 300ms delay for Korean IME
  };

  const handleFocus = () => {
    if (disabled) return;
    setInputFocused(true);
  };

  const handleBlur = () => {
    // Clear any pending debounce and update immediately
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      onChangeText(internalValue);
    }
    
    // Delay hiding suggestions to allow for touch events
    setTimeout(() => {
      setInputFocused(false);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      
      // Call parent onBlur if provided
      if (onBlur) {
        onBlur();
      }
    }, 150);
  };

  const handleKeyPress = (event: any) => {
    if (!showSuggestions || limitedSuggestions.length === 0) return;

    const { nativeEvent } = event;
    
    if (nativeEvent.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(prev => 
        prev < limitedSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (nativeEvent.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : limitedSuggestions.length - 1
      );
    } else if (nativeEvent.key === 'Enter' || nativeEvent.key === 'Tab') {
      event.preventDefault();
      if (selectedIndex >= 0) {
        handleSelect(limitedSuggestions[selectedIndex], selectedIndex);
      }
    } else if (nativeEvent.key === 'Escape') {
      event.preventDefault();
      setShowSuggestions(false);
      setSelectedIndex(-1);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };


  const renderSuggestions = () => {
    if (!showSuggestions || limitedSuggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <ScrollView
          style={styles.suggestionsList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {limitedSuggestions.map((item, index) => (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={[
                styles.suggestionItem,
                selectedIndex === index && styles.suggestionItemSelected,
                index === limitedSuggestions.length - 1 && styles.suggestionItemLast,
              ]}
              onPress={() => handleSelect(item, index)}
              activeOpacity={0.7}
            >
              <Text 
                style={[
                  styles.suggestionText,
                  selectedIndex === index && styles.suggestionTextSelected,
                ]}
                numberOfLines={1}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View 
        ref={containerRef}
        style={[styles.inputGroup, style]}
      >
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={inputRef}
          style={[styles.input, inputStyle, disabled && styles.inputDisabled]}
          value={internalValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={Platform.OS === 'web' ? handleKeyPress : undefined}
          placeholder={placeholder}
          placeholderTextColor={Colors.PLACEHOLDER}
          autoCapitalize="none"
          autoCorrect={false}
          autoCompleteType="off"
          textContentType="none"
          importantForAutofill="no"
          keyboardType="default"
          returnKeyType="done"
          blurOnSubmit={true}
          editable={!disabled}
          multiline={false}
          selectTextOnFocus={false}
        />
      </View>
      
      {renderSuggestions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: FONT_SIZE.SMALL,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: FONT_SIZE.MEDIUM,
    backgroundColor: '#FAFAFA',
    color: Colors.TEXT_TERTIARY,
    minHeight: 44, // Accessibility minimum touch target
  },
  inputDisabled: {
    backgroundColor: '#F0F0F0',
    color: Colors.TEXT_DISABLED,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    minHeight: 44, // Accessibility minimum touch target
    justifyContent: 'center',
  },
  suggestionItemSelected: {
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: Colors.TEXT_TERTIARY,
  },
  suggestionTextSelected: {
    color: Colors.TEXT_PRIMARY,
    fontWeight: '500',
  },
});

export default AutocompleteInput;