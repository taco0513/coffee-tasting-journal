import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface AutocompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (item: string) => void;
  suggestions: string[];
  placeholder: string;
  label: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChangeText,
  onSelect,
  suggestions,
  placeholder,
  label,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    // Show suggestions when input is focused and there are suggestions
    setShowSuggestions(inputFocused && suggestions.length > 0 && value.length > 0);
  }, [inputFocused, suggestions, value]);

  const handleSelect = (item: string) => {
    onSelect(item);
    setShowSuggestions(false);
    setInputFocused(false);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    setShowSuggestions(true);
  };

  const handleFocus = () => {
    setInputFocused(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for touch events
    setTimeout(() => {
      setInputFocused(false);
      setShowSuggestions(false);
    }, 150);
  };


  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <View style={[styles.suggestionsList, { maxHeight: 200 }]}>
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={`${item}-${index}`}
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
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
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: 'white',  // 추가
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 9999,  // 1000에서 9999로 증가
    elevation: 10,  // 5에서 10으로 증가
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },  // 2에서 4로 증가
    shadowOpacity: 0.2,  // 0.1에서 0.2로 증가
    shadowRadius: 6,  // 4에서 6으로 증가
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AutocompleteInput;