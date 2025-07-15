import Realm from 'realm';
import uuid from 'react-native-uuid';
import {
  schemas,
  ITastingRecord,
  ICoffeeLibrary,
  ICafeInfo,
  IRoasterInfo,
  IFlavorNote,
  ISensoryAttribute,
} from './schemas';
import { SelectedFlavors, SensoryAttributes } from '../../stores/tastingStore';

class RealmService {
  private static instance: RealmService;
  private realm: Realm | null = null;

  private constructor() {}

  static getInstance(): RealmService {
    if (!RealmService.instance) {
      RealmService.instance = new RealmService();
    }
    return RealmService.instance;
  }

  async initialize(): Promise<void> {
    try {
      if (this.realm && !this.realm.isClosed) {
        console.log('Realm already initialized');
        return;
      }

      this.realm = await Realm.open({
        schema: schemas,
        schemaVersion: 1,
        migration: (oldRealm, newRealm) => {
          // Handle migrations here
          // Version 1: Initial schema
        },
        deleteRealmIfMigrationNeeded: __DEV__, // Only in development
      });
      
      console.log('Realm initialized successfully');
      console.log('Realm path:', this.realm.path);
    } catch (error) {
      console.error('Failed to initialize Realm:', error);
      throw new Error(`Realm initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getRealm(): Realm {
    if (!this.realm) {
      throw new Error('Realm not initialized. Call initialize() first.');
    }
    return this.realm;
  }

  // Main saveTasting method - saves complete tasting data
  async saveTasting(data: {
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
  }): Promise<ITastingRecord> {
    const realm = this.getRealm();
    
    try {
      let savedRecord: ITastingRecord;
      
      realm.write(() => {
        // Create flavor notes from selected flavors
        const flavorNotes: IFlavorNote[] = [];
        
        // Add level 1 flavors
        data.selectedFlavors.level1.forEach(flavor => {
          flavorNotes.push({
            level: 1,
            value: flavor,
            koreanValue: undefined, // TODO: Add Korean translation
          });
        });
        
        // Add level 2 flavors
        data.selectedFlavors.level2.forEach(flavor => {
          flavorNotes.push({
            level: 2,
            value: flavor,
            koreanValue: undefined,
          });
        });
        
        // Add level 3 flavors
        data.selectedFlavors.level3.forEach(flavor => {
          flavorNotes.push({
            level: 3,
            value: flavor,
            koreanValue: undefined,
          });
        });
        
        // Add level 4 flavors
        data.selectedFlavors.level4.forEach(flavor => {
          flavorNotes.push({
            level: 4,
            value: flavor,
            koreanValue: undefined,
          });
        });
        
        // Create sensory attribute
        const sensoryAttribute: ISensoryAttribute = {
          body: data.sensoryAttributes.body,
          acidity: data.sensoryAttributes.acidity,
          sweetness: data.sensoryAttributes.sweetness,
          finish: data.sensoryAttributes.finish,
          mouthfeel: data.sensoryAttributes.mouthfeel,
        };
        
        // Create the tasting record
        savedRecord = realm.create<ITastingRecord>('TastingRecord', {
          id: uuid.v4() as string,
          createdAt: new Date(),
          updatedAt: new Date(),
          
          // Coffee info
          cafeName: data.coffeeInfo.cafeName,
          roastery: data.coffeeInfo.roastery,
          coffeeName: data.coffeeInfo.coffeeName,
          origin: data.coffeeInfo.origin,
          variety: data.coffeeInfo.variety,
          altitude: data.coffeeInfo.altitude,
          process: data.coffeeInfo.process,
          temperature: data.coffeeInfo.temperature,
          
          // Roaster notes
          roasterNotes: data.roasterNotes,
          
          // Match scores
          matchScoreTotal: data.matchScore.total,
          matchScoreFlavor: data.matchScore.flavorScore,
          matchScoreSensory: data.matchScore.sensoryScore,
          
          // Relationships
          flavorNotes: flavorNotes,
          sensoryAttribute: sensoryAttribute,
          
          // Sync status
          isSynced: false,
          isDeleted: false,
        });
        
        // Update coffee library
        this.updateCoffeeLibrary({
          roastery: data.coffeeInfo.roastery,
          coffeeName: data.coffeeInfo.coffeeName,
          origin: data.coffeeInfo.origin,
          variety: data.coffeeInfo.variety,
          altitude: data.coffeeInfo.altitude,
          process: data.coffeeInfo.process,
          roasterNotes: data.roasterNotes,
        });
        
        // Update cafe visit count if cafe name provided
        if (data.coffeeInfo.cafeName) {
          const existingCafe = realm.objects<ICafeInfo>('CafeInfo')
            .filtered('name = $0', data.coffeeInfo.cafeName)[0];
          
          if (existingCafe) {
            existingCafe.visitCount += 1;
            existingCafe.lastVisitedAt = new Date();
            existingCafe.updatedAt = new Date();
          } else {
            // Create new cafe entry
            realm.create<ICafeInfo>('CafeInfo', {
              id: uuid.v4() as string,
              name: data.coffeeInfo.cafeName,
              createdAt: new Date(),
              updatedAt: new Date(),
              visitCount: 1,
              lastVisitedAt: new Date(),
            });
          }
        }
        
        // Update roaster stats
        const existingRoaster = realm.objects<IRoasterInfo>('RoasterInfo')
          .filtered('name = $0', data.coffeeInfo.roastery)[0];
        
        if (existingRoaster) {
          existingRoaster.coffeeCount += 1;
          const currentAvg = existingRoaster.averageScore || 0;
          const currentCount = existingRoaster.coffeeCount - 1;
          existingRoaster.averageScore = 
            (currentAvg * currentCount + data.matchScore.total) / existingRoaster.coffeeCount;
          existingRoaster.updatedAt = new Date();
        } else {
          // Create new roaster entry
          realm.create<IRoasterInfo>('RoasterInfo', {
            id: uuid.v4() as string,
            name: data.coffeeInfo.roastery,
            createdAt: new Date(),
            updatedAt: new Date(),
            coffeeCount: 1,
            averageScore: data.matchScore.total,
          });
        }
      });
      
      console.log('Tasting saved successfully:', savedRecord!.id);
      return savedRecord!;
      
    } catch (error) {
      console.error('Failed to save tasting:', error);
      throw new Error(`Failed to save tasting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get recent tastings with limit
  getRecentTastings(limit: number = 10): ITastingRecord[] {
    try {
      const realm = this.getRealm();
      const records = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('isDeleted = false')
        .sorted('createdAt', true);
      
      // Convert to array and limit results
      const results: ITastingRecord[] = [];
      for (let i = 0; i < Math.min(limit, records.length); i++) {
        results.push(records[i]);
      }
      
      return results;
    } catch (error) {
      console.error('Failed to get recent tastings:', error);
      throw new Error(`Failed to get recent tastings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update coffee library when saving a tasting
  private updateCoffeeLibrary(coffeeData: {
    roastery: string;
    coffeeName: string;
    origin?: string;
    variety?: string;
    altitude?: string;
    process?: string;
    roasterNotes?: string;
  }): void {
    const realm = this.getRealm();
    
    try {
      // Check if this coffee already exists
      const existingCoffee = realm.objects<ICoffeeLibrary>('CoffeeLibrary')
        .filtered('roastery = $0 AND coffeeName = $1', coffeeData.roastery, coffeeData.coffeeName)[0];
      
      if (existingCoffee) {
        // Update use count and last used date
        existingCoffee.useCount += 1;
        existingCoffee.lastUsedAt = new Date();
        existingCoffee.updatedAt = new Date();
        
        // Update fields if they were empty before
        if (!existingCoffee.origin && coffeeData.origin) {
          existingCoffee.origin = coffeeData.origin;
        }
        if (!existingCoffee.variety && coffeeData.variety) {
          existingCoffee.variety = coffeeData.variety;
        }
        if (!existingCoffee.altitude && coffeeData.altitude) {
          existingCoffee.altitude = coffeeData.altitude;
        }
        if (!existingCoffee.process && coffeeData.process) {
          existingCoffee.process = coffeeData.process;
        }
        if (!existingCoffee.roasterNotes && coffeeData.roasterNotes) {
          existingCoffee.roasterNotes = coffeeData.roasterNotes;
        }
      } else {
        // Create new coffee entry
        realm.create<ICoffeeLibrary>('CoffeeLibrary', {
          id: uuid.v4() as string,
          ...coffeeData,
          createdAt: new Date(),
          updatedAt: new Date(),
          useCount: 1,
          lastUsedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to update coffee library:', error);
      // Don't throw here, this is a non-critical operation
    }
  }

  // Get cafes by name for autocomplete
  getCafesByName(searchText: string, limit: number = 10): ICafeInfo[] {
    try {
      const realm = this.getRealm();
      
      if (!searchText || searchText.trim().length === 0) {
        // Return most visited cafes if no search text
        const results = realm.objects<ICafeInfo>('CafeInfo')
          .sorted('visitCount', true);
        
        const cafes: ICafeInfo[] = [];
        for (let i = 0; i < Math.min(limit, results.length); i++) {
          cafes.push(results[i]);
        }
        return cafes;
      }
      
      // Search by name
      const results = realm.objects<ICafeInfo>('CafeInfo')
        .filtered('name CONTAINS[c] $0', searchText.trim())
        .sorted('visitCount', true);
      
      const cafes: ICafeInfo[] = [];
      for (let i = 0; i < Math.min(limit, results.length); i++) {
        cafes.push(results[i]);
      }
      
      return cafes;
    } catch (error) {
      console.error('Failed to get cafes by name:', error);
      return [];
    }
  }

  // Get roasters by cafe
  getRoastersByCafe(cafeName: string): string[] {
    try {
      const realm = this.getRealm();
      
      // Get all tastings from this cafe
      const tastings = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('cafeName = $0 AND isDeleted = false', cafeName);
      
      // Extract unique roasters
      const roasterSet = new Set<string>();
      tastings.forEach(tasting => {
        roasterSet.add(tasting.roastery);
      });
      
      // Convert to array and sort by frequency
      const roasterCounts = new Map<string, number>();
      tastings.forEach(tasting => {
        roasterCounts.set(
          tasting.roastery,
          (roasterCounts.get(tasting.roastery) || 0) + 1
        );
      });
      
      return Array.from(roasterSet).sort((a, b) => {
        const countA = roasterCounts.get(a) || 0;
        const countB = roasterCounts.get(b) || 0;
        return countB - countA;
      });
    } catch (error) {
      console.error('Failed to get roasters by cafe:', error);
      return [];
    }
  }

  // Tasting Record Methods
  createTastingRecord(data: Omit<ITastingRecord, 'id' | 'createdAt' | 'updatedAt'>): ITastingRecord {
    const realm = this.getRealm();
    let record: ITastingRecord;

    realm.write(() => {
      record = realm.create<ITastingRecord>('TastingRecord', {
        id: `tasting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      });
    });

    return record!;
  }

  getTastingRecords(filter?: {
    isDeleted?: boolean;
    isSynced?: boolean;
    roastery?: string;
    minScore?: number;
  }): Realm.Results<ITastingRecord> {
    const realm = this.getRealm();
    let query = realm.objects<ITastingRecord>('TastingRecord');

    if (filter) {
      const conditions: string[] = [];
      
      if (filter.isDeleted !== undefined) {
        conditions.push(`isDeleted = ${filter.isDeleted}`);
      }
      if (filter.isSynced !== undefined) {
        conditions.push(`isSynced = ${filter.isSynced}`);
      }
      if (filter.roastery) {
        conditions.push(`roastery = "${filter.roastery}"`);
      }
      if (filter.minScore !== undefined) {
        conditions.push(`matchScoreTotal >= ${filter.minScore}`);
      }

      if (conditions.length > 0) {
        query = query.filtered(conditions.join(' AND '));
      }
    }

    return query.sorted('createdAt', true);
  }

  getTastingRecordById(id: string): ITastingRecord | null {
    const realm = this.getRealm();
    return realm.objectForPrimaryKey<ITastingRecord>('TastingRecord', id);
  }

  updateTastingRecord(id: string, updates: Partial<ITastingRecord>): void {
    const realm = this.getRealm();
    const record = this.getTastingRecordById(id);

    if (!record) {
      throw new Error(`Tasting record with id ${id} not found`);
    }

    realm.write(() => {
      Object.assign(record, {
        ...updates,
        updatedAt: new Date(),
      });
    });
  }

  deleteTastingRecord(id: string, hardDelete: boolean = false): void {
    const realm = this.getRealm();
    const record = this.getTastingRecordById(id);

    if (!record) {
      throw new Error(`Tasting record with id ${id} not found`);
    }

    realm.write(() => {
      if (hardDelete) {
        realm.delete(record);
      } else {
        record.isDeleted = true;
        record.updatedAt = new Date();
      }
    });
  }

  // Coffee Library Methods
  addCoffeeToLibrary(coffee: Omit<ICoffeeLibrary, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>): ICoffeeLibrary {
    const realm = this.getRealm();
    let coffeeRecord: ICoffeeLibrary;

    realm.write(() => {
      coffeeRecord = realm.create<ICoffeeLibrary>('CoffeeLibrary', {
        id: `coffee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        useCount: 0,
        ...coffee,
      });
    });

    return coffeeRecord!;
  }

  searchCoffeeLibrary(searchTerm: string): Realm.Results<ICoffeeLibrary> {
    const realm = this.getRealm();
    return realm.objects<ICoffeeLibrary>('CoffeeLibrary')
      .filtered(
        'coffeeName CONTAINS[c] $0 OR roastery CONTAINS[c] $0 OR origin CONTAINS[c] $0',
        searchTerm
      )
      .sorted('useCount', true);
  }

  incrementCoffeeUseCount(coffeeId: string): void {
    const realm = this.getRealm();
    const coffee = realm.objectForPrimaryKey<ICoffeeLibrary>('CoffeeLibrary', coffeeId);

    if (coffee) {
      realm.write(() => {
        coffee.useCount += 1;
        coffee.lastUsedAt = new Date();
        coffee.updatedAt = new Date();
      });
    }
  }

  // Cafe Methods
  addCafe(cafe: Omit<ICafeInfo, 'id' | 'createdAt' | 'updatedAt' | 'visitCount'>): ICafeInfo {
    const realm = this.getRealm();
    let cafeRecord: ICafeInfo;

    realm.write(() => {
      cafeRecord = realm.create<ICafeInfo>('CafeInfo', {
        id: `cafe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        visitCount: 0,
        ...cafe,
      });
    });

    return cafeRecord!;
  }

  searchCafes(searchTerm: string): Realm.Results<ICafeInfo> {
    const realm = this.getRealm();
    return realm.objects<ICafeInfo>('CafeInfo')
      .filtered('name CONTAINS[c] $0', searchTerm)
      .sorted('visitCount', true);
  }

  // Roaster Methods
  addRoaster(roaster: Omit<IRoasterInfo, 'id' | 'createdAt' | 'updatedAt' | 'coffeeCount'>): IRoasterInfo {
    const realm = this.getRealm();
    let roasterRecord: IRoasterInfo;

    realm.write(() => {
      roasterRecord = realm.create<IRoasterInfo>('RoasterInfo', {
        id: `roaster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        coffeeCount: 0,
        ...roaster,
      });
    });

    return roasterRecord!;
  }

  searchRoasters(searchTerm: string): Realm.Results<IRoasterInfo> {
    const realm = this.getRealm();
    return realm.objects<IRoasterInfo>('RoasterInfo')
      .filtered('name CONTAINS[c] $0', searchTerm)
      .sorted('coffeeCount', true);
  }

  updateRoasterStats(roasterName: string, newScore: number): void {
    const realm = this.getRealm();
    const roaster = realm.objects<IRoasterInfo>('RoasterInfo')
      .filtered('name = $0', roasterName)[0];

    if (roaster) {
      realm.write(() => {
        roaster.coffeeCount += 1;
        if (roaster.averageScore) {
          // Calculate new average
          const totalScore = roaster.averageScore * (roaster.coffeeCount - 1) + newScore;
          roaster.averageScore = totalScore / roaster.coffeeCount;
        } else {
          roaster.averageScore = newScore;
        }
        roaster.updatedAt = new Date();
      });
    }
  }

  // Sync Methods
  getUnsyncedRecords(): Realm.Results<ITastingRecord> {
    const realm = this.getRealm();
    return realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isSynced = false AND isDeleted = false');
  }

  markAsSynced(recordIds: string[]): void {
    const realm = this.getRealm();
    
    realm.write(() => {
      recordIds.forEach(id => {
        const record = realm.objectForPrimaryKey<ITastingRecord>('TastingRecord', id);
        if (record) {
          record.isSynced = true;
          record.syncedAt = new Date();
        }
      });
    });
  }

  // Statistics Methods
  getTastingStatistics(): {
    totalTastings: number;
    averageScore: number;
    topRoasters: { name: string; count: number; avgScore: number }[];
    favoriteOrigins: { origin: string; count: number }[];
    flavorProfile: { flavor: string; count: number }[];
  } {
    const realm = this.getRealm();
    const records = realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isDeleted = false');

    // Calculate statistics
    const totalTastings = records.length;
    const averageScore = records.avg('matchScoreTotal') || 0;

    // Group by roasters
    const roasterStats = new Map<string, { count: number; totalScore: number }>();
    records.forEach(record => {
      const current = roasterStats.get(record.roastery) || { count: 0, totalScore: 0 };
      roasterStats.set(record.roastery, {
        count: current.count + 1,
        totalScore: current.totalScore + record.matchScoreTotal,
      });
    });

    const topRoasters = Array.from(roasterStats.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        avgScore: stats.totalScore / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Group by origins
    const originCounts = new Map<string, number>();
    records.forEach(record => {
      if (record.origin) {
        originCounts.set(record.origin, (originCounts.get(record.origin) || 0) + 1);
      }
    });

    const favoriteOrigins = Array.from(originCounts.entries())
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Flavor profile
    const flavorCounts = new Map<string, number>();
    records.forEach(record => {
      record.flavorNotes.forEach(note => {
        flavorCounts.set(note.value, (flavorCounts.get(note.value) || 0) + 1);
      });
    });

    const flavorProfile = Array.from(flavorCounts.entries())
      .map(([flavor, count]) => ({ flavor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalTastings,
      averageScore,
      topRoasters,
      favoriteOrigins,
      flavorProfile,
    };
  }

  // Development helper: Clear all tasting records
  clearAllTastings(): void {
    const realm = this.getRealm();
    
    try {
      realm.write(() => {
        // Delete all tasting records
        const tastingRecords = realm.objects<ITastingRecord>('TastingRecord');
        realm.delete(tastingRecords);
        
        // Delete all coffee library entries
        const coffeeLibrary = realm.objects<ICoffeeLibrary>('CoffeeLibrary');
        realm.delete(coffeeLibrary);
        
        // Delete all cafe info
        const cafeInfo = realm.objects<ICafeInfo>('CafeInfo');
        realm.delete(cafeInfo);
        
        // Delete all roaster info
        const roasterInfo = realm.objects<IRoasterInfo>('RoasterInfo');
        realm.delete(roasterInfo);
      });
      
      console.log('All tasting records cleared successfully');
    } catch (error) {
      console.error('Failed to clear all tastings:', error);
      throw new Error(`Failed to clear all tastings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Cleanup
  close(): void {
    if (this.realm && !this.realm.isClosed) {
      this.realm.close();
      this.realm = null;
    }
  }
}

export default RealmService;