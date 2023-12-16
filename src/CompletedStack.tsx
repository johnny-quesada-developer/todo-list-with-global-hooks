import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, FlatList, RefreshControl, Text, View } from 'react-native';
import { Todo, useTodos } from './stores';

const CompletedStack = createStackNavigator();

const CompletedTodos: React.FC = () => {
  const [todos, actions, { isAsyncStorageReady }] = useTodos(); // State to store the todos

  const completed = Array.from(todos.values()).filter((todo) => todo.completed);

  const renderItem = ({ item }: { item: Todo }) => (
    <View
      style={{
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text>{item.title}</Text>
      <Button title='Remove' onPress={() => actions.remove(item.id)} />
    </View>
  );

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
      }}
    >
      <FlatList
        data={completed}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
        refreshControl={<RefreshControl refreshing={!isAsyncStorageReady} />}
      />
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
