import React, { useRef } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeNavigator from './HomeStack/HomeStack';
import CompletedNavigator from './CompletedStack';

const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: 'home-outline',
  Completed: 'checkmark-done-outline',
  Active: 'list-outline',
};

const App: React.FC = () => {
  const navigationRef =
    useRef<NavigationContainerRef<Record<string, unknown>>>(null);

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <NavigationContainer ref={navigationRef}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ size, focused }) => {
              const iconName = tabIcons[route.name as keyof typeof tabIcons];
              const color = focused ? '#673ab7' : '#222';

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarStyle: {
              paddingTop: 10,
            },
          })}
        >
          <Tab.Screen name='Home' options={{ headerShown: false }}>
            {({ navigation }) => <HomeNavigator navigation={navigation} />}
          </Tab.Screen>

          <Tab.Screen name='Completed' options={{ headerShown: false }}>
            {({ navigation }) => <CompletedNavigator navigation={navigation} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;
