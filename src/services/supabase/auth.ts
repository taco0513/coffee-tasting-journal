import { supabase } from './client';
import { Session, User } from '@supabase/supabase-js';
import { useUserStore } from '../../stores/userStore';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
  };

  private constructor() {
    this.initializeAuthListener();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // 인증 상태 리스너 초기화
  private initializeAuthListener(): void {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      this.authState.session = session;
      this.authState.user = session?.user || null;
      this.authState.isAuthenticated = !!session;
      this.authState.error = null;

      // 세션 상태에 따른 처리
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user?.id);
        this.onSignedIn(session);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        this.onSignedOut();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed for user:', session?.user?.id);
      }

      // userStore가 있다면 업데이트
      this.updateUserStore();
    });
  }

  // 앱 시작 시 자동 익명 로그인
  async initializeAuth(): Promise<void> {
    this.authState.isLoading = true;
    this.authState.error = null;
    this.updateUserStore();

    try {
      console.log('Initializing authentication...');

      // 현재 세션 확인
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session check error:', sessionError);
        throw sessionError;
      }

      if (session) {
        console.log('Existing session found:', session.user.id);
        this.authState.session = session;
        this.authState.user = session.user;
        this.authState.isAuthenticated = true;
      } else {
        console.log('No existing session, signing in anonymously...');
        await this.signInAnonymously();
      }

    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.authState.error = error instanceof Error ? error.message : 'Authentication failed';
      
      // 익명 로그인 재시도
      try {
        console.log('Retrying anonymous sign in...');
        await this.signInAnonymously();
      } catch (retryError) {
        console.error('Anonymous sign in retry failed:', retryError);
        this.authState.error = retryError instanceof Error ? retryError.message : 'Authentication failed';
      }
    } finally {
      this.authState.isLoading = false;
      this.updateUserStore();
    }
  }

  // 익명 로그인
  async signInAnonymously(): Promise<void> {
    try {
      console.log('Attempting anonymous sign in...');
      
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('Anonymous sign in error:', error);
        throw error;
      }

      if (data.session) {
        console.log('Anonymous sign in successful:', data.session.user.id);
        this.authState.session = data.session;
        this.authState.user = data.session.user;
        this.authState.isAuthenticated = true;
        this.authState.error = null;
      } else {
        throw new Error('No session returned from anonymous sign in');
      }

    } catch (error) {
      console.error('Anonymous sign in failed:', error);
      this.authState.error = error instanceof Error ? error.message : 'Anonymous sign in failed';
      throw error;
    }
  }

  // 현재 세션 확인
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Get session error:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to get current session:', error);
      return null;
    }
  }

  // 현재 사용자 확인
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Get user error:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // 로그아웃
  async signOut(): Promise<void> {
    try {
      console.log('Signing out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }

      console.log('Sign out successful');
      
      // 상태 초기화
      this.authState.user = null;
      this.authState.session = null;
      this.authState.isAuthenticated = false;
      this.authState.error = null;

    } catch (error) {
      console.error('Sign out failed:', error);
      this.authState.error = error instanceof Error ? error.message : 'Sign out failed';
      throw error;
    }
  }

  // 세션 새로고침
  async refreshSession(): Promise<void> {
    try {
      console.log('Refreshing session...');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        throw error;
      }

      if (data.session) {
        console.log('Session refreshed successfully');
        this.authState.session = data.session;
        this.authState.user = data.session.user;
        this.authState.isAuthenticated = true;
        this.authState.error = null;
      }

    } catch (error) {
      console.error('Session refresh failed:', error);
      this.authState.error = error instanceof Error ? error.message : 'Session refresh failed';
      throw error;
    }
  }

  // 인증 상태 확인
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !!this.authState.session;
  }

  // 사용자 ID 가져오기
  getUserId(): string | null {
    return this.authState.user?.id || null;
  }

  // 현재 인증 상태 가져오기
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  // 사용자 메타데이터 업데이트
  async updateUserMetadata(metadata: Record<string, any>): Promise<void> {
    try {
      console.log('Updating user metadata:', metadata);
      
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });
      
      if (error) {
        console.error('Update user metadata error:', error);
        throw error;
      }

      if (data.user) {
        console.log('User metadata updated successfully');
        this.authState.user = data.user;
      }

    } catch (error) {
      console.error('Failed to update user metadata:', error);
      this.authState.error = error instanceof Error ? error.message : 'Metadata update failed';
      throw error;
    }
  }

  // 로그인 성공 시 처리
  private onSignedIn(session: Session | null): void {
    if (session) {
      console.log('User signed in, starting sync...');
      
      // 동기화 서비스 시작 (나중에 구현)
      // syncService.syncAll();
    }
  }

  // 로그아웃 시 처리
  private onSignedOut(): void {
    console.log('User signed out, clearing local data...');
    
    // 로컬 데이터 정리 (필요한 경우)
    // RealmService.getInstance().clearUserData();
  }

  // userStore 업데이트
  private updateUserStore(): void {
    try {
      // Zustand store 상태 업데이트
      useUserStore.getState().setAuthState({
        user: this.authState.user,
        session: this.authState.session,
        isLoading: this.authState.isLoading,
        isAuthenticated: this.authState.isAuthenticated,
        error: this.authState.error,
      });

      console.log('Auth state updated:', {
        isAuthenticated: this.authState.isAuthenticated,
        userId: this.authState.user?.id,
        isLoading: this.authState.isLoading,
        error: this.authState.error
      });
    } catch (error) {
      console.error('Failed to update user store:', error);
    }
  }

  // 인증 오류 처리
  private handleAuthError(error: any): void {
    console.error('Auth error:', error);
    
    let errorMessage = 'Authentication error';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    this.authState.error = errorMessage;
    this.updateUserStore();
  }

  // 토큰 만료 확인
  isTokenExpired(): boolean {
    if (!this.authState.session) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = this.authState.session.expires_at;
    
    if (!expiresAt) {
      return false;
    }

    // 만료 5분 전을 만료로 간주
    return now >= (expiresAt - 300);
  }

  // 토큰 자동 갱신
  async ensureValidToken(): Promise<void> {
    if (this.isTokenExpired()) {
      console.log('Token expired, refreshing...');
      await this.refreshSession();
    }
  }

  // 정리
  cleanup(): void {
    console.log('Auth service cleanup');
    // 필요한 경우 리소스 정리
  }
}

// 전역 인증 서비스 인스턴스
export const authService = AuthService.getInstance();

// 편의 함수들
export const authUtils = {
  // 인증 초기화
  initialize: async () => {
    await authService.initializeAuth();
  },

  // 현재 사용자 확인
  getCurrentUser: async () => {
    return await authService.getCurrentUser();
  },

  // 인증 상태 확인
  isAuthenticated: () => {
    return authService.isAuthenticated();
  },

  // 사용자 ID 가져오기
  getUserId: () => {
    return authService.getUserId();
  },

  // 로그아웃
  signOut: async () => {
    await authService.signOut();
  },

  // 인증 상태 가져오기
  getAuthState: () => {
    return authService.getAuthState();
  },

  // 토큰 유효성 확인
  ensureValidToken: async () => {
    await authService.ensureValidToken();
  },
};

export default AuthService;