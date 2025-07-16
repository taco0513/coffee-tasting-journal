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
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): RealmService {
    if (!RealmService.instance) {
      RealmService.instance = new RealmService();
    }
    return RealmService.instance;
  }

  get isInitialized(): boolean {
    return this.initialized;
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
        shouldCompactOnLaunch: (totalSize, usedSize) => {
          // Compact if the file is over 25MB in size and less than 50% 'used'
          const twentyFiveMB = 25 * 1024 * 1024;
          const shouldCompact = totalSize > twentyFiveMB && usedSize / totalSize < 0.5;
          
          if (shouldCompact) {
            console.log(`Realm compaction triggered - Total: ${(totalSize/1024/1024).toFixed(2)}MB, Used: ${(usedSize/1024/1024).toFixed(2)}MB`);
          }
          
          return shouldCompact;
        },
      });
      
      this.initialized = true;
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
    coffeeInfo?: {
      cafeName?: string;
      roastery?: string;
      coffeeName?: string;
      origin?: string;
      variety?: string;
      altitude?: string;
      process?: string;
      temperature?: 'hot' | 'ice';
    };
    roasterNotes?: string;
    selectedFlavors?: any[];
    sensoryAttributes?: any;
    matchScore?: {
      total?: number;
      flavorScore?: number;
      sensoryScore?: number;
    };
  }): Promise<ITastingRecord> {
    console.log('=== saveTasting 시작 ===');
    console.log('전달받은 데이터:', data);
    
    const realm = this.getRealm();
    
    try {
      let savedRecord: ITastingRecord;
      
      realm.write(() => {
        console.log('Realm write 시작');
        
        // 기본값 설정
        const defaultCoffeeInfo = {
          cafeName: '',
          roastery: 'Unknown',
          coffeeName: 'Unknown Coffee',
          origin: '',
          variety: '',
          altitude: '',
          process: '',
          temperature: 'hot' as const,
        };
        
        const defaultSensoryAttributes = {
          body: 3,
          acidity: 3,
          sweetness: 3,
          finish: 3,
          mouthfeel: 'Clean',
        };
        
        const defaultMatchScore = {
          total: 0,
          flavorScore: 0,
          sensoryScore: 0,
        };
        
        // 안전한 데이터 추출
        const safeData = {
          coffeeInfo: { ...defaultCoffeeInfo, ...(data.coffeeInfo || {}) },
          roasterNotes: data.roasterNotes || '',
          selectedFlavors: data.selectedFlavors || [],
          sensoryAttributes: { ...defaultSensoryAttributes, ...(data.sensoryAttributes || {}) },
          matchScore: { ...defaultMatchScore, ...(data.matchScore || {}) },
        };
        
        console.log('안전한 데이터:', safeData);
        
        // Create flavor notes from selected flavors
        const flavorNotes: IFlavorNote[] = [];
        
        try {
          console.log('FlavorNotes 생성 시작');
          if (Array.isArray(safeData.selectedFlavors)) {
            safeData.selectedFlavors.forEach((flavorPath, index) => {
              console.log(`FlavorPath ${index}:`, flavorPath);
              
              if (flavorPath && typeof flavorPath === 'object') {
                // Level 1 flavor
                if (flavorPath.level1) {
                  flavorNotes.push({
                    level: 1,
                    value: flavorPath.level1,
                    koreanValue: undefined,
                  });
                }
                
                // Level 2 flavor
                if (flavorPath.level2) {
                  flavorNotes.push({
                    level: 2,
                    value: flavorPath.level2,
                    koreanValue: undefined,
                  });
                }
                
                // Level 3 flavor
                if (flavorPath.level3) {
                  flavorNotes.push({
                    level: 3,
                    value: flavorPath.level3,
                    koreanValue: undefined,
                  });
                }
                
                // Level 4 flavor
                if (flavorPath.level4) {
                  flavorNotes.push({
                    level: 4,
                    value: flavorPath.level4,
                    koreanValue: undefined,
                  });
                }
              }
            });
          }
          console.log('생성된 FlavorNotes:', flavorNotes);
        } catch (flavorError) {
          console.error('FlavorNotes 생성 중 에러:', flavorError);
        }
        
        // Create sensory attribute with safe access
        let sensoryAttribute: ISensoryAttribute;
        try {
          console.log('SensoryAttribute 생성 시작');
          sensoryAttribute = {
            body: safeData.sensoryAttributes.body || 3,
            acidity: safeData.sensoryAttributes.acidity || 3,
            sweetness: safeData.sensoryAttributes.sweetness || 3,
            finish: safeData.sensoryAttributes.finish || 3,
            mouthfeel: safeData.sensoryAttributes.mouthfeel || 'Clean',
          };
          console.log('생성된 SensoryAttribute:', sensoryAttribute);
        } catch (sensoryError) {
          console.error('SensoryAttribute 생성 중 에러:', sensoryError);
          sensoryAttribute = defaultSensoryAttributes;
        }
        
        // Create the tasting record
        try {
          console.log('TastingRecord 생성 시작');
          savedRecord = realm.create<ITastingRecord>('TastingRecord', {
            id: uuid.v4() as string,
            createdAt: new Date(),
            updatedAt: new Date(),
            
            // Coffee info
            cafeName: safeData.coffeeInfo.cafeName,
            roastery: safeData.coffeeInfo.roastery,
            coffeeName: safeData.coffeeInfo.coffeeName,
            origin: safeData.coffeeInfo.origin,
            variety: safeData.coffeeInfo.variety,
            altitude: safeData.coffeeInfo.altitude,
            process: safeData.coffeeInfo.process,
            temperature: safeData.coffeeInfo.temperature,
            
            // Roaster notes
            roasterNotes: safeData.roasterNotes,
            
            // Match scores
            matchScoreTotal: safeData.matchScore.total,
            matchScoreFlavor: safeData.matchScore.flavorScore,
            matchScoreSensory: safeData.matchScore.sensoryScore,
            
            // Relationships
            flavorNotes: flavorNotes,
            sensoryAttribute: sensoryAttribute,
            
            // Sync status
            isSynced: false,
            isDeleted: false,
          });
          console.log('TastingRecord 생성 완료:', savedRecord.id);
        } catch (recordError) {
          console.error('TastingRecord 생성 중 에러:', recordError);
          throw recordError;
        }
        
        // Update coffee library
        try {
          console.log('CoffeeLibrary 업데이트 시작');
          this.updateCoffeeLibrary({
            roastery: safeData.coffeeInfo.roastery,
            coffeeName: safeData.coffeeInfo.coffeeName,
            origin: safeData.coffeeInfo.origin,
            variety: safeData.coffeeInfo.variety,
            altitude: safeData.coffeeInfo.altitude,
            process: safeData.coffeeInfo.process,
            roasterNotes: safeData.roasterNotes,
          });
          console.log('CoffeeLibrary 업데이트 완료');
        } catch (libraryError) {
          console.error('CoffeeLibrary 업데이트 중 에러:', libraryError);
          // 라이브러리 업데이트 실패는 치명적이지 않으므로 계속 진행
        }
        
        // Update cafe visit count if cafe name provided
        try {
          console.log('Cafe 방문 카운트 업데이트 시작');
          if (safeData.coffeeInfo.cafeName) {
            const existingCafe = realm.objects<ICafeInfo>('CafeInfo')
              .filtered('name = $0', safeData.coffeeInfo.cafeName)[0];
            
            if (existingCafe) {
              existingCafe.visitCount += 1;
              existingCafe.lastVisitedAt = new Date();
              existingCafe.updatedAt = new Date();
            } else {
              // Create new cafe entry
              realm.create<ICafeInfo>('CafeInfo', {
                id: uuid.v4() as string,
                name: safeData.coffeeInfo.cafeName,
                createdAt: new Date(),
                updatedAt: new Date(),
                visitCount: 1,
                lastVisitedAt: new Date(),
              });
            }
          }
          console.log('Cafe 방문 카운트 업데이트 완료');
        } catch (cafeError) {
          console.error('Cafe 방문 카운트 업데이트 중 에러:', cafeError);
        }
        
        // Update roaster stats
        try {
          console.log('Roaster 통계 업데이트 시작');
          const existingRoaster = realm.objects<IRoasterInfo>('RoasterInfo')
            .filtered('name = $0', safeData.coffeeInfo.roastery)[0];
          
          if (existingRoaster) {
            existingRoaster.coffeeCount += 1;
            const currentAvg = existingRoaster.averageScore || 0;
            const currentCount = existingRoaster.coffeeCount - 1;
            existingRoaster.averageScore = 
              (currentAvg * currentCount + safeData.matchScore.total) / existingRoaster.coffeeCount;
            existingRoaster.updatedAt = new Date();
          } else {
            // Create new roaster entry
            realm.create<IRoasterInfo>('RoasterInfo', {
              id: uuid.v4() as string,
              name: safeData.coffeeInfo.roastery,
              createdAt: new Date(),
              updatedAt: new Date(),
              coffeeCount: 1,
              averageScore: safeData.matchScore.total,
            });
          }
          console.log('Roaster 통계 업데이트 완료');
        } catch (roasterError) {
          console.error('Roaster 통계 업데이트 중 에러:', roasterError);
        }
        
        console.log('Realm write 완료');
      });
      
      console.log('=== saveTasting 성공 ===');
      console.log('저장된 레코드 ID:', savedRecord!.id);
      return savedRecord!;
      
    } catch (error) {
      console.error('=== saveTasting 실패 ===');
      console.error('에러:', error);
      console.error('스택 추적:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`Failed to save tasting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get recent tastings with limit
  static async getRecentTastings(limit: number = 10): Promise<any[]> {
    try {
      const instance = RealmService.getInstance();
      
      // Realm이 초기화되지 않았으면 초기화 시도
      if (!instance.realm) {
        await instance.initialize();
      }
      
      const realm = instance.getRealm();
      const records = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('isDeleted = false')
        .sorted('createdAt', true)
        .slice(0, limit);
      
      // 안전하게 배열로 변환
      return Array.from(records).map(tasting => ({
        id: tasting.id,
        cafeName: tasting.cafeName,
        roastery: tasting.roastery,
        coffeeName: tasting.coffeeName,
        matchScore: tasting.matchScoreTotal,
        createdAt: tasting.createdAt,
      }));
    } catch (error) {
      console.error('Error getting recent tastings:', error);
      return []; // 에러 시 빈 배열 반환
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
  getStatistics(): {
    totalTastings: number;
    averageScore: number;
    firstTastingDays: number;
  } {
    const realm = this.getRealm();
    const records = realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isDeleted = false')
      .sorted('createdAt', false);

    const totalTastings = records.length;
    const averageScore = records.length > 0 ? Math.round(records.avg('matchScoreTotal') || 0) : 0;
    
    let firstTastingDays = 0;
    if (records.length > 0) {
      const firstTasting = records[records.length - 1];
      const daysDiff = Math.floor((Date.now() - firstTasting.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      firstTastingDays = daysDiff;
    }

    return {
      totalTastings,
      averageScore,
      firstTastingDays,
    };
  }

  getTopRoasters(limit: number): { name: string; count: number; avgScore: number }[] {
    const realm = this.getRealm();
    const records = realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isDeleted = false');

    const roasterStats = new Map<string, { count: number; totalScore: number }>();
    records.forEach(record => {
      const current = roasterStats.get(record.roastery) || { count: 0, totalScore: 0 };
      roasterStats.set(record.roastery, {
        count: current.count + 1,
        totalScore: current.totalScore + record.matchScoreTotal,
      });
    });

    return Array.from(roasterStats.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        avgScore: Math.round(stats.totalScore / stats.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getTopCoffees(limit: number): { name: string; roastery: string; count: number }[] {
    const realm = this.getRealm();
    const records = realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isDeleted = false');

    const coffeeStats = new Map<string, { roastery: string; count: number }>();
    records.forEach(record => {
      const key = `${record.roastery}::${record.coffeeName}`;
      const current = coffeeStats.get(key) || { roastery: record.roastery, count: 0 };
      coffeeStats.set(key, {
        roastery: record.roastery,
        count: current.count + 1,
      });
    });

    return Array.from(coffeeStats.entries())
      .map(([key, stats]) => {
        const [roastery, ...nameParts] = key.split('::');
        return {
          name: nameParts.join('::'),
          roastery: stats.roastery,
          count: stats.count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getTopCafes(limit: number): { name: string; count: number }[] {
    const realm = this.getRealm();
    const records = realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isDeleted = false AND cafeName != null');

    const cafeStats = new Map<string, number>();
    records.forEach(record => {
      if (record.cafeName) {
        cafeStats.set(record.cafeName, (cafeStats.get(record.cafeName) || 0) + 1);
      }
    });

    return Array.from(cafeStats.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getFlavorProfile(): { flavor: string; count: number; percentage: number }[] {
    const realm = this.getRealm();
    const records = realm.objects<ITastingRecord>('TastingRecord')
      .filtered('isDeleted = false');

    const flavorCounts = new Map<string, number>();
    let totalFlavorNotes = 0;

    records.forEach(record => {
      record.flavorNotes
        .filter(note => note.level === 1)
        .forEach(note => {
          flavorCounts.set(note.value, (flavorCounts.get(note.value) || 0) + 1);
          totalFlavorNotes++;
        });
    });

    return Array.from(flavorCounts.entries())
      .map(([flavor, count]) => ({
        flavor,
        count,
        percentage: Math.round((count / totalFlavorNotes) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Legacy method for compatibility
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

  // Cafe and Roaster Suggestions
  getCafeSuggestions(searchText: string): ICafeInfo[] {
    try {
      const realm = this.getRealm();
      
      if (!searchText || searchText.trim().length === 0) {
        return [];
      }
      
      const results = realm.objects<ICafeInfo>('CafeInfo')
        .filtered('name BEGINSWITH[c] $0', searchText.trim())
        .sorted('visitCount', true);
      
      const cafes: ICafeInfo[] = [];
      for (let i = 0; i < Math.min(10, results.length); i++) {
        cafes.push(results[i]);
      }
      
      return cafes;
    } catch (error) {
      console.error('Failed to get cafe suggestions:', error);
      return [];
    }
  }

  getRoasterSuggestions(searchText: string): IRoasterInfo[] {
    try {
      const realm = this.getRealm();
      
      if (!searchText || searchText.trim().length === 0) {
        return [];
      }
      
      const results = realm.objects<IRoasterInfo>('RoasterInfo')
        .filtered('name BEGINSWITH[c] $0', searchText.trim())
        .sorted('coffeeCount', true);
      
      const roasters: IRoasterInfo[] = [];
      for (let i = 0; i < Math.min(10, results.length); i++) {
        roasters.push(results[i]);
      }
      
      return roasters;
    } catch (error) {
      console.error('Failed to get roaster suggestions:', error);
      return [];
    }
  }

  // Get unique coffee name suggestions
  getCoffeeNameSuggestions(searchText: string): string[] {
    try {
      const realm = this.getRealm();
      
      if (!searchText || searchText.trim().length === 0) {
        return [];
      }
      
      const results = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('coffeeName BEGINSWITH[c] $0 AND isDeleted = false', searchText.trim());
      
      // Get unique coffee names
      const uniqueNames = new Set<string>();
      results.forEach(record => {
        if (record.coffeeName) {
          uniqueNames.add(record.coffeeName);
        }
      });
      
      return Array.from(uniqueNames).slice(0, 10);
    } catch (error) {
      console.error('Failed to get coffee name suggestions:', error);
      return [];
    }
  }

  // Get unique origin suggestions
  getOriginSuggestions(searchText: string): string[] {
    try {
      const realm = this.getRealm();
      
      if (!searchText || searchText.trim().length === 0) {
        return [];
      }
      
      const results = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('origin BEGINSWITH[c] $0 AND isDeleted = false', searchText.trim());
      
      // Get unique origins
      const uniqueOrigins = new Set<string>();
      results.forEach(record => {
        if (record.origin) {
          uniqueOrigins.add(record.origin);
        }
      });
      
      return Array.from(uniqueOrigins).slice(0, 10);
    } catch (error) {
      console.error('Failed to get origin suggestions:', error);
      return [];
    }
  }

  // Get unique variety suggestions
  getVarietySuggestions(searchText: string): string[] {
    try {
      const realm = this.getRealm();
      
      if (!searchText || searchText.trim().length === 0) {
        return [];
      }
      
      const results = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('variety BEGINSWITH[c] $0 AND isDeleted = false', searchText.trim());
      
      // Get unique varieties
      const uniqueVarieties = new Set<string>();
      results.forEach(record => {
        if (record.variety) {
          uniqueVarieties.add(record.variety);
        }
      });
      
      return Array.from(uniqueVarieties).slice(0, 10);
    } catch (error) {
      console.error('Failed to get variety suggestions:', error);
      return [];
    }
  }

  // Get unique process suggestions
  getProcessSuggestions(searchText: string): string[] {
    try {
      const realm = this.getRealm();
      
      if (!searchText || searchText.trim().length === 0) {
        return [];
      }
      
      const results = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('process BEGINSWITH[c] $0 AND isDeleted = false', searchText.trim());
      
      // Get unique processes
      const uniqueProcesses = new Set<string>();
      results.forEach(record => {
        if (record.process) {
          uniqueProcesses.add(record.process);
        }
      });
      
      return Array.from(uniqueProcesses).slice(0, 10);
    } catch (error) {
      console.error('Failed to get process suggestions:', error);
      return [];
    }
  }

  // Get coffee names for a specific roastery
  getRoasterCoffees(roasterName: string, searchText?: string): string[] {
    try {
      const realm = this.getRealm();
      
      if (!roasterName) {
        return [];
      }
      
      let query = 'roastery = $0 AND isDeleted = false';
      const params: any[] = [roasterName];
      
      if (searchText && searchText.trim().length > 0) {
        query += ' AND coffeeName BEGINSWITH[c] $1';
        params.push(searchText.trim());
      }
      
      const results = realm.objects<ITastingRecord>('TastingRecord')
        .filtered(query, ...params);
      
      // Get unique coffee names
      const uniqueCoffees = new Set<string>();
      results.forEach(record => {
        if (record.coffeeName) {
          uniqueCoffees.add(record.coffeeName);
        }
      });
      
      return Array.from(uniqueCoffees).slice(0, 10);
    } catch (error) {
      console.error('Failed to get roaster coffees:', error);
      return [];
    }
  }

  // Get coffee details for auto-fill
  getCoffeeDetails(roasterName: string, coffeeName: string): Partial<ITastingRecord> | null {
    try {
      const realm = this.getRealm();
      
      if (!roasterName || !coffeeName) {
        return null;
      }
      
      // Find the most recent tasting record for this coffee
      const results = realm.objects<ITastingRecord>('TastingRecord')
        .filtered('roastery = $0 AND coffeeName = $1 AND isDeleted = false', roasterName, coffeeName)
        .sorted('createdAt', true);
      
      if (results.length === 0) {
        return null;
      }
      
      const mostRecent = results[0];
      
      // Return only the fields that should be auto-filled
      return {
        origin: mostRecent.origin,
        variety: mostRecent.variety,
        altitude: mostRecent.altitude,
        process: mostRecent.process,
        roasterNotes: mostRecent.roasterNotes,
      };
    } catch (error) {
      console.error('Failed to get coffee details:', error);
      return null;
    }
  }

  // Get roasters for a specific cafe
  getCafeRoasters(cafeName: string, searchText?: string): string[] {
    try {
      const realm = this.getRealm();
      
      if (!cafeName) {
        return [];
      }
      
      const roasters: string[] = [];
      
      // 1. Check if there's a roastery with the same name as the cafe
      if (!searchText || cafeName.toLowerCase().startsWith(searchText.toLowerCase())) {
        const roasterWithSameName = realm.objects<IRoasterInfo>('RoasterInfo')
          .filtered('name = $0', cafeName);
        if (roasterWithSameName.length > 0) {
          roasters.push(cafeName);
        }
      }
      
      // 2. Find roasters that have been consumed at this cafe
      let query = 'cafeName = $0 AND isDeleted = false';
      const params: any[] = [cafeName];
      
      if (searchText && searchText.trim().length > 0) {
        query += ' AND roastery BEGINSWITH[c] $1';
        params.push(searchText.trim());
      }
      
      const results = realm.objects<ITastingRecord>('TastingRecord')
        .filtered(query, ...params);
      
      // Get unique roasters from this cafe
      const cafeRoasters = new Set<string>();
      results.forEach(record => {
        if (record.roastery && record.roastery !== cafeName) {
          cafeRoasters.add(record.roastery);
        }
      });
      
      // Count frequency for sorting
      const roasterCounts = new Map<string, number>();
      results.forEach(record => {
        if (record.roastery) {
          roasterCounts.set(record.roastery, (roasterCounts.get(record.roastery) || 0) + 1);
        }
      });
      
      // Sort by frequency
      const sortedRoasters = Array.from(cafeRoasters)
        .sort((a, b) => (roasterCounts.get(b) || 0) - (roasterCounts.get(a) || 0));
      
      // Combine results (cafe=roastery name first, then others)
      roasters.push(...sortedRoasters);
      
      return roasters.slice(0, 10);
    } catch (error) {
      console.error('Failed to get cafe roasters:', error);
      return [];
    }
  }

  incrementCafeVisit(cafeName: string): void {
    try {
      const realm = this.getRealm();
      
      realm.write(() => {
        const existingCafe = realm.objects<ICafeInfo>('CafeInfo')
          .filtered('name = $0', cafeName)[0];
        
        if (existingCafe) {
          existingCafe.visitCount += 1;
          existingCafe.lastVisitedAt = new Date();
          existingCafe.updatedAt = new Date();
        } else {
          realm.create<ICafeInfo>('CafeInfo', {
            id: uuid.v4() as string,
            name: cafeName,
            createdAt: new Date(),
            updatedAt: new Date(),
            visitCount: 1,
            lastVisitedAt: new Date(),
          });
        }
      });
    } catch (error) {
      console.error('Failed to increment cafe visit:', error);
    }
  }

  incrementRoasterVisit(roasterName: string): void {
    try {
      const realm = this.getRealm();
      
      realm.write(() => {
        const existingRoaster = realm.objects<IRoasterInfo>('RoasterInfo')
          .filtered('name = $0', roasterName)[0];
        
        if (existingRoaster) {
          existingRoaster.coffeeCount += 1;
          existingRoaster.updatedAt = new Date();
        } else {
          realm.create<IRoasterInfo>('RoasterInfo', {
            id: uuid.v4() as string,
            name: roasterName,
            createdAt: new Date(),
            updatedAt: new Date(),
            coffeeCount: 1,
          });
        }
      });
    } catch (error) {
      console.error('Failed to increment roaster visit:', error);
    }
  }

  // Delete a complete tasting record
  static async deleteTasting(tastingId: string): Promise<boolean> {
    try {
      const instance = RealmService.getInstance();
      
      // Realm이 초기화되지 않았으면 초기화 시도
      if (!instance.isInitialized || !instance.realm) {
        await instance.initialize();
      }
      
      const realm = instance.getRealm();
      let success = false;
      
      realm.write(() => {
        // Get the tasting record
        const tasting = realm.objectForPrimaryKey<ITastingRecord>('TastingRecord', tastingId);
        
        if (tasting) {
          // FlavorNote와 SensoryAttribute는 embedded objects이므로
          // 부모 객체인 TastingRecord를 삭제하면 자동으로 삭제됨
          realm.delete(tasting);
          success = true;
          console.log(`Successfully deleted tasting record: ${tastingId}`);
        } else {
          console.warn(`Tasting record with id ${tastingId} not found`);
        }
      });
      
      return success;
    } catch (error) {
      console.error('Delete tasting error:', error);
      return false;
    }
  }

  // Static initialize method for easy access
  static async initializeRealm(): Promise<void> {
    try {
      const instance = RealmService.getInstance();
      await instance.initialize();
      console.log('Realm initialized successfully via static method');
    } catch (error) {
      console.error('Failed to initialize Realm via static method:', error);
      throw error;
    }
  }

  // Clean up soft-deleted records older than 30 days
  cleanupDeletedRecords(): void {
    try {
      const realm = this.getRealm();
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30일 전
      
      realm.write(() => {
        const oldDeletedRecords = realm.objects<ITastingRecord>('TastingRecord')
          .filtered('isDeleted = true AND updatedAt < $0', cutoffDate);
        
        console.log(`Cleaning up ${oldDeletedRecords.length} old deleted records`);
        realm.delete(oldDeletedRecords);
      });
      
      console.log('Deleted records cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup deleted records:', error);
    }
  }

  // Static method for cleanup
  static async cleanupDeletedRecords(): Promise<void> {
    try {
      const instance = RealmService.getInstance();
      
      // Realm이 초기화되지 않았으면 초기화 시도
      if (!instance.realm) {
        await instance.initialize();
      }
      
      instance.cleanupDeletedRecords();
    } catch (error) {
      console.error('Failed to cleanup deleted records via static method:', error);
    }
  }

  // Get coffees by roaster - alias for getRoasterCoffees
  getCoffeesByRoaster(roasterName: string, searchText?: string): string[] {
    return this.getRoasterCoffees(roasterName, searchText);
  }

  // Search coffees - comprehensive search across all coffee fields
  searchCoffees(searchText: string, limit: number = 10): Array<{
    id: string;
    coffeeName: string;
    roastery: string;
    origin?: string;
    variety?: string;
    process?: string;
    useCount?: number;
    lastUsedAt?: Date;
  }> {
    try {
      const realm = this.getRealm();
      
      if (!searchText || searchText.trim().length === 0) {
        return [];
      }
      
      const searchTerm = searchText.trim();
      
      // Search in CoffeeLibrary first (includes use count)
      const coffeeLibraryResults = realm.objects<ICoffeeLibrary>('CoffeeLibrary')
        .filtered(
          'coffeeName CONTAINS[c] $0 OR roastery CONTAINS[c] $0 OR origin CONTAINS[c] $0 OR variety CONTAINS[c] $0',
          searchTerm
        )
        .sorted('useCount', true);
      
      const libraryResults = Array.from(coffeeLibraryResults).slice(0, limit).map(coffee => ({
        id: coffee.id,
        coffeeName: coffee.coffeeName,
        roastery: coffee.roastery,
        origin: coffee.origin,
        variety: coffee.variety,
        process: coffee.process,
        useCount: coffee.useCount,
        lastUsedAt: coffee.lastUsedAt,
      }));
      
      // If we have enough results from library, return them
      if (libraryResults.length >= limit) {
        return libraryResults;
      }
      
      // Otherwise, supplement with tasting records
      const tastingResults = realm.objects<ITastingRecord>('TastingRecord')
        .filtered(
          'coffeeName CONTAINS[c] $0 OR roastery CONTAINS[c] $0 OR origin CONTAINS[c] $0 OR variety CONTAINS[c] $0 AND isDeleted = false',
          searchTerm
        )
        .sorted('createdAt', true);
      
      // Get unique coffee combinations not already in library results
      const existingCombinations = new Set(
        libraryResults.map(coffee => `${coffee.roastery}::${coffee.coffeeName}`)
      );
      
      const uniqueTastingResults = new Map<string, ITastingRecord>();
      tastingResults.forEach(record => {
        const key = `${record.roastery}::${record.coffeeName}`;
        if (!existingCombinations.has(key) && !uniqueTastingResults.has(key)) {
          uniqueTastingResults.set(key, record);
        }
      });
      
      const additionalResults = Array.from(uniqueTastingResults.values())
        .slice(0, limit - libraryResults.length)
        .map(record => ({
          id: record.id,
          coffeeName: record.coffeeName,
          roastery: record.roastery,
          origin: record.origin,
          variety: record.variety,
          process: record.process,
          useCount: undefined,
          lastUsedAt: undefined,
        }));
      
      return [...libraryResults, ...additionalResults];
    } catch (error) {
      console.error('Failed to search coffees:', error);
      return [];
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