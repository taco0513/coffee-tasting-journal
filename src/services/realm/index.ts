// Export all schemas and types
export * from './schemas';

// Export RealmService
export { default as RealmService } from './RealmService';

// Export singleton instance for convenience
import RealmService from './RealmService';
export const realmService = RealmService.getInstance();