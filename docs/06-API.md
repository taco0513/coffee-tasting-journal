# API Documentation

## Overview

The Coffee Tasting Journal currently operates as a local-first application with no external API dependencies. All data processing and storage occurs locally using Realm database and the internal matching algorithm. This document outlines the internal API structure and future external API specifications.

## Internal API Structure

### TastingStore API

#### State Management
```typescript
interface TastingStore {
  // State
  currentTasting: CoffeeInfo;
  selectedFlavors: SelectedFlavors;
  sensoryAttributes: SensoryAttributes;
  recentTastings: ITastingRecord[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateCoffeeInfo: (coffeeInfo: Partial<CoffeeInfo>) => void;
  setFlavorLevel: (level: number, flavors: string[]) => void;
  updateSensoryAttributes: (attributes: Partial<SensoryAttributes>) => void;
  completeTasting: () => Promise<TastingResult>;
  loadRecentTastings: () => Promise<void>;
  clearAllTastings: () => Promise<void>;
  initializeRealm: () => Promise<void>;
}
```

#### Usage Examples
```typescript
// Update coffee information
const { updateCoffeeInfo } = useTastingStore();
updateCoffeeInfo({
  coffeeName: 'Ethiopian Yirgacheffe',
  roastery: 'Third Wave Coffee',
  origin: 'Ethiopia'
});

// Set flavor selections
const { setFlavorLevel } = useTastingStore();
setFlavorLevel(1, ['Fruity', 'Floral']);
setFlavorLevel(2, ['Berry', 'Citrus']);

// Complete tasting
const { completeTasting } = useTastingStore();
const result = await completeTasting();
if (result.success) {
  console.log('Tasting saved:', result.record);
}
```

### RealmService API

#### Database Operations
```typescript
interface RealmService {
  // Initialization
  initialize(): Promise<void>;
  
  // Tasting Operations
  saveTasting(data: TastingData): Promise<ITastingRecord>;
  getTastingById(id: string): ITastingRecord | null;
  getRecentTastings(limit: number): ITastingRecord[];
  deleteTasting(id: string): void;
  clearAllTastings(): void;
  
  // Coffee Library
  searchCoffeeLibrary(term: string): ICoffeeLibrary[];
  addCoffeeToLibrary(coffee: CoffeeData): ICoffeeLibrary;
  
  // Analytics
  getTastingStatistics(): TastingStatistics;
  
  // Cleanup
  close(): void;
}
```

#### Data Types
```typescript
interface TastingData {
  coffeeInfo: {
    cafeName?: string;
    roastery: string;
    coffeeName: string;
    origin?: string;
    variety?: string;
    altitude?: string;
    process?: string;
    temperature: 'hot' | 'ice';
  };
  roasterNotes?: string;
  selectedFlavors: SelectedFlavors;
  sensoryAttributes: SensoryAttributes;
  matchScore: {
    total: number;
    flavorScore: number;
    sensoryScore: number;
  };
}

interface ITastingRecord {
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
  
  // Tasting Data
  roasterNotes?: string;
  flavorNotes: IFlavorNote[];
  sensoryAttribute: ISensoryAttribute;
  
  // Scores
  matchScoreTotal: number;
  matchScoreFlavor: number;
  matchScoreSensory: number;
  
  // Metadata
  isSynced: boolean;
  isDeleted: boolean;
}
```

### Matching Algorithm API

#### Core Functions
```typescript
interface MatchingAlgorithm {
  // Main calculation
  calculateMatchScore(
    roasterNotes: string,
    selectedFlavors: SelectedFlavors,
    sensoryAttributes: SensoryAttributes
  ): MatchScore;
  
  // Detailed analysis
  getMatchDetails(
    roasterNotes: string,
    selectedFlavors: SelectedFlavors,
    sensoryAttributes: SensoryAttributes
  ): MatchDetails;
  
  // Text processing
  parseRoasterNotes(notes: string): ParsedNotes;
  normalizeText(text: string): string[];
}
```

#### Response Types
```typescript
interface MatchScore {
  total: number;        // 0-100 overall score
  flavorScore: number;  // 0-100 flavor matching score
  sensoryScore: number; // 0-100 sensory matching score
}

interface MatchDetails {
  matchedFlavors: string[];
  unmatchedFlavors: string[];
  sensoryMatches: string[];
  suggestions: string[];
}

interface ParsedNotes {
  flavors: string[];
  sensoryTerms: string[];
}
```

#### Usage Examples
```typescript
import { calculateMatchScore, getMatchDetails } from '../utils/matching';

// Calculate match score
const score = calculateMatchScore(
  'bright citrus notes with floral aroma',
  {
    level1: ['Fruity'],
    level2: ['Citrus'],
    level3: ['Lemon'],
    level4: ['Bright']
  },
  {
    body: 3,
    acidity: 4,
    sweetness: 3,
    finish: 3,
    mouthfeel: 'Clean'
  }
);

// Get detailed analysis
const details = getMatchDetails(roasterNotes, selectedFlavors, sensoryAttributes);
console.log('Matched flavors:', details.matchedFlavors);
console.log('Suggestions:', details.suggestions);
```

## Future External API Specifications

### Authentication API (Planned)

#### Endpoints
```typescript
// User Authentication
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
```

#### Request/Response Examples
```typescript
// Login Request
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Login Response
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

### Sync API (Planned)

#### Endpoints
```typescript
// Data Synchronization
GET  /api/sync/tastings
POST /api/sync/tastings
PUT  /api/sync/tastings/:id
DELETE /api/sync/tastings/:id
GET  /api/sync/status
```

#### Sync Request Example
```typescript
// Upload tasting data
POST /api/sync/tastings
{
  "tastings": [
    {
      "localId": "local-123",
      "coffeeInfo": {
        "roastery": "Blue Bottle",
        "coffeeName": "Ethiopia Yirgacheffe"
      },
      "matchScore": {
        "total": 85,
        "flavorScore": 90,
        "sensoryScore": 78
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Analytics API (Planned)

#### Endpoints
```typescript
// Analytics and Statistics
GET  /api/analytics/personal
GET  /api/analytics/trends
GET  /api/analytics/leaderboard
GET  /api/analytics/recommendations
```

#### Analytics Response Example
```typescript
// Personal analytics
GET /api/analytics/personal
{
  "success": true,
  "data": {
    "totalTastings": 42,
    "averageScore": 78.5,
    "improvement": 12.3,
    "topFlavors": ["Fruity", "Floral", "Berry"],
    "favoriteRoasters": ["Blue Bottle", "Stumptown"],
    "tastingFrequency": {
      "daily": 1.2,
      "weekly": 8.4,
      "monthly": 36.8
    }
  }
}
```

### Coffee Database API (Planned)

#### Endpoints
```typescript
// Coffee Information
GET  /api/coffee/search
GET  /api/coffee/roasters
GET  /api/coffee/origins
GET  /api/coffee/varieties
GET  /api/coffee/processes
```

#### Coffee Search Example
```typescript
// Search coffee database
GET /api/coffee/search?q=ethiopia&roaster=blue%20bottle
{
  "success": true,
  "data": {
    "coffees": [
      {
        "id": "coffee-123",
        "name": "Ethiopia Yirgacheffe",
        "roaster": "Blue Bottle",
        "origin": "Ethiopia",
        "region": "Yirgacheffe",
        "variety": "Heirloom",
        "altitude": "1900-2200m",
        "process": "Washed",
        "roastDate": "2024-01-10",
        "roasterNotes": "Bright citrus and floral notes with tea-like body"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}
```

### Error Codes
```typescript
enum ErrorCode {
  // Authentication
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',
  
  // Database
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  DATABASE_CONSTRAINT_ERROR = 'DATABASE_CONSTRAINT_ERROR',
  
  // Validation
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE = 'VALIDATION_OUT_OF_RANGE',
  
  // Business Logic
  TASTING_ALREADY_EXISTS = 'TASTING_ALREADY_EXISTS',
  INVALID_FLAVOR_SELECTION = 'INVALID_FLAVOR_SELECTION',
  ALGORITHM_PROCESSING_ERROR = 'ALGORITHM_PROCESSING_ERROR',
  
  // System
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
```

### Error Handling Examples
```typescript
// Handle API errors
try {
  const result = await tastingStore.completeTasting();
  if (!result.success) {
    switch (result.error) {
      case 'DATABASE_CONNECTION_ERROR':
        showError('Database connection failed. Please try again.');
        break;
      case 'VALIDATION_REQUIRED_FIELD':
        showError('Please fill in all required fields.');
        break;
      default:
        showError('An unexpected error occurred.');
    }
  }
} catch (error) {
  console.error('Tasting completion error:', error);
  showError('Failed to save tasting. Please try again.');
}
```

## Rate Limiting (Future)

### Rate Limit Headers
```typescript
// Response headers
'X-RateLimit-Limit': '100',
'X-RateLimit-Remaining': '99',
'X-RateLimit-Reset': '1642248000',
'X-RateLimit-Window': '3600'
```

### Rate Limit Configuration
```typescript
interface RateLimitConfig {
  sync: {
    requests: 100;
    window: 3600; // 1 hour
  };
  analytics: {
    requests: 50;
    window: 3600; // 1 hour
  };
  search: {
    requests: 200;
    window: 3600; // 1 hour
  };
}
```

## SDK Integration (Future)

### React Native SDK
```typescript
// SDK initialization
import { CoffeeTastingSDK } from 'coffee-tasting-sdk';

const sdk = new CoffeeTastingSDK({
  apiKey: 'your-api-key',
  environment: 'production',
  baseURL: 'https://api.coffeetasting.com'
});

// SDK usage
const tastings = await sdk.tastings.getRecent(10);
const syncResult = await sdk.sync.uploadTastings(localTastings);
```

### Third-party Integrations
```typescript
// Coffee shop POS integration
interface POSIntegration {
  getCoffeeMenu(): Promise<CoffeeItem[]>;
  recordPurchase(item: CoffeeItem): Promise<void>;
  linkTastingToOrder(tastingId: string, orderId: string): Promise<void>;
}

// Roaster catalog integration
interface RoasterCatalog {
  searchCoffees(query: string): Promise<CoffeeInfo[]>;
  getCoffeeDetails(id: string): Promise<CoffeeInfo>;
  getRoasterNotes(coffeeId: string): Promise<string>;
}
```

This API documentation provides a comprehensive guide for current internal APIs and future external API specifications. As the application evolves, this documentation will be updated to reflect new features and capabilities.