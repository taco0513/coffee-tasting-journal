import { create } from 'zustand';
import { calculateMatchScore } from '../utils/matching';

// TypeScript types for the tasting data
export interface CoffeeInfo {
  cafeName: string;
  roastery: string;
  coffeeName: string;
  origin: string;
  variety: string;
  altitude: string;
  process: string;
  temperature: 'hot' | 'ice';
  roasterNotes: string;
}

export interface SelectedFlavors {
  level1: string[];
  level2: string[];
  level3: string[];
  level4: string[];
}

export interface SensoryAttributes {
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  mouthfeel: 'Clean' | 'Creamy' | 'Juicy' | 'Silky';
}

export interface TastingRecord {
  id: string;
  timestamp: string;
  coffeeInfo: CoffeeInfo;
  roasterNotes: string;
  selectedFlavors: SelectedFlavors;
  sensoryAttributes: SensoryAttributes;
  matchScore: {
    total: number;
    flavorScore: number;
    sensoryScore: number;
  };
}

export interface TastingState {
  currentTasting: CoffeeInfo;
  currentStep: number;
  selectedFlavors: SelectedFlavors;
  roasterNotes: string;
  sensoryAttributes: SensoryAttributes;
  currentMatchScore: number;
}

export interface TastingActions {
  updateCoffeeInfo: (coffeeInfo: Partial<CoffeeInfo>) => void;
  reset: () => void;
  setCurrentStep: (step: number) => void;
  setFlavorLevel: (level: number, flavors: string[]) => void;
  clearFlavors: () => void;
  setRoasterNotes: (notes: string) => void;
  updateSensoryAttributes: (attributes: Partial<SensoryAttributes>) => void;
  saveTasting: () => TastingRecord;
  // Deprecated - use setFlavorLevel instead
  setFlavorLevel1: (flavors: string[]) => void;
}

export type TastingStore = TastingState & TastingActions;

// Initial state
const initialCoffeeInfo: CoffeeInfo = {
  cafeName: '',
  roastery: '',
  coffeeName: '',
  origin: '',
  variety: '',
  altitude: '',
  process: '',
  temperature: 'hot',
  roasterNotes: '',
};

const initialSelectedFlavors: SelectedFlavors = {
  level1: [],
  level2: [],
  level3: [],
  level4: [],
};

const initialSensoryAttributes: SensoryAttributes = {
  body: 3,
  acidity: 3,
  sweetness: 3,
  finish: 3,
  mouthfeel: 'Clean',
};

const initialState: TastingState = {
  currentTasting: initialCoffeeInfo,
  currentStep: 1,
  selectedFlavors: initialSelectedFlavors,
  roasterNotes: '',
  sensoryAttributes: initialSensoryAttributes,
  currentMatchScore: 0,
};

// Create the Zustand store
export const useTastingStore = create<TastingStore>((set) => ({
  ...initialState,
  
  updateCoffeeInfo: (coffeeInfo: Partial<CoffeeInfo>) =>
    set((state) => ({
      currentTasting: {
        ...state.currentTasting,
        ...coffeeInfo,
      },
    })),
  
  reset: () => set(initialState),
  
  setCurrentStep: (step: number) =>
    set({ currentStep: step }),
  
  setFlavorLevel: (level: number, flavors: string[]) =>
    set((state) => ({
      selectedFlavors: {
        ...state.selectedFlavors,
        [`level${level}`]: flavors,
      },
    })),
  
  clearFlavors: () =>
    set({ selectedFlavors: initialSelectedFlavors }),
  
  setRoasterNotes: (notes: string) =>
    set({ roasterNotes: notes }),
  
  updateSensoryAttributes: (attributes: Partial<SensoryAttributes>) =>
    set((state) => ({
      sensoryAttributes: {
        ...state.sensoryAttributes,
        ...attributes,
      },
    })),
  
  saveTasting: () => {
    const state = useTastingStore.getState();
    const matchScore = calculateMatchScore(
      state.roasterNotes,
      state.selectedFlavors,
      state.sensoryAttributes
    );
    
    const tastingRecord: TastingRecord = {
      id: `tasting_${Date.now()}`,
      timestamp: new Date().toISOString(),
      coffeeInfo: state.currentTasting,
      roasterNotes: state.roasterNotes,
      selectedFlavors: state.selectedFlavors,
      sensoryAttributes: state.sensoryAttributes,
      matchScore,
    };
    
    // Save to storage (console.log for now)
    console.log('Saving tasting record:', tastingRecord);
    
    // Update current match score
    set({ currentMatchScore: matchScore.total });
    
    // TODO: Implement actual storage (AsyncStorage, SQLite, etc.)
    
    return tastingRecord;
  },
  
  // Deprecated - use setFlavorLevel instead
  setFlavorLevel1: (flavors: string[]) =>
    set((state) => ({
      selectedFlavors: {
        ...state.selectedFlavors,
        level1: flavors,
      },
    })),
}));
