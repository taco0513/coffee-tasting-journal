import { create } from 'zustand';
import { calculateMatchScore } from '../utils/matching';
import { realmService } from '../services/realm';
import { ITastingRecord } from '../services/realm/schemas';

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
  recentTastings: ITastingRecord[];
  isLoading: boolean;
  error: string | null;
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
  completeTasting: () => Promise<{ success: boolean; error?: string; record?: ITastingRecord }>;
  loadRecentTastings: () => Promise<void>;
  initializeRealm: () => Promise<void>;
  clearAllTastings: () => Promise<void>;
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
  recentTastings: [],
  isLoading: false,
  error: null,
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
    // Deprecated - use completeTasting instead
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
    
    set({ currentMatchScore: matchScore.total });
    return tastingRecord;
  },

  completeTasting: async () => {
    const state = useTastingStore.getState();
    
    // Set loading state
    set({ isLoading: true, error: null });
    
    try {
      // Ensure Realm is initialized
      await useTastingStore.getState().initializeRealm();
      
      // Calculate match score
      const matchScore = calculateMatchScore(
        state.roasterNotes,
        state.selectedFlavors,
        state.sensoryAttributes
      );
      
      // Prepare data for saving
      const tastingData = {
        coffeeInfo: {
          cafeName: state.currentTasting.cafeName || undefined,
          roastery: state.currentTasting.roastery,
          coffeeName: state.currentTasting.coffeeName,
          origin: state.currentTasting.origin || undefined,
          variety: state.currentTasting.variety || undefined,
          altitude: state.currentTasting.altitude || undefined,
          process: state.currentTasting.process || undefined,
          temperature: state.currentTasting.temperature,
        },
        roasterNotes: state.roasterNotes || undefined,
        selectedFlavors: state.selectedFlavors,
        sensoryAttributes: state.sensoryAttributes,
        matchScore: {
          total: matchScore.total,
          flavorScore: matchScore.flavorScore,
          sensoryScore: matchScore.sensoryScore,
        },
      };
      
      // Save to Realm
      const savedRecord = await realmService.saveTasting(tastingData);
      
      // Update state
      set({ 
        currentMatchScore: matchScore.total,
        isLoading: false,
        error: null,
      });
      
      // Reload recent tastings
      await useTastingStore.getState().loadRecentTastings();
      
      console.log('Tasting completed and saved:', savedRecord.id);
      
      return {
        success: true,
        record: savedRecord,
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save tasting';
      console.error('Error completing tasting:', error);
      
      set({ 
        isLoading: false,
        error: errorMessage,
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  loadRecentTastings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Ensure Realm is initialized
      await useTastingStore.getState().initializeRealm();
      
      // Load recent tastings
      const recentTastings = realmService.getRecentTastings(10);
      
      // Convert Realm objects to plain objects for state
      const tastings = recentTastings.map(record => ({
        id: record.id,
        userId: record.userId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        syncedAt: record.syncedAt,
        cafeName: record.cafeName,
        roastery: record.roastery,
        coffeeName: record.coffeeName,
        origin: record.origin,
        variety: record.variety,
        altitude: record.altitude,
        process: record.process,
        temperature: record.temperature,
        roasterNotes: record.roasterNotes,
        matchScoreTotal: record.matchScoreTotal,
        matchScoreFlavor: record.matchScoreFlavor,
        matchScoreSensory: record.matchScoreSensory,
        flavorNotes: record.flavorNotes.map(note => ({
          level: note.level,
          value: note.value,
          koreanValue: note.koreanValue,
        })),
        sensoryAttribute: {
          body: record.sensoryAttribute.body,
          acidity: record.sensoryAttribute.acidity,
          sweetness: record.sensoryAttribute.sweetness,
          finish: record.sensoryAttribute.finish,
          mouthfeel: record.sensoryAttribute.mouthfeel,
        },
        isSynced: record.isSynced,
        isDeleted: record.isDeleted,
      }));
      
      set({ 
        recentTastings: tastings,
        isLoading: false,
        error: null,
      });
      
      console.log(`Loaded ${tastings.length} recent tastings`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load recent tastings';
      console.error('Error loading recent tastings:', error);
      
      set({ 
        recentTastings: [],
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  initializeRealm: async () => {
    try {
      await realmService.initialize();
      console.log('Realm initialized from store');
    } catch (error) {
      console.error('Failed to initialize Realm from store:', error);
      throw error;
    }
  },

  clearAllTastings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Ensure Realm is initialized
      await useTastingStore.getState().initializeRealm();
      
      // Clear all tastings from Realm
      realmService.clearAllTastings();
      
      // Clear state
      set({ 
        recentTastings: [],
        isLoading: false,
        error: null,
      });
      
      console.log('All tastings cleared successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear all tastings';
      console.error('Error clearing all tastings:', error);
      
      set({ 
        isLoading: false,
        error: errorMessage,
      });
      
      throw error;
    }
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
