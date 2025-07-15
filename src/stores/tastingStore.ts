import { create } from 'zustand';

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

export interface TastingState {
  currentTasting: CoffeeInfo;
  currentStep: number;
  selectedFlavors: SelectedFlavors;
  roasterNotes: string;
}

export interface TastingActions {
  updateCoffeeInfo: (coffeeInfo: Partial<CoffeeInfo>) => void;
  reset: () => void;
  setCurrentStep: (step: number) => void;
  setFlavorLevel: (level: number, flavors: string[]) => void;
  clearFlavors: () => void;
  setRoasterNotes: (notes: string) => void;
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

const initialState: TastingState = {
  currentTasting: initialCoffeeInfo,
  currentStep: 1,
  selectedFlavors: initialSelectedFlavors,
  roasterNotes: '',
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
  
  // Deprecated - use setFlavorLevel instead
  setFlavorLevel1: (flavors: string[]) =>
    set((state) => ({
      selectedFlavors: {
        ...state.selectedFlavors,
        level1: flavors,
      },
    })),
}));
