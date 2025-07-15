# Troubleshooting Guide

## Common Issues and Solutions

### Installation and Setup Issues

#### Node.js and npm Issues
**Problem**: `npm install` fails with permission errors
```bash
Error: EACCES: permission denied, access '/usr/local/lib/node_modules'
```
**Solution**:
```bash
# Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Or use nvm for node version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

#### React Native CLI Issues
**Problem**: `react-native` command not found
```bash
react-native: command not found
```
**Solution**:
```bash
# Install React Native CLI globally
npm install -g react-native-cli

# Or use npx
npx react-native run-ios
npx react-native run-android
```

#### Metro Bundler Issues
**Problem**: Metro bundler fails to start or crashes
```bash
Error: EMFILE: too many open files, watch
```
**Solution**:
```bash
# Increase file watcher limit (macOS)
echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Clear Metro cache
npx react-native start --reset-cache

# Kill existing Metro processes
lsof -ti:8081 | xargs kill -9
```

### iOS-Specific Issues

#### Xcode Build Errors
**Problem**: Build fails with certificate issues
```bash
Error: Code signing error: No signing certificate found
```
**Solution**:
```bash
# Check available certificates
security find-identity -v -p codesigning

# Clean build folder
cd ios && xcodebuild clean && cd ..

# Reset keychain
security delete-keychain ~/Library/Keychains/login.keychain
security create-keychain -p "" ~/Library/Keychains/login.keychain
```

#### CocoaPods Issues
**Problem**: Pod installation fails
```bash
[!] Unable to find a specification for `React-Core`
```
**Solution**:
```bash
# Update CocoaPods
sudo gem install cocoapods
pod repo update

# Clean and reinstall
cd ios
rm -rf Pods
rm Podfile.lock
pod install
cd ..
```

#### iOS Simulator Issues
**Problem**: Simulator won't launch or crashes
```bash
Error: Unable to boot simulator
```
**Solution**:
```bash
# Reset simulator
xcrun simctl erase all

# List available simulators
xcrun simctl list devices

# Kill simulator processes
sudo killall -9 com.apple.CoreSimulator.CoreSimulatorService
```

### Android-Specific Issues

#### Android SDK Issues
**Problem**: SDK not found or invalid
```bash
Error: SDK location not found
```
**Solution**:
```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Create local.properties file
echo "sdk.dir = $ANDROID_HOME" > android/local.properties
```

#### Gradle Build Issues
**Problem**: Gradle build fails
```bash
Error: Could not resolve all files for configuration ':app:debugRuntimeClasspath'
```
**Solution**:
```bash
# Clean gradle cache
cd android
./gradlew clean
./gradlew --refresh-dependencies

# Clear gradle cache globally
rm -rf ~/.gradle/caches/
```

#### Android Emulator Issues
**Problem**: Emulator won't start
```bash
Error: emulator: ERROR: x86 emulation currently requires hardware acceleration!
```
**Solution**:
```bash
# Enable hardware acceleration (Intel HAXM)
# Install from Android SDK Manager

# Check virtualization support
egrep -c '(vmx|svm)' /proc/cpuinfo

# Alternative: Use ARM emulator
# Create ARM64 AVD in Android Studio
```

### Database Issues

#### Realm Database Errors
**Problem**: Database initialization fails
```bash
Error: Realm initialization failed: Schema version mismatch
```
**Solution**:
```typescript
// Update schema version in RealmService
await Realm.open({
  schema: schemas,
  schemaVersion: 2, // Increment version
  migration: (oldRealm, newRealm) => {
    // Handle migration
  },
  deleteRealmIfMigrationNeeded: __DEV__, // For development
});
```

#### Data Corruption Issues
**Problem**: Corrupted database data
```bash
Error: Invalid database file
```
**Solution**:
```typescript
// Clear all data (development only)
const { clearAllTastings } = useTastingStore();
await clearAllTastings();

// Or delete database file
const realm = await Realm.open({...});
realm.close();
Realm.deleteFile({schema: schemas});
```

### State Management Issues

#### Zustand Store Issues
**Problem**: State not updating properly
```bash
Component not re-rendering after state change
```
**Solution**:
```typescript
// Ensure immutable updates
set((state) => ({
  ...state,
  selectedFlavors: {
    ...state.selectedFlavors,
    level1: [...newFlavors]
  }
}));

// Use shallow equal for selectors
const flavors = useTastingStore(
  (state) => state.selectedFlavors,
  shallow
);
```

#### Memory Leaks
**Problem**: Memory usage increases over time
```bash
Warning: Memory usage is high
```
**Solution**:
```typescript
// Cleanup subscriptions
useEffect(() => {
  const unsubscribe = store.subscribe(listener);
  return () => unsubscribe();
}, []);

// Use weak references for listeners
const listenerRef = useRef(listener);
```

### Performance Issues

#### Slow Navigation
**Problem**: Screen transitions are slow
```bash
Navigation takes >2 seconds
```
**Solution**:
```typescript
// Use lazy loading
const LazyScreen = React.lazy(() => import('./LazyScreen'));

// Optimize navigation
const Stack = createStackNavigator();
Stack.Navigator({
  initialRouteName: 'Home',
  screenOptions: {
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  }
});
```

#### High Memory Usage
**Problem**: App uses too much memory
```bash
Memory usage exceeds 200MB
```
**Solution**:
```typescript
// Optimize images
<Image 
  source={{uri: imageUrl}}
  style={{width: 100, height: 100}}
  resizeMode="contain"
/>

// Use FlatList for large lists
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
/>
```

### Network and API Issues

#### API Connection Failures
**Problem**: Cannot connect to API
```bash
Error: Network request failed
```
**Solution**:
```typescript
// Add retry logic
const fetchWithRetry = async (url, options, retries = 3) => {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};
```

#### Offline Mode Issues
**Problem**: App doesn't work offline
```bash
Error: No internet connection
```
**Solution**:
```typescript
// Check network status
import NetInfo from '@react-native-netinfo';

const [isConnected, setIsConnected] = useState(true);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsConnected(state.isConnected);
  });
  return () => unsubscribe();
}, []);
```

### Testing Issues

#### Jest Test Failures
**Problem**: Tests fail with module not found
```bash
Error: Cannot find module 'react-native'
```
**Solution**:
```json
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons)/)'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

#### E2E Test Issues
**Problem**: Detox tests fail
```bash
Error: App did not launch in time
```
**Solution**:
```bash
# Clean and rebuild
detox clean-framework-cache
detox build --configuration ios.sim.debug

# Increase timeout
detox test --loglevel trace --device-boot-args "-detox_wait_for_idle_timeout 10000"
```

### Debugging Tools

#### React Native Debugger
```bash
# Install React Native Debugger
brew install --cask react-native-debugger

# Enable debugging
npx react-native start
# Press 'j' to open debugger
```

#### Flipper Configuration
```javascript
// metro.config.js
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  return {
    ...config,
    resolver: {
      ...config.resolver,
      alias: {
        'react-native-flipper': 'react-native-flipper'
      }
    }
  };
})();
```

### Production Issues

#### App Store Rejection
**Problem**: App rejected by App Store
```bash
Your app contains non-public API usage
```
**Solution**:
```bash
# Check for private API usage
grep -r "UIApplication" ios/
grep -r "performSelector" ios/

# Use only public APIs
# Review third-party libraries
```

#### Performance in Production
**Problem**: App is slow in production
```bash
App startup time > 5 seconds
```
**Solution**:
```typescript
// Enable Hermes (Android)
// android/app/build.gradle
project.ext.react = [
  enableHermes: true
]

// Optimize bundle size
import('./screen').then(Screen => {
  // Use dynamic imports
});
```

### Monitoring and Logging

#### Crash Reporting
```typescript
// Setup crash reporting
import crashlytics from '@react-native-firebase/crashlytics';

export const logError = (error, context = {}) => {
  crashlytics().recordError(error);
  crashlytics().setAttributes(context);
};

// Use in error boundaries
componentDidCatch(error, errorInfo) {
  logError(error, errorInfo);
}
```

#### Performance Monitoring
```typescript
// Monitor app performance
import perf from '@react-native-firebase/perf';

const trace = perf().startTrace('tasting_flow');
// ... user completes tasting
trace.stop();
```

### Development Workflow Issues

#### Hot Reloading Problems
**Problem**: Hot reload doesn't work
```bash
Hot reloading is disabled
```
**Solution**:
```bash
# Enable hot reloading
npx react-native start --reset-cache

# In simulator: Cmd+D (iOS) or Cmd+M (Android)
# Enable "Hot Reloading"
```

#### TypeScript Errors
**Problem**: TypeScript compilation errors
```bash
Error: Property 'x' does not exist on type 'y'
```
**Solution**:
```typescript
// Fix type definitions
interface Props {
  x: string;
  y?: number;
}

// Use type assertions when necessary
const value = (data as any).unknownProperty;

// Update tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true
  }
}
```

## Preventive Measures

### Code Quality
```bash
# Setup pre-commit hooks
npm install --save-dev husky lint-staged

# .huskyrc
{
  "hooks": {
    "pre-commit": "lint-staged"
  }
}

# lint-staged.config.js
module.exports = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{js,jsx}': ['eslint --fix', 'prettier --write']
};
```

### Automated Testing
```bash
# Run tests in CI
npm test -- --coverage --watchAll=false

# E2E testing
detox test --configuration ios.sim.release
```

### Monitoring
```bash
# Setup monitoring
npm install --save @react-native-firebase/crashlytics
npm install --save @react-native-firebase/perf

# Monitor bundle size
npm install --save-dev react-native-bundle-visualizer
npx react-native-bundle-visualizer
```

## Emergency Procedures

### App Crash Recovery
1. **Identify crash pattern** from crash reports
2. **Implement quick fix** or disable problematic feature
3. **Deploy hotfix** via CodePush if possible
4. **Submit emergency update** to app stores
5. **Monitor recovery** metrics

### Data Recovery
1. **Backup current data** before any recovery attempt
2. **Use database migration** to fix corrupted data
3. **Implement data validation** to prevent future issues
4. **Test recovery process** thoroughly

### Rollback Procedures
1. **CodePush rollback** for JavaScript changes
2. **App store rollback** for native changes
3. **Database rollback** if schema changes are involved
4. **Monitor rollback impact** on users

This troubleshooting guide covers the most common issues encountered during development and deployment of the Coffee Tasting Journal app. Regular updates and maintenance help prevent many of these issues from occurring.