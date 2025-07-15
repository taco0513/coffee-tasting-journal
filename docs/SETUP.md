# Coffee Tasting Journal - Setup Guide

## 📋 Prerequisites

### System Requirements

#### For macOS (iOS Development)
- macOS 10.15 (Catalina) or later
- Xcode 13.0 or later
- CocoaPods 1.11.0 or later

#### For Windows/Linux/macOS (Android Development)
- Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- Android Studio Electric Eel or later
- Java Development Kit (JDK) 11

### Required Software

1. **Node.js**: Version 18.0.0 or later
2. **npm**: Version 8.0.0 or later (comes with Node.js)
3. **Git**: Version 2.0.0 or later
4. **React Native CLI**: Will be installed during setup

## 🚀 Quick Start

### 1. Check Your Environment

```bash
# Check Node.js version
node --version
# Should show v18.0.0 or higher

# Check npm version
npm --version
# Should show 8.0.0 or higher

# Check Git version
git --version
# Should show 2.0.0 or higher
```

### 2. Clone the Repository

```bash
# Clone the project
git clone https://github.com/your-username/coffee-tasting-journal.git

# Navigate to project directory
cd coffee-tasting-journal
```

### 3. Install Dependencies

```bash
# Install all npm packages
npm install

# Install CocoaPods dependencies (macOS only, for iOS)
cd ios && pod install && cd ..
```

## 📱 Platform-Specific Setup

### iOS Setup (macOS Only)

#### 1. Install Xcode
- Download from Mac App Store
- Open Xcode and agree to license
- Install additional components when prompted

#### 2. Install Command Line Tools
```bash
xcode-select --install
```

#### 3. Install CocoaPods
```bash
sudo gem install cocoapods
```

#### 4. Install iOS Dependencies
```bash
cd ios
pod install
cd ..
```

#### 5. Run on iOS Simulator
```bash
# Start Metro bundler
npm start

# In a new terminal, run iOS
npm run ios

# Or specify a simulator
npm run ios -- --simulator="iPhone 14"
```

### Android Setup

#### 1. Install Android Studio
1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

#### 2. Configure Environment Variables

**macOS/Linux:**
Add to `~/.bash_profile` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

**Windows:**
1. Open System Properties → Environment Variables
2. Add new System Variable:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\[USERNAME]\AppData\Local\Android\Sdk`
3. Add to PATH:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

#### 3. Apply Environment Variables
```bash
# macOS/Linux
source ~/.bash_profile
# or
source ~/.zshrc

# Windows - Restart Command Prompt/PowerShell
```

#### 4. Create Android Virtual Device (AVD)
1. Open Android Studio
2. Click "AVD Manager" icon
3. Create Virtual Device → Choose device (e.g., Pixel 4)
4. Select system image (API 30 or higher recommended)
5. Finish setup

#### 5. Run on Android
```bash
# Start Metro bundler
npm start

# In a new terminal, run Android
npm run android
```

## 📦 Required Packages Installation

The following packages are already included in package.json:

### Core Dependencies
```json
{
  "react": "18.2.0",
  "react-native": "0.72.6",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/stack": "^6.3.20",
  "react-native-screens": "^3.27.0",
  "react-native-safe-area-context": "^4.7.4",
  "react-native-gesture-handler": "^2.13.4",
  "zustand": "^4.4.6",
  "@react-native-community/slider": "^4.4.3"
}
```

### If Adding New Packages
```bash
# Example: Adding AsyncStorage
npm install @react-native-async-storage/async-storage

# For iOS, run pod install
cd ios && pod install && cd ..
```

## 🔧 Common Troubleshooting

### Metro Bundler Issues

#### Error: "Metro bundler is not running"
```bash
# Clear cache and restart
npm start -- --reset-cache
```

#### Error: "Port 8081 already in use"
```bash
# Kill the process using port 8081
# macOS/Linux
lsof -i :8081
kill -9 <PID>

# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Or use a different port
npm start -- --port=8082
```

### iOS Issues

#### Error: "No bundle URL present"
```bash
# Clean and rebuild
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

#### Error: "Command PhaseScriptExecution failed"
```bash
# Clean build folder
cd ios
xcodebuild clean
cd ..
# Then rebuild
npm run ios
```

### Android Issues

#### Error: "SDK location not found"
1. Create `local.properties` in `android/` folder
2. Add: `sdk.dir = /path/to/Android/sdk`

#### Error: "Could not connect to development server"
```bash
# For physical device
adb reverse tcp:8081 tcp:8081

# For emulator, check if it's running
adb devices
```

#### Error: "Gradle build failed"
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### General Issues

#### Node Modules Issues
```bash
# Complete cleanup
rm -rf node_modules
rm package-lock.json
npm install

# For iOS
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

#### React Native Version Mismatch
```bash
# Check versions
npm list react-native

# Ensure matching versions in package.json
```

## 🎯 Verify Setup

Run this checklist to ensure everything is working:

1. **Metro Bundler starts**: `npm start` shows Metro welcome screen
2. **iOS builds**: `npm run ios` launches simulator with app
3. **Android builds**: `npm run android` launches emulator with app
4. **Hot Reload works**: Make a change in `App.tsx` and see it update

## 📱 Running on Physical Devices

### iOS Device
1. Connect iPhone via USB
2. Open `ios/CoffeeTastingJournal.xcworkspace` in Xcode
3. Select your device from the device list
4. Click Run button

### Android Device
1. Enable Developer Mode on device
2. Enable USB Debugging
3. Connect via USB
4. Run `adb devices` to verify connection
5. Run `npm run android`

## 🆘 Getting Help

If you encounter issues:

1. Check React Native docs: [reactnative.dev](https://reactnative.dev)
2. Search existing issues on GitHub
3. Ask in React Native Community Discord
4. Create an issue with:
   - Error message
   - Steps to reproduce
   - System information (`npx react-native info`)

## 🎉 Success!

If everything is working, you should see:
- Home screen with "커피 테이스팅 저널" title
- "새 테이스팅 시작" button
- Brown/coffee color scheme

Happy coding! ☕️