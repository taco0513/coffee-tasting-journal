import Realm from 'realm';

// TypeScript Types
export interface IFlavorNote {
  level: number;
  value: string;
  koreanValue?: string;
}

export interface ISensoryAttribute {
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  mouthfeel: 'Clean' | 'Creamy' | 'Juicy' | 'Silky';
}

export interface ITastingRecord {
  id: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
  
  // Coffee Information
  cafeName?: string;
  roastery: string;
  coffeeName: string;
  origin?: string;
  variety?: string;
  altitude?: string;
  process?: string;
  temperature: 'hot' | 'ice';
  
  // Roaster Notes
  roasterNotes?: string;
  
  // Match Score
  matchScoreTotal: number;
  matchScoreFlavor: number;
  matchScoreSensory: number;
  
  // Relationships
  flavorNotes: IFlavorNote[];
  sensoryAttribute: ISensoryAttribute;
  
  // Sync Status
  isSynced: boolean;
  isDeleted: boolean;
}

export interface ICoffeeLibrary {
  id: string;
  roastery: string;
  coffeeName: string;
  origin?: string;
  variety?: string;
  altitude?: string;
  process?: string;
  roasterNotes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  useCount: number;
  lastUsedAt?: Date;
}

export interface ICafeInfo {
  id: string;
  name: string;
  location?: string;
  notes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  visitCount: number;
  lastVisitedAt?: Date;
}

export interface IRoasterInfo {
  id: string;
  name: string;
  location?: string;
  website?: string;
  notes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  coffeeCount: number;
  averageScore?: number;
}

// Realm Schemas
export const FlavorNoteSchema: Realm.ObjectSchema = {
  name: 'FlavorNote',
  embedded: true,
  properties: {
    level: 'int',
    value: 'string',
    koreanValue: 'string?',
  },
};

export const SensoryAttributeSchema: Realm.ObjectSchema = {
  name: 'SensoryAttribute',
  embedded: true,
  properties: {
    body: 'int',
    acidity: 'int',
    sweetness: 'int',
    finish: 'int',
    mouthfeel: 'string',
  },
};

export const TastingRecordSchema: Realm.ObjectSchema = {
  name: 'TastingRecord',
  primaryKey: 'id',
  properties: {
    // Identity
    id: 'string',
    userId: 'string?',
    
    // Timestamps
    createdAt: 'date',
    updatedAt: 'date',
    syncedAt: 'date?',
    
    // Coffee Information
    cafeName: 'string?',
    roastery: 'string',
    coffeeName: 'string',
    origin: 'string?',
    variety: 'string?',
    altitude: 'string?',
    process: 'string?',
    temperature: 'string',
    
    // Roaster Notes
    roasterNotes: 'string?',
    
    // Match Score
    matchScoreTotal: 'int',
    matchScoreFlavor: 'int',
    matchScoreSensory: 'int',
    
    // Relationships
    flavorNotes: 'FlavorNote[]',
    sensoryAttribute: 'SensoryAttribute',
    
    // Sync Status
    isSynced: { type: 'bool', default: false },
    isDeleted: { type: 'bool', default: false },
  },
};

export const CoffeeLibrarySchema: Realm.ObjectSchema = {
  name: 'CoffeeLibrary',
  primaryKey: 'id',
  properties: {
    id: 'string',
    roastery: 'string',
    coffeeName: 'string',
    origin: 'string?',
    variety: 'string?',
    altitude: 'string?',
    process: 'string?',
    roasterNotes: 'string?',
    
    // Metadata
    createdAt: 'date',
    updatedAt: 'date',
    useCount: { type: 'int', default: 0 },
    lastUsedAt: 'date?',
  },
};

export const CafeInfoSchema: Realm.ObjectSchema = {
  name: 'CafeInfo',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    location: 'string?',
    notes: 'string?',
    
    // Metadata
    createdAt: 'date',
    updatedAt: 'date',
    visitCount: { type: 'int', default: 0 },
    lastVisitedAt: 'date?',
  },
};

export const RoasterInfoSchema: Realm.ObjectSchema = {
  name: 'RoasterInfo',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    location: 'string?',
    website: 'string?',
    notes: 'string?',
    
    // Metadata
    createdAt: 'date',
    updatedAt: 'date',
    coffeeCount: { type: 'int', default: 0 },
    averageScore: 'double?',
  },
};

// All schemas for Realm configuration
export const schemas = [
  FlavorNoteSchema,
  SensoryAttributeSchema,
  TastingRecordSchema,
  CoffeeLibrarySchema,
  CafeInfoSchema,
  RoasterInfoSchema,
];