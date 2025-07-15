# Coffee Tasting Journal

A comprehensive mobile app for coffee enthusiasts to record, analyze, and track their coffee tasting experiences with AI-powered flavor matching.

## 🚀 Features

- **6-Step Tasting Flow**: Systematic coffee evaluation process
- **AI-Powered Matching**: Intelligent comparison between roaster notes and user selections
- **Flavor Wheel Integration**: Based on SCA (Specialty Coffee Association) flavor wheel
- **Bilingual Support**: Korean and English language support
- **Local Storage**: Offline-first with Realm database
- **Match Scoring**: Sophisticated algorithm combining flavor (60%) and sensory (40%) attributes

## 📱 Screenshots

*Coming soon...*

## 🛠️ Tech Stack

- **Frontend**: React Native with TypeScript
- **State Management**: Zustand
- **Database**: Realm (Local-first)
- **Navigation**: React Navigation
- **Animation**: React Native Reanimated
- **Platform**: iOS & Android

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## 📚 Documentation

- [Features](./FEATURES.md) - Detailed feature specifications
- [Tech Stack](./TECH-STACK.md) - Technical implementation details
- [Setup Guide](./docs/04-SETUP.md) - Development environment setup
- [Architecture](./docs/05-ARCHITECTURE.md) - System architecture overview

## 🔄 Workflow

1. **Coffee Info** → Enter basic coffee details
2. **Roaster Notes** → Input roaster's flavor descriptions
3. **Flavor Selection** → 4-level hierarchical flavor selection
4. **Sensory Evaluation** → Rate body, acidity, sweetness, finish, mouthfeel
5. **Results** → View match score and detailed analysis

## 🎯 Match Algorithm

- **Flavor Matching (60%)**: Compares roaster notes with user selections
- **Sensory Matching (40%)**: Evaluates sensory attribute alignment
- **Score Range**: 0-100% matching accuracy
- **Bilingual Processing**: Supports Korean and English terms

## 📊 Key Metrics

- **Match Score**: Overall tasting accuracy
- **Flavor Score**: Flavor profile matching
- **Sensory Score**: Sensory attribute alignment
- **Historical Tracking**: View past tasting performance

## 🔧 Development

This project uses:
- React Native 0.72+
- TypeScript for type safety
- Zustand for state management
- Realm for local data persistence
- SCA flavor wheel for standardized flavor terminology

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.