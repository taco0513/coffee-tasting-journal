import { supabase } from './client';
import RealmService from '../realm/RealmService';
import { ITastingRecord, IFlavorNote, ISensoryAttribute } from '../realm/schemas';
import { useTastingStore } from '../../stores/tastingStore';
import NetInfo from '@react-native-community/netinfo';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingUploads: number;
  error: string | null;
}

export interface SupabaseTastingRecord {
  id: string;
  user_id: string;
  realm_id: string;
  created_at: string;
  updated_at: string;
  cafe_name?: string;
  roastery: string;
  coffee_name: string;
  origin?: string;
  variety?: string;
  altitude?: string;
  process?: string;
  temperature: 'hot' | 'ice';
  roaster_notes?: string;
  match_score_total: number;
  match_score_flavor: number;
  match_score_sensory: number;
  is_deleted: boolean;
  deleted_at?: string;
}

export interface SupabaseFlavorNote {
  id: string;
  tasting_id: string;
  level: number;
  value: string;
  korean_value?: string;
  created_at: string;
}

export interface SupabaseSensoryAttribute {
  id: string;
  tasting_id: string;
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  mouthfeel: string;
  created_at: string;
}

class SyncService {
  private static instance: SyncService;
  private syncStatus: SyncStatus = {
    isOnline: false,
    isSyncing: false,
    lastSyncTime: null,
    pendingUploads: 0,
    error: null,
  };

  private constructor() {
    this.initializeNetworkListener();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      this.syncStatus.isOnline = state.isConnected || false;
      
      // 온라인 상태가 되면 자동 동기화 시도
      if (this.syncStatus.isOnline && !this.syncStatus.isSyncing) {
        this.syncAll();
      }
    });
  }

  // 네트워크 상태 확인
  async checkNetworkStatus(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      this.syncStatus.isOnline = state.isConnected || false;
      return this.syncStatus.isOnline;
    } catch (error) {
      console.error('Network check failed:', error);
      this.syncStatus.isOnline = false;
      return false;
    }
  }

  // 현재 동기화 상태 반환
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // 전체 동기화 실행
  async syncAll(): Promise<void> {
    if (this.syncStatus.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.error = null;
    this.updateTastingStore();

    try {
      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        throw new Error('No internet connection');
      }

      console.log('Starting sync process...');

      // 1. 로컬 → Supabase 업로드
      await this.uploadLocalChanges();

      // 2. Supabase → 로컬 다운로드
      await this.downloadRemoteChanges();

      // 3. 동기화 완료 처리
      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.error = null;
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown sync error';
    } finally {
      this.syncStatus.isSyncing = false;
      this.updateTastingStore();
    }
  }

  // 로컬 변경사항을 Supabase로 업로드
  async uploadLocalChanges(): Promise<void> {
    try {
      const realmService = RealmService.getInstance();
      const unsyncedRecords = realmService.getUnsyncedRecords();
      
      this.syncStatus.pendingUploads = unsyncedRecords.length;
      this.updateTastingStore();

      console.log(`Uploading ${unsyncedRecords.length} unsynced records`);

      for (const record of unsyncedRecords) {
        try {
          await this.uploadSingleRecord(record);
        } catch (error) {
          console.error(`Failed to upload record ${record.id}:`, error);
          // 개별 업로드 실패는 전체 동기화를 중단하지 않음
        }
      }

      this.syncStatus.pendingUploads = 0;
      this.updateTastingStore();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  // 개별 레코드 업로드
  private async uploadSingleRecord(record: ITastingRecord): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // 1. 메인 테이스팅 레코드 업로드
      const tastingData: Partial<SupabaseTastingRecord> = {
        user_id: user.id,
        realm_id: record.id,
        cafe_name: record.cafeName || undefined,
        roastery: record.roastery,
        coffee_name: record.coffeeName,
        origin: record.origin || undefined,
        variety: record.variety || undefined,
        altitude: record.altitude || undefined,
        process: record.process || undefined,
        temperature: record.temperature,
        roaster_notes: record.roasterNotes || undefined,
        match_score_total: record.matchScoreTotal,
        match_score_flavor: record.matchScoreFlavor,
        match_score_sensory: record.matchScoreSensory,
        is_deleted: record.isDeleted,
        created_at: record.createdAt.toISOString(),
        updated_at: record.updatedAt.toISOString(),
      };

      const { data: tastingRecord, error: tastingError } = await supabase
        .from('tasting_records')
        .upsert(tastingData, { onConflict: 'realm_id' })
        .select()
        .single();

      if (tastingError) {
        throw tastingError;
      }

      // 2. 맛 노트 업로드
      if (record.flavorNotes && record.flavorNotes.length > 0) {
        // 기존 맛 노트 삭제
        await supabase
          .from('flavor_notes')
          .delete()
          .eq('tasting_id', tastingRecord.id);

        // 새로운 맛 노트 삽입
        const flavorNotes = record.flavorNotes.map(note => ({
          tasting_id: tastingRecord.id,
          level: note.level,
          value: note.value,
          korean_value: note.koreanValue || undefined,
        }));

        const { error: flavorError } = await supabase
          .from('flavor_notes')
          .insert(flavorNotes);

        if (flavorError) {
          throw flavorError;
        }
      }

      // 3. 감각 속성 업로드
      if (record.sensoryAttribute) {
        const sensoryData = {
          tasting_id: tastingRecord.id,
          body: record.sensoryAttribute.body,
          acidity: record.sensoryAttribute.acidity,
          sweetness: record.sensoryAttribute.sweetness,
          finish: record.sensoryAttribute.finish,
          mouthfeel: record.sensoryAttribute.mouthfeel,
        };

        const { error: sensoryError } = await supabase
          .from('sensory_attributes')
          .upsert(sensoryData, { onConflict: 'tasting_id' });

        if (sensoryError) {
          throw sensoryError;
        }
      }

      // 4. 로컬 레코드를 동기화됨으로 표시
      const realmService = RealmService.getInstance();
      realmService.markAsSynced([record.id]);

      console.log(`Successfully uploaded record: ${record.id}`);
    } catch (error) {
      console.error(`Failed to upload record ${record.id}:`, error);
      throw error;
    }
  }

  // Supabase에서 변경사항 다운로드
  async downloadRemoteChanges(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const realmService = RealmService.getInstance();
      const lastSyncTime = this.syncStatus.lastSyncTime;

      // 마지막 동기화 이후 변경된 레코드 가져오기
      let query = supabase
        .from('tasting_records')
        .select(`
          *,
          flavor_notes (*),
          sensory_attributes (*)
        `)
        .eq('user_id', user.id)
        .eq('is_deleted', false);

      if (lastSyncTime) {
        query = query.gte('updated_at', lastSyncTime.toISOString());
      }

      const { data: remoteRecords, error } = await query;

      if (error) {
        throw error;
      }

      console.log(`Downloaded ${remoteRecords?.length || 0} remote records`);

      // 각 레코드를 로컬에 저장
      if (remoteRecords && remoteRecords.length > 0) {
        for (const remoteRecord of remoteRecords) {
          await this.downloadSingleRecord(remoteRecord);
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  // 개별 레코드 다운로드 및 충돌 해결
  private async downloadSingleRecord(remoteRecord: any): Promise<void> {
    try {
      const realmService = RealmService.getInstance();
      const localRecord = realmService.getTastingRecordById(remoteRecord.realm_id);

      if (!localRecord) {
        // 새로운 레코드 생성
        await this.createLocalRecord(remoteRecord);
      } else {
        // 충돌 해결
        await this.resolveConflict(localRecord, remoteRecord);
      }
    } catch (error) {
      console.error(`Failed to download record ${remoteRecord.realm_id}:`, error);
      throw error;
    }
  }

  // 로컬에 새 레코드 생성
  private async createLocalRecord(remoteRecord: any): Promise<void> {
    try {
      const realmService = RealmService.getInstance();

      // 맛 노트 변환
      const flavorNotes: IFlavorNote[] = remoteRecord.flavor_notes?.map((note: any) => ({
        level: note.level,
        value: note.value,
        koreanValue: note.korean_value || undefined,
      })) || [];

      // 감각 속성 변환
      let sensoryAttribute: ISensoryAttribute | undefined;
      if (remoteRecord.sensory_attributes && remoteRecord.sensory_attributes.length > 0) {
        const sensory = remoteRecord.sensory_attributes[0];
        sensoryAttribute = {
          body: sensory.body,
          acidity: sensory.acidity,
          sweetness: sensory.sweetness,
          finish: sensory.finish,
          mouthfeel: sensory.mouthfeel,
        };
      }

      // 로컬 레코드 생성
      const localData: Omit<ITastingRecord, 'id'> = {
        createdAt: new Date(remoteRecord.created_at),
        updatedAt: new Date(remoteRecord.updated_at),
        cafeName: remoteRecord.cafe_name || '',
        roastery: remoteRecord.roastery,
        coffeeName: remoteRecord.coffee_name,
        origin: remoteRecord.origin || '',
        variety: remoteRecord.variety || '',
        altitude: remoteRecord.altitude || '',
        process: remoteRecord.process || '',
        temperature: remoteRecord.temperature,
        roasterNotes: remoteRecord.roaster_notes || '',
        matchScoreTotal: remoteRecord.match_score_total,
        matchScoreFlavor: remoteRecord.match_score_flavor,
        matchScoreSensory: remoteRecord.match_score_sensory,
        flavorNotes,
        sensoryAttribute,
        isSynced: true,
        isDeleted: false,
        syncedAt: new Date(),
      };

      const realm = realmService.getRealm();
      realm.write(() => {
        realm.create<ITastingRecord>('TastingRecord', {
          id: remoteRecord.realm_id,
          ...localData,
        });
      });

      console.log(`Created local record: ${remoteRecord.realm_id}`);
    } catch (error) {
      console.error(`Failed to create local record:`, error);
      throw error;
    }
  }

  // 충돌 해결 (최신 업데이트 시간 기준)
  private async resolveConflict(localRecord: ITastingRecord, remoteRecord: any): Promise<void> {
    try {
      const localUpdatedAt = localRecord.updatedAt;
      const remoteUpdatedAt = new Date(remoteRecord.updated_at);

      console.log(`Resolving conflict for record ${localRecord.id}`);
      console.log(`Local updated: ${localUpdatedAt.toISOString()}`);
      console.log(`Remote updated: ${remoteUpdatedAt.toISOString()}`);

      // 원격 레코드가 더 최신인 경우
      if (remoteUpdatedAt > localUpdatedAt) {
        console.log('Remote record is newer, updating local');
        await this.updateLocalRecord(localRecord, remoteRecord);
      } else if (localUpdatedAt > remoteUpdatedAt) {
        console.log('Local record is newer, uploading to remote');
        await this.uploadSingleRecord(localRecord);
      } else {
        console.log('Records have same timestamp, preferring remote');
        await this.updateLocalRecord(localRecord, remoteRecord);
      }
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      throw error;
    }
  }

  // 로컬 레코드 업데이트
  private async updateLocalRecord(localRecord: ITastingRecord, remoteRecord: any): Promise<void> {
    try {
      const realmService = RealmService.getInstance();
      const realm = realmService.getRealm();

      realm.write(() => {
        // 기본 필드 업데이트
        localRecord.updatedAt = new Date(remoteRecord.updated_at);
        localRecord.cafeName = remoteRecord.cafe_name || '';
        localRecord.roastery = remoteRecord.roastery;
        localRecord.coffeeName = remoteRecord.coffee_name;
        localRecord.origin = remoteRecord.origin || '';
        localRecord.variety = remoteRecord.variety || '';
        localRecord.altitude = remoteRecord.altitude || '';
        localRecord.process = remoteRecord.process || '';
        localRecord.temperature = remoteRecord.temperature;
        localRecord.roasterNotes = remoteRecord.roaster_notes || '';
        localRecord.matchScoreTotal = remoteRecord.match_score_total;
        localRecord.matchScoreFlavor = remoteRecord.match_score_flavor;
        localRecord.matchScoreSensory = remoteRecord.match_score_sensory;
        localRecord.isSynced = true;
        localRecord.syncedAt = new Date();

        // 맛 노트 업데이트
        if (remoteRecord.flavor_notes) {
          const newFlavorNotes: IFlavorNote[] = remoteRecord.flavor_notes.map((note: any) => ({
            level: note.level,
            value: note.value,
            koreanValue: note.korean_value || undefined,
          }));
          localRecord.flavorNotes = newFlavorNotes;
        }

        // 감각 속성 업데이트
        if (remoteRecord.sensory_attributes && remoteRecord.sensory_attributes.length > 0) {
          const sensory = remoteRecord.sensory_attributes[0];
          localRecord.sensoryAttribute = {
            body: sensory.body,
            acidity: sensory.acidity,
            sweetness: sensory.sweetness,
            finish: sensory.finish,
            mouthfeel: sensory.mouthfeel,
          };
        }
      });

      console.log(`Updated local record: ${localRecord.id}`);
    } catch (error) {
      console.error('Failed to update local record:', error);
      throw error;
    }
  }

  // 수동 동기화 트리거
  async manualSync(): Promise<void> {
    console.log('Manual sync triggered');
    await this.syncAll();
  }

  // 특정 레코드 강제 업로드
  async forceUploadRecord(recordId: string): Promise<void> {
    try {
      const realmService = RealmService.getInstance();
      const record = realmService.getTastingRecordById(recordId);
      
      if (!record) {
        throw new Error(`Record not found: ${recordId}`);
      }

      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        throw new Error('No internet connection');
      }

      await this.uploadSingleRecord(record);
      console.log(`Force uploaded record: ${recordId}`);
    } catch (error) {
      console.error(`Force upload failed for record ${recordId}:`, error);
      throw error;
    }
  }

  // 카페 및 로스터 정보 동기화
  async syncCafeAndRoasterInfo(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const realmService = RealmService.getInstance();
      const realm = realmService.getRealm();

      // 카페 정보 동기화
      const cafes = realm.objects('CafeInfo').filtered('visitCount > 0');
      for (const cafe of cafes) {
        await supabase.rpc('increment_cafe_visit', {
          user_uuid: user.id,
          cafe_name_param: (cafe as any).name,
        });
      }

      // 로스터 정보 동기화
      const roasters = realm.objects('RoasterInfo').filtered('coffeeCount > 0');
      for (const roaster of roasters) {
        await supabase.rpc('increment_roaster_visit', {
          user_uuid: user.id,
          roaster_name_param: (roaster as any).name,
        });
      }

      console.log('Cafe and roaster info synced');
    } catch (error) {
      console.error('Failed to sync cafe and roaster info:', error);
    }
  }

  // TastingStore 업데이트
  private updateTastingStore(): void {
    // Zustand store는 직접 업데이트할 수 없으므로, 
    // 스토어에서 이 상태를 구독하도록 해야 함
    // 여기서는 단순히 콘솔 로그만 출력
    console.log('Sync status updated:', this.syncStatus);
  }

  // 정리
  cleanup(): void {
    // 필요한 경우 리소스 정리
    console.log('Sync service cleanup');
  }
}

// 전역 동기화 상태 관리를 위한 스토어 확장
export const syncStore = {
  status: {
    isOnline: false,
    isSyncing: false,
    lastSyncTime: null,
    pendingUploads: 0,
    error: null,
  } as SyncStatus,
  
  updateStatus: (newStatus: Partial<SyncStatus>) => {
    syncStore.status = { ...syncStore.status, ...newStatus };
  },
  
  getStatus: () => ({ ...syncStore.status }),
};

// 편의 함수들
export const syncService = SyncService.getInstance();

export const syncUtils = {
  // 자동 동기화 시작
  startAutoSync: () => {
    setInterval(async () => {
      const status = syncService.getSyncStatus();
      if (status.isOnline && !status.isSyncing) {
        await syncService.syncAll();
      }
    }, 5 * 60 * 1000); // 5분마다
  },

  // 네트워크 상태 확인
  checkConnection: async () => {
    return await syncService.checkNetworkStatus();
  },

  // 즉시 동기화
  syncNow: async () => {
    await syncService.manualSync();
  },

  // 동기화 상태 가져오기
  getSyncStatus: () => {
    return syncService.getSyncStatus();
  },
};

export default SyncService;