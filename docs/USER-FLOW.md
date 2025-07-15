# Coffee Tasting Journal - User Flow

## Overview
The Coffee Tasting Journal app guides users through a 6-step process to record and evaluate their coffee tasting experience. The app compares user selections with roaster notes to calculate a match score.

## Complete Flow Diagram

```
Home Screen
    ↓
Coffee Info (Step 1)
    ↓
Roaster Notes (Step 2)
    ↓ (can skip)
Flavor Level 1 (Step 3)
    ↓
Flavor Level 2 (Step 4)
    ↓ (can skip)
Flavor Level 3 (Step 5)
    ↓ (can skip)
Flavor Level 4 (Step 6)
    ↓ (can skip)
Sensory Evaluation (Step 6)
    ↓
Result Screen
```

## Detailed Steps

### 1. Home Screen
- **Purpose**: Entry point for new tasting session
- **Actions**:
  - "새 테이스팅 시작" button → navigates to Coffee Info
- **Data**: None saved

### 2. Coffee Info Screen (Step 1/6)
- **Purpose**: Collect basic coffee information
- **Fields** (8 total):
  1. 카페 이름 (Cafe Name) - optional
  2. 로스터리 (Roastery) - required*
  3. 커피 이름 (Coffee Name) - required*
  4. 생산지 (Origin) - optional
  5. 품종 (Variety) - optional
  6. 고도 (Altitude) - optional
  7. 가공 방식 (Process) - optional
  8. 온도 (Temperature) - toggle: Hot/Ice
- **Navigation**:
  - Next button → Roaster Notes (enabled when required fields filled)
- **Data Saved**: All fields stored in `currentTasting` object

### 3. Roaster Notes Screen (Step 2/6)
- **Purpose**: Record roaster's cupping notes
- **Fields**:
  - Multi-line text input for roaster's flavor description
  - Example: "블루베리, 다크 초콜릿, 꿀"
- **Navigation**:
  - Skip button → Flavor Level 1
  - Next button → Flavor Level 1
- **Data Saved**: `roasterNotes` string

### 4. Flavor Selection - Level 1 (Step 3/6)
- **Purpose**: Select main SCA flavor categories
- **Options** (9 categories in 3x3 grid):
  - Fruity (과일)
  - Sour/Fermented (신맛/발효)
  - Green/Vegetative (풀/식물)
  - Other (기타)
  - Roasted (로스팅)
  - Spices (향신료)
  - Nutty/Cocoa (견과류/코코아)
  - Sweet (달콤한)
  - Floral (꽃)
- **Behavior**:
  - Multi-select (can choose multiple)
  - Minimum 1 selection required
- **Navigation**:
  - Next button → Flavor Level 2 (enabled when ≥1 selected)
- **Data Saved**: `selectedFlavors.level1[]`

### 5. Flavor Selection - Level 2 (Step 4/6)
- **Purpose**: Select subcategories based on Level 1 choices
- **Options**: Dynamic based on Level 1 selections
  - Shows only subcategories for selected main categories
  - Organized by section headers (e.g., "Fruity 하위")
- **Behavior**:
  - Multi-select
  - Minimum 1 selection required
- **Navigation**:
  - Skip button → Sensory Evaluation
  - Next button → Flavor Level 3 (enabled when ≥1 selected)
- **Data Saved**: `selectedFlavors.level2[]`

### 6. Flavor Selection - Level 3 (Step 5/6)
- **Purpose**: Select specific flavors based on Level 2 choices
- **Options**: Dynamic based on Level 2 selections
  - Example: Berry → [Blackberry, Raspberry, Blueberry, Strawberry]
- **Behavior**:
  - Multi-select
  - Auto-skips if no Level 3 options available
  - Minimum 1 selection required if options exist
- **Navigation**:
  - Skip button → Sensory Evaluation
  - Next button → Flavor Level 4 (enabled when ≥1 selected)
- **Data Saved**: `selectedFlavors.level3[]`

### 7. Flavor Selection - Level 4 (Step 6/6)
- **Purpose**: Select flavor descriptors (optional)
- **Options**: Dynamic based on Level 3 selections
  - Example: Blackberry → [Fresh, Ripe, Jammy]
- **Behavior**:
  - Multi-select
  - Optional (can proceed without selection)
  - Auto-skips if no Level 4 options available
- **Navigation**:
  - Skip button → Sensory Evaluation
  - Next button → Sensory Evaluation (always enabled)
- **Data Saved**: `selectedFlavors.level4[]`

### 8. Sensory Evaluation (Step 6/6)
- **Purpose**: Rate sensory attributes
- **Fields** (5 attributes):
  1. **바디감 (Body)**: 1-5 slider
     - 1 = 가벼움 (Light)
     - 5 = 무거움 (Heavy)
  2. **산미 (Acidity)**: 1-5 slider
     - 1 = 약함 (Low)
     - 5 = 강함 (High)
  3. **단맛 (Sweetness)**: 1-5 slider
     - 1 = 없음 (None)
     - 5 = 강함 (High)
  4. **여운 (Finish)**: 1-5 slider
     - 1 = 짧음 (Short)
     - 5 = 길음 (Long)
  5. **입안 느낌 (Mouthfeel)**: 4 selection buttons
     - Clean (깔끔한)
     - Creamy (크리미한)
     - Juicy (쥬시한)
     - Silky (실키한)
- **Default Values**: All sliders start at 3, Mouthfeel defaults to "Clean"
- **Navigation**:
  - Complete button → Result Screen
- **Data Saved**: `sensoryAttributes` object

### 9. Result Screen
- **Purpose**: Display tasting results and match score
- **Display Elements**:
  1. **Match Score**: Large percentage (0-100%)
     - Celebration animation for scores >80%
  2. **Coffee Info**: Name and roastery
  3. **Comparison View**:
     - Left: Roaster Notes
     - Right: Your selected flavors
  4. **Sensory Chart**: Bar chart visualization
  5. **Save Status**: "기록이 저장되었습니다 ✓"
- **Navigation**:
  - "새 테이스팅" → Reset store & go to Home
  - "홈으로" → Go to Home (keep data)
- **Data Saved**: Complete tasting record with timestamp and match score

## Skip Button Behavior

The skip button appears on:
- **Roaster Notes**: Skips to Flavor Level 1
- **Flavor Level 2**: Skips remaining flavor levels → Sensory
- **Flavor Level 3**: Skips to Level 4 or Sensory
- **Flavor Level 4**: Skips to Sensory

## Data Persistence

### During Flow
- All data is stored in Zustand store
- Progress is tracked with `currentStep`
- User can navigate back without losing data

### On Completion
- `saveTasting()` creates a complete record with:
  - Unique ID and timestamp
  - All coffee info
  - Roaster notes
  - Selected flavors (all levels)
  - Sensory attributes
  - Calculated match score
- Currently logs to console (ready for AsyncStorage/SQLite integration)

## Match Score Calculation
- **60% weight**: Flavor match (keyword matching between roaster notes and selections)
- **40% weight**: Sensory match (sensory keywords in roaster notes vs. ratings)
- Score range: 0-100%
- Uses forgiving curve for better user experience