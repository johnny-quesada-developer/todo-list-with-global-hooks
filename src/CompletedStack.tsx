import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';

const CompletedStack = createStackNavigator();

const CompletedTodos: React.FC = () => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Completed Todos</Text>
    </View>
  );
};

const CompletedNavigator: React.FC<{ navigation }> = () => {
  return (
    <CompletedStack.Navigator>
      <CompletedStack.Screen
        name='CompletedTodos'
        component={CompletedTodos}
        options={{
          title: 'Completed Todos',
        }}
      />
    </CompletedStack.Navigator>
  );
};

export default CompletedNavigator;
