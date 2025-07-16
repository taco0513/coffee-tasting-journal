import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {RootStackParamList} from '../types/navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { Colors } from '../constants/colors';

// 화면 import
import HomeScreen from '../screens/HomeScreen';
import CoffeeInfoScreen from '../screens/CoffeeInfoScreen';
import RoasterNotesScreen from '../screens/RoasterNotesScreen';
import FlavorLevel1Screen from '../screens/flavor/FlavorLevel1Screen';
import FlavorLevel2Screen from '../screens/flavor/FlavorLevel2Screen';
import FlavorLevel3Screen from '../screens/flavor/FlavorLevel3Screen';
import FlavorLevel4Screen from '../screens/flavor/FlavorLevel4Screen';
import SensoryScreen from '../screens/SensoryScreen';
import ResultScreen from '../screens/ResultScreen';
import TastingDetailScreen from '../screens/TastingDetailScreen';
import StatsScreen from '../screens/StatsScreen';
import OCRScanScreen from '../screens/OCRScanScreen';
import OCRResultScreen from '../screens/OCRResultScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator<RootStackParamList>();
const TastingStack = createStackNavigator<RootStackParamList>();
const StatsStack = createStackNavigator<RootStackParamList>();

// 홈 스택
function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E0E0E0',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          title: '홈',
          headerShown: false,
        }}
      />
      <HomeStack.Screen
        name="TastingDetail"
        component={TastingDetailScreen}
        options={{
          title: '상세 정보',
          presentation: 'card', // modal 대신 card 사용
        }}
      />
    </HomeStack.Navigator>
  );
}

// 새 테이스팅 스택
function TastingStackScreen() {
  return (
    <TastingStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E0E0E0',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}>
      <TastingStack.Screen
        name="CoffeeInfo"
        component={CoffeeInfoScreen}
        options={{
          title: '커피 정보',
        }}
      />
      <TastingStack.Screen
        name="OCRScan"
        component={OCRScanScreen}
        options={{
          title: '라벨 스캔',
          headerShown: true,
        }}
      />
      <TastingStack.Screen
        name="OCRResult"
        component={OCRResultScreen}
        options={{
          title: 'OCR 결과 확인',
          headerShown: true,
        }}
      />
      <TastingStack.Screen
        name="RoasterNotes"
        component={RoasterNotesScreen}
        options={{
          title: '로스터 노트',
        }}
      />
      <TastingStack.Screen
        name="FlavorLevel1"
        component={FlavorLevel1Screen}
        options={{
          title: '맛 선택',
        }}
      />
      <TastingStack.Screen
        name="FlavorLevel2"
        component={FlavorLevel2Screen}
        options={{
          title: '세부 맛 선택',
        }}
      />
      <TastingStack.Screen
        name="FlavorLevel3"
        component={FlavorLevel3Screen}
        options={{
          title: '구체적인 맛',
        }}
      />
      <TastingStack.Screen
        name="FlavorLevel4"
        component={FlavorLevel4Screen}
        options={{
          title: '맛 특성',
        }}
      />
      <TastingStack.Screen
        name="Sensory"
        component={SensoryScreen}
        options={{
          title: '감각 평가',
        }}
      />
      <TastingStack.Screen
        name="Result"
        component={ResultScreen}
        options={{
          title: '테이스팅 결과',
        }}
      />
    </TastingStack.Navigator>
  );
}

// 통계 스택
function StatsStackScreen() {
  return (
    <StatsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E0E0E0',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}>
      <StatsStack.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: '통계',
        }}
      />
    </StatsStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName: string;

            if (route.name === '홈') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === '새 테이스팅') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === '통계') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else {
              iconName = 'help-circle-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6c4e31',
          tabBarInactiveTintColor: Colors.TAB_INACTIVE,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#f8f9fa',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
          },
        })}>
        <Tab.Screen name="홈" component={HomeStackScreen} />
        <Tab.Screen name="새 테이스팅" component={TastingStackScreen} />
        <Tab.Screen name="통계" component={StatsStackScreen} />
      </Tab.Navigator>
      {/* Toast 컴포넌트 추가 - NavigationContainer 안의 맨 아래에 */}
      <Toast />
    </NavigationContainer>
  );
}

export default AppNavigator;