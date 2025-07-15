# Deployment Guide

## Overview

This document provides comprehensive deployment procedures for the Coffee Tasting Journal mobile application, covering development, staging, and production environments for both iOS and Android platforms.

## Prerequisites

### Development Environment
- **Node.js**: 18.x LTS or higher
- **npm**: 9.x or higher (or Yarn 3.x)
- **React Native CLI**: Latest version
- **Xcode**: 14.x or higher (for iOS)
- **Android Studio**: Latest version (for Android)
- **Java**: OpenJDK 11 or higher

### Code Signing Requirements
- **iOS**: Apple Developer Account with certificates
- **Android**: Google Play Console access and signing keys

## Environment Configuration

### Environment Variables
```bash
# .env.development
NODE_ENV=development
API_URL=http://localhost:3000
ENABLE_FLIPPER=true
ENABLE_LOGS=true

# .env.staging
NODE_ENV=staging
API_URL=https://staging.api.coffeetasting.com
ENABLE_FLIPPER=false
ENABLE_LOGS=true

# .env.production
NODE_ENV=production
API_URL=https://api.coffeetasting.com
ENABLE_FLIPPER=false
ENABLE_LOGS=false
```

### Build Configuration
```javascript
// metro.config.js
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  
  return {
    ...config,
    resolver: {
      ...config.resolver,
      assetExts: [...config.resolver.assetExts, 'json'],
    },
    transformer: {
      ...config.transformer,
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
  };
})();
```

## iOS Deployment

### Development Build
```bash
# Install dependencies
npm install

# Install CocoaPods dependencies
cd ios && pod install && cd ..

# Run on simulator
npx react-native run-ios

# Run on device
npx react-native run-ios --device "iPhone Name"
```

### Production Build
```bash
# Clean build
cd ios && xcodebuild clean && cd ..

# Build archive
cd ios
xcodebuild -workspace CoffeeTastingJournal.xcworkspace \
  -scheme CoffeeTastingJournal \
  -configuration Release \
  -destination generic/platform=iOS \
  -archivePath build/CoffeeTastingJournal.xcarchive \
  archive

# Export for App Store
xcodebuild -exportArchive \
  -archivePath build/CoffeeTastingJournal.xcarchive \
  -exportPath build/Export \
  -exportOptionsPlist ExportOptions.plist
```

### Code Signing Configuration
```xml
<!-- ExportOptions.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
```

### App Store Submission
```bash
# Upload to App Store Connect
xcrun altool --upload-app \
  --type ios \
  --file build/Export/CoffeeTastingJournal.ipa \
  --username your-apple-id \
  --password app-specific-password \
  --verbose
```

## Android Deployment

### Development Build
```bash
# Install dependencies
npm install

# Run on emulator
npx react-native run-android

# Run on device
npx react-native run-android --device
```

### Production Build
```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Generate release APK
cd android
./gradlew assembleRelease

# Generate release AAB (App Bundle)
./gradlew bundleRelease
```

### Signing Configuration
```gradle
// android/app/build.gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

### Keystore Configuration
```properties
# android/gradle.properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

### Google Play Upload
```bash
# Upload to Google Play Console
# Use the Google Play Console web interface or Google Play Developer API
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm run type-check

  build-ios:
    needs: test
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: cd ios && pod install
      - run: npx react-native build-ios --mode Release

  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '11'
      - run: npm ci
      - run: cd android && ./gradlew assembleRelease
```

### Build Scripts
```json
// package.json
{
  "scripts": {
    "android:build": "cd android && ./gradlew assembleRelease",
    "android:clean": "cd android && ./gradlew clean",
    "ios:build": "cd ios && xcodebuild -workspace CoffeeTastingJournal.xcworkspace -scheme CoffeeTastingJournal -configuration Release -sdk iphoneos -archivePath build/CoffeeTastingJournal.xcarchive archive",
    "ios:clean": "cd ios && xcodebuild clean",
    "build:all": "npm run android:clean && npm run ios:clean && npm run android:build && npm run ios:build",
    "test:e2e": "detox test",
    "test:unit": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

## Environment-Specific Deployments

### Development Environment
```bash
# Development build with debugging enabled
npm run android:dev
npm run ios:dev

# Features enabled:
# - Flipper debugging
# - Console logging
# - Development server
# - Hot reloading
```

### Staging Environment
```bash
# Staging build for testing
npm run android:staging
npm run ios:staging

# Features:
# - Production-like build
# - Staging API endpoints
# - Limited logging
# - TestFlight/Internal testing
```

### Production Environment
```bash
# Production build for release
npm run android:release
npm run ios:release

# Features:
# - Optimized builds
# - Production API endpoints
# - Minimal logging
# - App Store/Play Store distribution
```

## Code Push Deployment

### Setup
```bash
# Install CodePush CLI
npm install -g code-push-cli

# Login to CodePush
code-push login

# Register app
code-push app add CoffeeTastingJournal-iOS ios react-native
code-push app add CoffeeTastingJournal-Android android react-native
```

### Deployment
```bash
# Deploy to staging
code-push release-react CoffeeTastingJournal-iOS ios --deploymentName Staging
code-push release-react CoffeeTastingJournal-Android android --deploymentName Staging

# Deploy to production
code-push release-react CoffeeTastingJournal-iOS ios --deploymentName Production
code-push release-react CoffeeTastingJournal-Android android --deploymentName Production
```

## Monitoring and Analytics

### Crash Reporting
```javascript
// src/utils/crashReporting.js
import crashlytics from '@react-native-firebase/crashlytics';

export const initializeCrashReporting = () => {
  crashlytics().setCrashlyticsCollectionEnabled(true);
};

export const logError = (error, context = {}) => {
  crashlytics().recordError(error);
  crashlytics().setAttributes(context);
};
```

### Performance Monitoring
```javascript
// src/utils/performance.js
import perf from '@react-native-firebase/perf';

export const startTrace = (traceName) => {
  return perf().startTrace(traceName);
};

export const stopTrace = (trace) => {
  return trace.stop();
};
```

## Security Considerations

### Certificate Management
```bash
# iOS certificate management
security find-identity -v -p codesigning
security import certificate.p12 -k ~/Library/Keychains/login.keychain

# Android keystore backup
cp android/app/my-upload-key.keystore backup/
```

### Secrets Management
```bash
# Environment-specific secrets
# Never commit secrets to repository
# Use CI/CD secret management
echo "KEYSTORE_PASSWORD" > android/keystore.properties
echo "API_KEY" > .env.production
```

## Rollback Procedures

### CodePush Rollback
```bash
# Rollback to previous version
code-push rollback CoffeeTastingJournal-iOS Production
code-push rollback CoffeeTastingJournal-Android Production

# Rollback to specific version
code-push rollback CoffeeTastingJournal-iOS Production --targetRelease v1.2.3
```

### App Store Rollback
```bash
# iOS App Store rollback
# Use App Store Connect to revert to previous version
# Cannot be automated - requires manual intervention

# Android Play Store rollback
# Use Play Console to halt rollout or rollback
# Can be partially automated via Play Developer API
```

## Health Checks

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Code review completed
- [ ] Version numbers updated
- [ ] Changelog updated
- [ ] Certificates valid
- [ ] Environment variables set
- [ ] Database migrations ready
- [ ] Rollback plan prepared

### Post-deployment Verification
```bash
# Verify deployment
curl -f https://api.coffeetasting.com/health
curl -f https://staging.api.coffeetasting.com/health

# Check app functionality
npm run test:e2e:production
npm run test:smoke:production
```

## Troubleshooting

### Common Issues
```bash
# iOS build issues
cd ios && pod install --repo-update
cd ios && xcodebuild -workspace CoffeeTastingJournal.xcworkspace -scheme CoffeeTastingJournal clean

# Android build issues
cd android && ./gradlew clean
cd android && ./gradlew --refresh-dependencies

# Metro bundler issues
npx react-native start --reset-cache
```

### Debug Commands
```bash
# Debug iOS simulator
xcrun simctl list devices
xcrun simctl install booted path/to/app.app

# Debug Android emulator
adb devices
adb install -r path/to/app.apk
adb logcat | grep CoffeeTastingJournal
```

## Maintenance

### Regular Tasks
- **Weekly**: Check build pipeline health
- **Monthly**: Update dependencies and certificates
- **Quarterly**: Review and update deployment procedures
- **Annually**: Renew certificates and review security

### Update Procedures
```bash
# Update React Native
npx react-native upgrade

# Update dependencies
npm update
npm audit fix

# Update native dependencies
cd ios && pod update
cd android && ./gradlew dependencies
```

This deployment guide provides comprehensive procedures for deploying the Coffee Tasting Journal application across all environments and platforms. Regular updates and maintenance ensure smooth deployment processes and reliable application delivery.