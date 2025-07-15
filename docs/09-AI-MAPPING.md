# AI Mapping Logic Documentation

## Overview

The Coffee Tasting Journal implements a sophisticated AI-powered matching algorithm that compares user flavor selections and sensory evaluations with roaster notes to provide objective feedback on tasting accuracy. This document details the algorithm's architecture, implementation, and optimization strategies.

## Algorithm Architecture

### Core Components

#### 1. Text Processing Engine
```typescript
interface TextProcessor {
  normalizeText(text: string): string[];
  parseRoasterNotes(notes: string): ParsedNotes;
  extractFlavorTerms(text: string): string[];
  identifySensoryDescriptors(text: string): string[];
}
```

#### 2. Flavor Matching Engine
```typescript
interface FlavorMatcher {
  calculateFlavorMatch(roasterNotes: string, selectedFlavors: SelectedFlavors): number;
  getFlavorVariations(flavor: string): string[];
  findSemanticMatches(terms: string[]): string[];
  scoreFlavorAlignment(userFlavors: string[], roasterFlavors: string[]): number;
}
```

#### 3. Sensory Analysis Engine
```typescript
interface SensoryAnalyzer {
  calculateSensoryMatch(roasterNotes: string, sensoryAttributes: SensoryAttributes): number;
  mapSensoryTerms(terms: string[]): SensoryMapping;
  evaluateAttributeAlignment(userAttributes: SensoryAttributes, roasterTerms: string[]): number;
}
```

## Text Processing Logic

### Normalization Pipeline
```typescript
const normalizeText = (text: string): string[] => {
  // Step 1: Split by various comma types
  const parts = text.split(/[,，、]/);
  const words: string[] = [];
  
  parts.forEach(part => {
    const normalized = part
      .toLowerCase()                    // Convert to lowercase
      .replace(/[.\/#!$%\^&\*;:{}=\-_`~()]/g, ' ') // Remove punctuation
      .trim()                          // Remove whitespace
      .split(/\s+/)                    // Split by whitespace
      .filter(word => word.length > 1); // Filter short words
    
    words.push(...normalized);
  });
  
  return words;
};
```

### Semantic Analysis
```typescript
const parseRoasterNotes = (notes: string): ParsedNotes => {
  const normalized = normalizeText(notes);
  const flavors: string[] = [];
  const sensoryTerms: string[] = [];
  
  // Categorize terms using predefined dictionaries
  normalized.forEach(word => {
    if (isSensoryTerm(word)) {
      sensoryTerms.push(word);
    } else if (isFlavorTerm(word)) {
      flavors.push(word);
    }
  });
  
  return { flavors, sensoryTerms };
};
```

## Flavor Matching Algorithm

### Hierarchical Matching
The algorithm uses a 4-level hierarchical approach based on the SCA flavor wheel:

```typescript
// Level 1: Primary categories (Fruity, Floral, etc.)
// Level 2: Secondary categories (Berry, Citrus, etc.)
// Level 3: Specific flavors (Blueberry, Lemon, etc.)
// Level 4: Flavor descriptors (Bright, Sweet, etc.)

const getFlavorVariations = (flavor: string): string[] => {
  const variations = new Set<string>();
  variations.add(flavor.toLowerCase());
  
  // Add Korean translation
  const koreanTerm = flavorWheelKorean.translations[flavor];
  if (koreanTerm) {
    variations.add(koreanTerm.toLowerCase());
  }
  
  // Add parent categories
  addParentCategories(flavor, variations);
  
  // Add child categories
  addChildCategories(flavor, variations);
  
  return Array.from(variations);
};
```

### Weighted Scoring System
```typescript
const calculateFlavorMatch = (roasterNotes: string, selectedFlavors: SelectedFlavors): number => {
  const roasterWords = normalizeText(roasterNotes);
  const userFlavorSet = buildUserFlavorSet(selectedFlavors);
  
  let matchScore = 0;
  let maxPossibleScore = 0;
  
  // Score each roaster word
  roasterWords.forEach(word => {
    if (userFlavorSet.has(word)) {
      matchScore += 10; // Direct match
    } else {
      // Check for partial matches
      const partialScore = findPartialMatches(word, userFlavorSet);
      matchScore += partialScore;
    }
    maxPossibleScore += 10;
  });
  
  // Reverse scoring: user selections against roaster notes
  const reverseScore = scoreUserSelections(selectedFlavors, roasterNotes);
  
  // Combine scores with weights
  const totalScore = (matchScore + reverseScore) / (maxPossibleScore + getMaxReverseScore(selectedFlavors));
  
  return Math.round(totalScore * 100);
};
```

### Bilingual Processing
```typescript
const processBilingualText = (text: string): ProcessedText => {
  const englishTerms = extractEnglishTerms(text);
  const koreanTerms = extractKoreanTerms(text);
  
  // Cross-reference with translation dictionaries
  const translatedTerms = translateTerms(englishTerms, koreanTerms);
  
  return {
    allTerms: [...englishTerms, ...koreanTerms, ...translatedTerms],
    primaryLanguage: detectPrimaryLanguage(text),
    confidence: calculateLanguageConfidence(text)
  };
};
```

## Sensory Analysis Algorithm

### Sensory Attribute Mapping
```typescript
const sensoryKeywords = {
  body: {
    light: ['light', 'delicate', 'tea-like', '가벼운', '라이트'],
    medium: ['medium', 'balanced', '중간', '밸런스'],
    heavy: ['heavy', 'full', 'bold', '무거운', '풀바디']
  },
  acidity: {
    low: ['low acid', 'mild', 'smooth', '낮은산미', '마일드'],
    medium: ['balanced acid', 'moderate', '적당한산미'],
    high: ['bright', 'acidic', 'vibrant', '밝은', '산미']
  },
  // ... other attributes
};
```

### Sensory Matching Logic
```typescript
const calculateSensoryMatch = (roasterNotes: string, sensoryAttributes: SensoryAttributes): number => {
  const roasterWords = normalizeText(roasterNotes);
  let matchCount = 0;
  let totalChecks = 0;
  
  // Body assessment
  const bodyScore = assessBodyMatch(sensoryAttributes.body, roasterWords);
  matchCount += bodyScore.matches;
  totalChecks += bodyScore.total;
  
  // Acidity assessment
  const acidityScore = assessAcidityMatch(sensoryAttributes.acidity, roasterWords);
  matchCount += acidityScore.matches;
  totalChecks += acidityScore.total;
  
  // Other sensory attributes...
  
  const baseScore = totalChecks > 0 ? (matchCount / totalChecks) * 100 : 50;
  
  // Apply bonuses for general terms
  const bonusScore = calculateBonusScore(roasterWords);
  
  return Math.round(Math.min(100, baseScore + bonusScore));
};
```

## Scoring Algorithm

### Weighted Combination
```typescript
const calculateMatchScore = (
  roasterNotes: string,
  selectedFlavors: SelectedFlavors,
  sensoryAttributes: SensoryAttributes
): MatchScore => {
  // Individual component scores
  const flavorScore = calculateFlavorMatch(roasterNotes, selectedFlavors);
  const sensoryScore = calculateSensoryMatch(roasterNotes, sensoryAttributes);
  
  // Weighted combination (60% flavor, 40% sensory)
  const total = Math.round(flavorScore * 0.6 + sensoryScore * 0.4);
  
  return {
    total,
    flavorScore,
    sensoryScore
  };
};
```

### Score Calibration
```typescript
const calibrateScore = (rawScore: number, context: ScoringContext): number => {
  // Apply curve for more generous scoring
  const curvedScore = Math.min(100, rawScore * 1.2 + 15);
  
  // Adjust based on note complexity
  const complexityAdjustment = calculateComplexityAdjustment(context);
  
  // Apply confidence weighting
  const confidenceWeight = calculateConfidenceWeight(context);
  
  return Math.round(curvedScore * confidenceWeight + complexityAdjustment);
};
```

## Advanced Features

### Semantic Similarity
```typescript
const calculateSemanticSimilarity = (term1: string, term2: string): number => {
  // Use pre-computed similarity matrix
  const similarity = semanticSimilarityMatrix[term1]?.[term2];
  if (similarity !== undefined) {
    return similarity;
  }
  
  // Calculate edit distance for unknown terms
  const editDistance = levenshteinDistance(term1, term2);
  const maxLength = Math.max(term1.length, term2.length);
  
  return 1 - (editDistance / maxLength);
};
```

### Context-Aware Matching
```typescript
const applyContextualMatching = (matches: Match[], context: TastingContext): Match[] => {
  return matches.map(match => {
    // Adjust score based on coffee origin
    const originBonus = calculateOriginBonus(match.term, context.origin);
    
    // Adjust score based on processing method
    const processBonus = calculateProcessBonus(match.term, context.process);
    
    // Adjust score based on roast level
    const roastBonus = calculateRoastBonus(match.term, context.roastLevel);
    
    return {
      ...match,
      score: Math.min(100, match.score + originBonus + processBonus + roastBonus)
    };
  });
};
```

### Machine Learning Integration
```typescript
const updateAlgorithmWeights = (tastingData: TastingData[]): void => {
  // Analyze user patterns
  const userPatterns = analyzeUserPatterns(tastingData);
  
  // Adjust algorithm parameters
  const optimizedWeights = optimizeWeights(userPatterns);
  
  // Update scoring coefficients
  updateScoringCoefficients(optimizedWeights);
};
```

## Performance Optimization

### Caching Strategy
```typescript
const flavorVariationCache = new Map<string, string[]>();
const sensoryMatchCache = new Map<string, SensoryMatch>();

const getCachedFlavorVariations = (flavor: string): string[] => {
  if (flavorVariationCache.has(flavor)) {
    return flavorVariationCache.get(flavor)!;
  }
  
  const variations = computeFlavorVariations(flavor);
  flavorVariationCache.set(flavor, variations);
  return variations;
};
```

### Batch Processing
```typescript
const batchProcessMatches = (roasterNotes: string[], userSelections: UserSelection[]): BatchResult => {
  const results: MatchResult[] = [];
  
  // Process in batches to prevent UI blocking
  for (let i = 0; i < roasterNotes.length; i += BATCH_SIZE) {
    const batch = roasterNotes.slice(i, i + BATCH_SIZE);
    const batchResults = processBatch(batch, userSelections);
    results.push(...batchResults);
    
    // Yield control to UI thread
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return { results, totalProcessed: roasterNotes.length };
};
```

## Quality Metrics

### Algorithm Accuracy
```typescript
const evaluateAlgorithmAccuracy = (testCases: TestCase[]): AccuracyMetrics => {
  const results = testCases.map(testCase => {
    const predicted = calculateMatchScore(
      testCase.roasterNotes,
      testCase.selectedFlavors,
      testCase.sensoryAttributes
    );
    
    const actual = testCase.expertScore;
    const error = Math.abs(predicted.total - actual);
    
    return { predicted, actual, error };
  });
  
  const meanError = results.reduce((sum, r) => sum + r.error, 0) / results.length;
  const accuracy = results.filter(r => r.error <= 10).length / results.length;
  
  return { meanError, accuracy, totalTests: results.length };
};
```

### Performance Metrics
```typescript
const measurePerformance = (operation: () => void): PerformanceMetrics => {
  const startTime = performance.now();
  const startMemory = getMemoryUsage();
  
  operation();
  
  const endTime = performance.now();
  const endMemory = getMemoryUsage();
  
  return {
    executionTime: endTime - startTime,
    memoryUsage: endMemory - startMemory,
    timestamp: new Date().toISOString()
  };
};
```

## Testing and Validation

### Unit Tests
```typescript
describe('Flavor Matching Algorithm', () => {
  test('should match exact flavor terms', () => {
    const result = calculateFlavorMatch('bright citrus', {
      level1: [],
      level2: ['Citrus'],
      level3: [],
      level4: ['Bright']
    });
    
    expect(result).toBeGreaterThan(80);
  });
  
  test('should handle Korean terms', () => {
    const result = calculateFlavorMatch('과일향', {
      level1: ['Fruity'],
      level2: [],
      level3: [],
      level4: []
    });
    
    expect(result).toBeGreaterThan(70);
  });
});
```

### Integration Tests
```typescript
describe('Complete Matching Pipeline', () => {
  test('should process full tasting scenario', () => {
    const result = calculateMatchScore(
      'bright citrus notes with medium body and clean finish',
      mockSelectedFlavors,
      mockSensoryAttributes
    );
    
    expect(result.total).toBeBetween(0, 100);
    expect(result.flavorScore).toBeBetween(0, 100);
    expect(result.sensoryScore).toBeBetween(0, 100);
  });
});
```

## Future Enhancements

### Machine Learning Integration
- **Neural Networks**: Deep learning for pattern recognition
- **Natural Language Processing**: Advanced text understanding
- **Recommendation Systems**: Personalized flavor suggestions
- **Continuous Learning**: Algorithm improvement over time

### Advanced Features
- **Computer Vision**: Image-based coffee analysis
- **Voice Recognition**: Verbal tasting notes
- **Sentiment Analysis**: Emotional response to flavors
- **Predictive Modeling**: Taste preference prediction

This AI mapping logic provides the foundation for intelligent flavor matching while maintaining accuracy, performance, and user experience. Regular updates and machine learning integration will continue to improve the algorithm's effectiveness.