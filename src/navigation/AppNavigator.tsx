import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';

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

const Stack = createStackNavigator<RootStackParamList>();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
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
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '커피 테이스팅 저널',
            headerShown: false, // 홈 화면은 헤더 숨김
          }}
        />
        <Stack.Screen
          name="CoffeeInfo"
          component={CoffeeInfoScreen}
          options={{
            title: '커피 정보',
          }}
        />
        <Stack.Screen
          name="RoasterNotes"
          component={RoasterNotesScreen}
          options={{
            title: '로스터 노트',
          }}
        />
        <Stack.Screen
          name="FlavorLevel1"
          component={FlavorLevel1Screen}
          options={{
            title: '맛 선택',
          }}
        />
        <Stack.Screen
          name="FlavorLevel2"
          component={FlavorLevel2Screen}
          options={{
            title: '세부 맛 선택',
          }}
        />
        <Stack.Screen
          name="FlavorLevel3"
          component={FlavorLevel3Screen}
          options={{
            title: '구체적인 맛',
          }}
        />
        <Stack.Screen
          name="FlavorLevel4"
          component={FlavorLevel4Screen}
          options={{
            title: '맛 특성',
          }}
        />
        <Stack.Screen
          name="Sensory"
          component={SensoryScreen}
          options={{
            title: '감각 평가',
          }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{
            title: '테이스팅 결과',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;