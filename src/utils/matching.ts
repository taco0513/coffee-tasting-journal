import { SelectedFlavors, SensoryAttributes } from '../stores/tastingStore';
import { flavorWheel, flavorWheelLevel3, flavorLevel3, flavorLevel4 } from '../data/flavorWheel';
import { flavorWheelKorean } from '../data/flavorWheelKorean';

// Helper function to normalize text for comparison
const normalizeText = (text: string): string[] => {
  // Split by comma first, then normalize each part
  const parts = text.split(/[,，、]/); // Support various comma types
  const words: string[] = [];
  
  parts.forEach(part => {
    const normalized = part
      .toLowerCase()
      .replace(/[.\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 1); // Allow 2-letter words for Korean
    words.push(...normalized);
  });
  
  return words;
};

// Helper function to find common elements between two arrays
const findCommonElements = (arr1: string[], arr2: string[]): string[] => {
  const set1 = new Set(arr1.map(item => item.toLowerCase()));
  return arr2.filter(item => set1.has(item.toLowerCase()));
};

// Helper function to get all related terms for a flavor
const getFlavorVariations = (flavor: string): string[] => {
  const variations = new Set<string>();
  variations.add(flavor.toLowerCase());
  
  // Add Korean translation if exists
  const koreanTerm = flavorWheelKorean.translations[flavor];
  if (koreanTerm) {
    variations.add(koreanTerm.toLowerCase());
  }
  
  // Add parent categories if this is a subcategory
  Object.entries(flavorWheel).forEach(([parent, children]) => {
    if (Array.isArray(children) && children.includes(flavor)) {
      variations.add(parent.toLowerCase());
      const parentKorean = flavorWheelKorean.level1[parent];
      if (parentKorean) {
        variations.add(parentKorean.toLowerCase());
      }
    }
  });
  
  // Add child categories if this is a parent
  const children = flavorWheel[flavor as keyof typeof flavorWheel];
  if (Array.isArray(children)) {
    children.forEach(child => {
      variations.add(child.toLowerCase());
      const childKorean = flavorWheelKorean.translations[child];
      if (childKorean) {
        variations.add(childKorean.toLowerCase());
      }
    });
  }
  
  return Array.from(variations);
};

// Calculate flavor match score (0-100)
const calculateFlavorMatch = (
  roasterNotes: string,
  selectedFlavors: SelectedFlavors
): number => {
  if (!roasterNotes || roasterNotes.trim() === '') {
    return 50; // Default score if no roaster notes
  }

  // Get all user selected flavors with variations
  const userFlavorSet = new Set<string>();
  
  // Add all selected flavors and their variations
  [...selectedFlavors.level1, 
   ...selectedFlavors.level2, 
   ...selectedFlavors.level3, 
   ...selectedFlavors.level4].forEach(flavor => {
    getFlavorVariations(flavor).forEach(variation => {
      userFlavorSet.add(variation);
    });
  });

  // Normalize roaster notes
  const roasterWords = normalizeText(roasterNotes);
  
  // Count matches with different weights
  let matchScore = 0;
  let maxPossibleScore = 0;
  
  // Check each roaster word against user selections
  roasterWords.forEach(word => {
    // Direct match
    if (userFlavorSet.has(word)) {
      matchScore += 10;
    }
    // Partial match (contains)
    else {
      Array.from(userFlavorSet).forEach(userFlavor => {
        if (word.includes(userFlavor) || userFlavor.includes(word)) {
          matchScore += 5;
        }
      });
    }
    maxPossibleScore += 10;
  });
  
  // Also check user selections against roaster notes (reverse check)
  const roasterNotesLower = roasterNotes.toLowerCase();
  selectedFlavors.level1.forEach(() => maxPossibleScore += 8);
  selectedFlavors.level2.forEach(() => maxPossibleScore += 6);
  selectedFlavors.level3.forEach(() => maxPossibleScore += 4);
  selectedFlavors.level4.forEach(() => maxPossibleScore += 2);
  
  selectedFlavors.level1.forEach(flavor => {
    if (roasterNotesLower.includes(flavor.toLowerCase())) matchScore += 8;
  });
  selectedFlavors.level2.forEach(flavor => {
    if (roasterNotesLower.includes(flavor.toLowerCase())) matchScore += 6;
  });
  selectedFlavors.level3.forEach(flavor => {
    if (roasterNotesLower.includes(flavor.toLowerCase())) matchScore += 4;
  });
  selectedFlavors.level4.forEach(flavor => {
    if (roasterNotesLower.includes(flavor.toLowerCase())) matchScore += 2;
  });
  
  // Calculate percentage
  const percentage = maxPossibleScore > 0 
    ? (matchScore / maxPossibleScore) * 100 
    : 50;
  
  // Apply a more generous curve
  const curvedScore = Math.min(100, percentage * 1.2 + 15);
  
  return Math.round(curvedScore);
};

// Sensory keyword mappings
const sensoryKeywords = {
  body: {
    light: ['light', 'delicate', 'tea-like', '가벼운', '가벼움', '라이트', '델리케이트', '차같은'],
    medium: ['medium', 'balanced', '중간', '밸런스', '균형'],
    heavy: ['heavy', 'full', 'bold', 'rich', '무거운', '무거움', '풀바디', '진한', '리치']
  },
  acidity: {
    low: ['low acid', 'mild', 'smooth', '낮은산미', '마일드', '부드러운'],
    medium: ['balanced acid', 'moderate', '적당한산미', '중간산미'],
    high: ['bright', 'acidic', 'citric', 'tart', 'vibrant', '밝은', '산미', '시트릭', '상큼한', '활발한']
  },
  sweetness: {
    low: ['dry', 'savory', '드라이', '세이보리'],
    medium: ['subtle sweet', 'mild sweet', '은은한단맛', '약간단'],
    high: ['sweet', 'sugary', 'honey', 'caramel', '달콤한', '단맛', '달달한', '꿀', '카라멜']
  },
  finish: {
    short: ['short', 'quick', 'clean finish', '짧은', '깔끔한피니시'],
    medium: ['moderate', 'balanced finish', '적당한', '균형잡힌'],
    long: ['long', 'lingering', 'lasting', '긴', '여운', '오래가는', '지속되는']
  },
  mouthfeel: {
    Clean: ['clean', 'crisp', 'refreshing', '깔끔한', '상쾌한', '클린'],
    Creamy: ['creamy', 'smooth', 'velvety', '크리미한', '부드러운', '벨벳'],
    Juicy: ['juicy', 'succulent', 'mouth-watering', '쥬시한', '즙이많은', '과즙'],
    Silky: ['silky', 'smooth', 'elegant', '실키한', '부드러운', '우아한']
  }
};

// Calculate sensory match score (0-100)
const calculateSensoryMatch = (
  roasterNotes: string,
  sensoryAttributes: SensoryAttributes
): number => {
  if (!roasterNotes || roasterNotes.trim() === '') {
    return 60; // Default score if no roaster notes
  }

  const roasterNotesLower = roasterNotes.toLowerCase();
  const roasterWords = normalizeText(roasterNotes);
  let matchCount = 0;
  let totalChecks = 0;

  // Body check
  if (sensoryAttributes.body <= 2) {
    const hasLightKeyword = sensoryKeywords.body.light.some(keyword => 
      roasterNotesLower.includes(keyword.toLowerCase())
    );
    if (hasLightKeyword) matchCount += 2;
    totalChecks += 2;
  } else if (sensoryAttributes.body >= 4) {
    const hasHeavyKeyword = sensoryKeywords.body.heavy.some(keyword => 
      roasterNotesLower.includes(keyword.toLowerCase())
    );
    if (hasHeavyKeyword) matchCount += 2;
    totalChecks += 2;
  } else {
    const hasMediumKeyword = sensoryKeywords.body.medium.some(keyword => 
      roasterNotesLower.includes(keyword.toLowerCase())
    );
    if (hasMediumKeyword) matchCount += 1;
    totalChecks += 1;
  }

  // Acidity check
  if (sensoryAttributes.acidity <= 2) {
    const hasLowKeyword = sensoryKeywords.acidity.low.some(keyword => 
      roasterNotesLower.includes(keyword.toLowerCase())
    );
    if (hasLowKeyword) matchCount += 2;
    totalChecks += 2;
  } else if (sensoryAttributes.acidity >= 4) {
    const hasHighKeyword = sensoryKeywords.acidity.high.some(keyword => 
      roasterNotesLower.includes(keyword.toLowerCase())
    );
    if (hasHighKeyword) matchCount += 2;
    totalChecks += 2;
  }

  // Sweetness check
  if (sensoryAttributes.sweetness >= 4) {
    const hasSweetKeyword = sensoryKeywords.sweetness.high.some(keyword => 
      roasterNotesLower.includes(keyword.toLowerCase())
    );
    if (hasSweetKeyword) matchCount += 2;
    totalChecks += 2;
  }

  // Finish check
  if (sensoryAttributes.finish <= 2) {
    const hasShortKeyword = sensoryKeywords.finish.short.some(keyword => 
      roasterNotesLower.includes(keyword.toLowerCase())
    );
    if (hasShortKeyword) matchCount += 1;
    totalChecks += 1;
  } else if (sensoryAttributes.finish >= 4) {
    const hasLongKeyword = sensoryKeywords.finish.long.some(keyword => 
      roasterNotesLower.includes(keyword.toLowerCase())
    );
    if (hasLongKeyword) matchCount += 1;
    totalChecks += 1;
  }

  // Mouthfeel check
  const mouthfeelKeywords = sensoryKeywords.mouthfeel[sensoryAttributes.mouthfeel];
  if (mouthfeelKeywords) {
    const hasKeyword = mouthfeelKeywords.some(keyword => 
      roasterNotesLower.includes(keyword.toLowerCase())
    );
    if (hasKeyword) matchCount += 2;
    totalChecks += 2;
  }

  // Calculate base score
  const baseScore = totalChecks > 0 
    ? (matchCount / totalChecks) * 100 
    : 50;

  // Add bonus for general sensory terms
  const generalTerms = ['balanced', 'complex', 'layered', '균형', '복잡한', '층이있는'];
  const hasGeneralTerms = generalTerms.some(term => 
    roasterNotesLower.includes(term.toLowerCase())
  );
  
  const finalScore = hasGeneralTerms 
    ? Math.min(100, baseScore + 10) 
    : baseScore;

  return Math.round(finalScore);
};

// Main function to calculate total match score
export const calculateMatchScore = (
  roasterNotes: string,
  selectedFlavors: SelectedFlavors,
  sensoryAttributes: SensoryAttributes
): { total: number; flavorScore: number; sensoryScore: number } => {
  // Calculate individual scores
  const flavorScore = calculateFlavorMatch(roasterNotes, selectedFlavors);
  const sensoryScore = calculateSensoryMatch(roasterNotes, sensoryAttributes);

  // Calculate weighted total (60% flavor, 40% sensory)
  const total = Math.round(flavorScore * 0.6 + sensoryScore * 0.4);

  return {
    total,
    flavorScore,
    sensoryScore,
  };
};

// Additional helper function to parse roaster notes more intelligently
export const parseRoasterNotes = (notes: string): {
  flavors: string[];
  sensoryTerms: string[];
} => {
  const normalized = normalizeText(notes);
  const flavors: string[] = [];
  const sensoryTerms: string[] = [];
  
  // All sensory keywords
  const allSensoryKeywords = new Set<string>();
  Object.values(sensoryKeywords).forEach(category => {
    Object.values(category).forEach(keywords => {
      keywords.forEach(keyword => {
        allSensoryKeywords.add(keyword.toLowerCase());
      });
    });
  });
  
  // Categorize words
  normalized.forEach(word => {
    if (allSensoryKeywords.has(word)) {
      sensoryTerms.push(word);
    } else {
      flavors.push(word);
    }
  });
  
  return { flavors, sensoryTerms };
};

// Function to get match details for debugging/display
export const getMatchDetails = (
  roasterNotes: string,
  selectedFlavors: SelectedFlavors,
  sensoryAttributes: SensoryAttributes
): {
  matchedFlavors: string[];
  unmatchedFlavors: string[];
  sensoryMatches: string[];
  suggestions: string[];
} => {
  const roasterWords = normalizeText(roasterNotes);
  const userFlavorSet = new Set<string>();
  
  [...selectedFlavors.level1, 
   ...selectedFlavors.level2, 
   ...selectedFlavors.level3, 
   ...selectedFlavors.level4].forEach(flavor => {
    userFlavorSet.add(flavor.toLowerCase());
  });
  
  const matchedFlavors = roasterWords.filter(word => userFlavorSet.has(word));
  const unmatchedFlavors = Array.from(userFlavorSet).filter(
    flavor => !roasterWords.some(word => word.includes(flavor) || flavor.includes(word))
  );
  
  const sensoryMatches: string[] = [];
  const roasterNotesLower = roasterNotes.toLowerCase();
  
  // Check which sensory terms matched
  Object.entries(sensoryKeywords).forEach(([attribute, levels]) => {
    Object.entries(levels).forEach(([level, keywords]) => {
      keywords.forEach(keyword => {
        if (roasterNotesLower.includes(keyword.toLowerCase())) {
          sensoryMatches.push(`${attribute}: ${keyword}`);
        }
      });
    });
  });
  
  // Generate suggestions based on roaster notes
  const suggestions: string[] = [];
  roasterWords.forEach(word => {
    // Find similar flavors in flavor wheel
    Object.values(flavorWheel).forEach(category => {
      if (Array.isArray(category)) {
        category.forEach(flavor => {
          if (flavor.toLowerCase().includes(word) && !userFlavorSet.has(flavor.toLowerCase())) {
            suggestions.push(flavor);
          }
        });
      }
    });
  });
  
  return {
    matchedFlavors: [...new Set(matchedFlavors)],
    unmatchedFlavors: [...new Set(unmatchedFlavors)],
    sensoryMatches: [...new Set(sensoryMatches)],
    suggestions: [...new Set(suggestions)].slice(0, 5)
  };
};

// Export helper functions for testing
export { normalizeText, findCommonElements, calculateFlavorMatch, calculateSensoryMatch };