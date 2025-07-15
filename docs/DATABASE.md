# Coffee Tasting Journal - Database Architecture

## Overview
The app uses a hybrid storage approach:
- **Realm**: Local-first storage for offline functionality
- **Supabase**: Cloud storage for backup and cross-device sync
- **Sync Strategy**: Bidirectional sync with conflict resolution

## Realm Schemas (Local Storage)

### 1. TastingRecord Schema

```typescript
class TastingRecord extends Realm.Object {
  static schema = {
    name: 'TastingRecord',
    primaryKey: 'id',
    properties: {
      // Identity
      id: 'string',                    // UUID format: 'tasting_1234567890'
      userId: 'string?',               // Optional, for future user accounts
      
      // Timestamps
      createdAt: 'date',
      updatedAt: 'date',
      syncedAt: 'date?',              // Last sync with Supabase
      
      // Coffee Information
      cafeName: 'string?',
      roastery: 'string',
      coffeeName: 'string',
      origin: 'string?',
      variety: 'string?',
      altitude: 'string?',
      process: 'string?',
      temperature: 'string',           // 'hot' | 'ice'
      
      // Roaster Notes
      roasterNotes: 'string?',
      
      // Match Score
      matchScoreTotal: 'int',          // 0-100
      matchScoreFlavor: 'int',         // 0-100
      matchScoreSensory: 'int',        // 0-100
      
      // Relationships
      flavorNotes: 'FlavorNote[]',
      sensoryAttribute: 'SensoryAttribute',
      
      // Sync Status
      isSynced: { type: 'bool', default: false },
      isDeleted: { type: 'bool', default: false },
    }
  };
}
```

### 2. FlavorNote Schema

```typescript
class FlavorNote extends Realm.Object {
  static schema = {
    name: 'FlavorNote',
    embedded: true,                    // Embedded in TastingRecord
    properties: {
      level: 'int',                    // 1, 2, 3, or 4
      value: 'string',                 // e.g., 'Fruity', 'Berry', 'Blackberry'
      koreanValue: 'string?',          // e.g., '과일', '베리류', '블랙베리'
    }
  };
}
```

### 3. SensoryAttribute Schema

```typescript
class SensoryAttribute extends Realm.Object {
  static schema = {
    name: 'SensoryAttribute',
    embedded: true,                    // Embedded in TastingRecord
    properties: {
      body: 'int',                     // 1-5
      acidity: 'int',                  // 1-5
      sweetness: 'int',                // 1-5
      finish: 'int',                   // 1-5
      mouthfeel: 'string',             // 'Clean' | 'Creamy' | 'Juicy' | 'Silky'
    }
  };
}
```

### 4. User Schema (Future)

```typescript
class User extends Realm.Object {
  static schema = {
    name: 'User',
    primaryKey: 'id',
    properties: {
      id: 'string',                    // UUID from Supabase Auth
      email: 'string',
      displayName: 'string?',
      avatarUrl: 'string?',
      preferences: 'UserPreferences',
      createdAt: 'date',
      lastSyncedAt: 'date?',
    }
  };
}
```

## Supabase Tables (Cloud Storage)

### 1. tastings Table

```sql
CREATE TABLE tastings (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  realm_id TEXT UNIQUE,  -- Maps to Realm's string ID
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Coffee Information
  cafe_name TEXT,
  roastery TEXT NOT NULL,
  coffee_name TEXT NOT NULL,
  origin TEXT,
  variety TEXT,
  altitude TEXT,
  process TEXT,
  temperature TEXT CHECK (temperature IN ('hot', 'ice')),
  
  -- Roaster Notes
  roaster_notes TEXT,
  
  -- Match Scores
  match_score_total INTEGER CHECK (match_score_total >= 0 AND match_score_total <= 100),
  match_score_flavor INTEGER CHECK (match_score_flavor >= 0 AND match_score_flavor <= 100),
  match_score_sensory INTEGER CHECK (match_score_sensory >= 0 AND match_score_sensory <= 100),
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_tastings_user_id ON tastings(user_id);
CREATE INDEX idx_tastings_created_at ON tastings(created_at);
CREATE INDEX idx_tastings_realm_id ON tastings(realm_id);
```

### 2. flavor_notes Table

```sql
CREATE TABLE flavor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tasting_id UUID REFERENCES tastings(id) ON DELETE CASCADE,
  
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4),
  value TEXT NOT NULL,
  korean_value TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_flavor_notes_tasting_id ON flavor_notes(tasting_id);
CREATE INDEX idx_flavor_notes_level ON flavor_notes(level);
```

### 3. sensory_attributes Table

```sql
CREATE TABLE sensory_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tasting_id UUID UNIQUE REFERENCES tastings(id) ON DELETE CASCADE,
  
  body INTEGER NOT NULL CHECK (body >= 1 AND body <= 5),
  acidity INTEGER NOT NULL CHECK (acidity >= 1 AND acidity <= 5),
  sweetness INTEGER NOT NULL CHECK (sweetness >= 1 AND sweetness <= 5),
  finish INTEGER NOT NULL CHECK (finish >= 1 AND finish <= 5),
  mouthfeel TEXT NOT NULL CHECK (mouthfeel IN ('Clean', 'Creamy', 'Juicy', 'Silky')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_sensory_attributes_tasting_id ON sensory_attributes(tasting_id);
```

### 4. sync_log Table

```sql
CREATE TABLE sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  device_id TEXT NOT NULL,
  
  sync_type TEXT CHECK (sync_type IN ('upload', 'download', 'conflict')),
  entity_type TEXT CHECK (entity_type IN ('tasting', 'user_preferences')),
  entity_id TEXT,
  
  status TEXT CHECK (status IN ('success', 'failed', 'conflict_resolved')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sync_log_user_id ON sync_log(user_id);
CREATE INDEX idx_sync_log_created_at ON sync_log(created_at);
```

## Data Sync Strategy

### 1. Sync Triggers

- **Immediate Sync**: When online and user completes a tasting
- **Background Sync**: Every 5 minutes when app is active
- **Manual Sync**: Pull-to-refresh on home screen
- **App Launch**: Check for pending syncs

### 2. Sync Process

```typescript
interface SyncProcess {
  // 1. Check connectivity
  checkNetworkStatus(): boolean;
  
  // 2. Upload local changes
  uploadPendingTastings(): Promise<void>;
  
  // 3. Download remote changes
  downloadRemoteTastings(): Promise<void>;
  
  // 4. Resolve conflicts
  resolveConflicts(): Promise<void>;
  
  // 5. Update sync status
  updateSyncTimestamps(): Promise<void>;
}
```

### 3. Conflict Resolution

**Strategy**: Last-Write-Wins with Full Record Preservation

```typescript
interface ConflictResolution {
  // Compare timestamps
  localRecord: TastingRecord;
  remoteRecord: SupabaseTasting;
  
  resolution: {
    // If local is newer: upload local
    // If remote is newer: download remote
    // If equal: prefer remote (server authority)
    winner: 'local' | 'remote';
    
    // Archive losing version
    archived: TastingRecord;
  };
}
```

### 4. Offline Queue

```typescript
interface OfflineQueue {
  pendingUploads: TastingRecord[];
  failedUploads: {
    record: TastingRecord;
    error: Error;
    retryCount: number;
    nextRetry: Date;
  }[];
}
```

## Migration Strategy

### Phase 1: Local Only (Current)
- Store in Zustand (session)
- No persistence

### Phase 2: Realm Integration
- Add Realm for local persistence
- Offline-first functionality
- Local search and filtering

### Phase 3: Supabase Integration
- Add authentication
- Enable cloud sync
- Cross-device access

### Phase 4: Advanced Features
- Real-time collaboration
- Social features (share tastings)
- Export functionality

## Performance Considerations

### Realm Optimizations
- Use embedded objects for FlavorNote and SensoryAttribute
- Index frequently queried fields
- Lazy load relationships
- Batch write operations

### Supabase Optimizations
- Use connection pooling
- Implement request batching
- Cache frequently accessed data
- Use Supabase Realtime selectively

## Security Considerations

### Local Storage
- Encrypt Realm database
- Use iOS Keychain / Android Keystore for sensitive data
- Clear cache on logout

### Cloud Storage
- Row Level Security (RLS) policies
- User can only access their own records
- API rate limiting
- Secure file uploads for future photo features

## Backup Strategy

### Local Backups
- Auto-backup Realm to app documents
- Export to JSON capability
- iCloud/Google Drive integration

### Cloud Backups
- Supabase automatic backups
- Point-in-time recovery
- Export to CSV/JSON from admin panel