import { SelectedFlavors, SensoryAttributes } from '../stores/tastingStore';

// Helper function to normalize text for comparison
const normalizeText = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out short words
};

// Helper function to find common elements between two arrays
const findCommonElements = (arr1: string[], arr2: string[]): string[] => {
  const set1 = new Set(arr1.map(item => item.toLowerCase()));
  return arr2.filter(item => set1.has(item.toLowerCase()));
};

// Calculate flavor match score (0-100)
const calculateFlavorMatch = (
  roasterNotes: string,
  selectedFlavors: SelectedFlavors
): number => {
  if (!roasterNotes || roasterNotes.trim() === '') {
    return 50; // Default score if no roaster notes
  }

  // Get all user selected flavors
  const userFlavors = [
    ...selectedFlavors.level1,
    ...selectedFlavors.level2,
    ...selectedFlavors.level3,
    ...selectedFlavors.level4,
  ].map(flavor => flavor.toLowerCase());

  // Normalize roaster notes
  const roasterWords = normalizeText(roasterNotes);

  // Find matching keywords
  const matches = findCommonElements(userFlavors, roasterWords);

  // Calculate score based on match percentage
  const totalPossibleMatches = Math.max(userFlavors.length, 1);
  const matchPercentage = (matches.length / totalPossibleMatches) * 100;

  // Apply a curve to make the scoring more forgiving
  // This gives partial credit even for few matches
  const curvedScore = Math.min(100, matchPercentage * 1.5 + 20);

  return Math.round(curvedScore);
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
  let score = 50; // Base score

  // Check for sensory keywords in roaster notes
  // Body keywords
  if (roasterNotesLower.includes('light') || roasterNotesLower.includes('가벼')) {
    score += sensoryAttributes.body <= 2 ? 10 : -5;
  }
  if (roasterNotesLower.includes('heavy') || roasterNotesLower.includes('무거') || 
      roasterNotesLower.includes('full')) {
    score += sensoryAttributes.body >= 4 ? 10 : -5;
  }

  // Acidity keywords
  if (roasterNotesLower.includes('bright') || roasterNotesLower.includes('산미') || 
      roasterNotesLower.includes('acid') || roasterNotesLower.includes('citric')) {
    score += sensoryAttributes.acidity >= 4 ? 10 : -5;
  }
  if (roasterNotesLower.includes('low acid') || roasterNotesLower.includes('mild')) {
    score += sensoryAttributes.acidity <= 2 ? 10 : -5;
  }

  // Sweetness keywords
  if (roasterNotesLower.includes('sweet') || roasterNotesLower.includes('단맛') || 
      roasterNotesLower.includes('sugar') || roasterNotesLower.includes('honey')) {
    score += sensoryAttributes.sweetness >= 4 ? 10 : -5;
  }

  // Mouthfeel keywords
  if (roasterNotesLower.includes('clean') || roasterNotesLower.includes('깔끔')) {
    score += sensoryAttributes.mouthfeel === 'Clean' ? 10 : 0;
  }
  if (roasterNotesLower.includes('creamy') || roasterNotesLower.includes('크림')) {
    score += sensoryAttributes.mouthfeel === 'Creamy' ? 10 : 0;
  }
  if (roasterNotesLower.includes('juicy') || roasterNotesLower.includes('쥬시')) {
    score += sensoryAttributes.mouthfeel === 'Juicy' ? 10 : 0;
  }
  if (roasterNotesLower.includes('silky') || roasterNotesLower.includes('실키') || 
      roasterNotesLower.includes('smooth')) {
    score += sensoryAttributes.mouthfeel === 'Silky' ? 10 : 0;
  }

  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
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

// Export helper functions for testing
export { normalizeText, findCommonElements, calculateFlavorMatch, calculateSensoryMatch };