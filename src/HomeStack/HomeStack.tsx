import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  TouchableOpacity,
  View,
  Text,
  Button,
  FlatList,
  RefreshControl,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { Todo, useTodos } from '@src/stores/todos';

const HomeStack = createStackNavigator();

interface Props {
  navigation: any;
}

const TodoList: React.FC = () => {
  const [todos, setTodos, { isAsyncStorageReady }] = useTodos(); // State to store the todos

  // Function to add a new todo
  const handleAddTodo = () => {
    const newTodo: Todo = {
      id: new Date().getTime().toString(),
      title: `Todo ${todos.size + 1}`,
    };

    const newTodos = new Map(todos);
    newTodos.set(newTodo.id, newTodo);

    setTodos(newTodos);
  };

  // Function to remove a todo
  const handleRemoveTodo = (id: string) => {
    const newTodos = new Map(todos);
    newTodos.delete(id);

    setTodos(newTodos);
  };

  // Render item for the FlatList
  const renderItem = ({ item }: { item: Todo }) => (
    <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ flex: 1 }}>{item.title}</Text>
      <Button title='Remove' onPress={() => handleRemoveTodo(item.id)} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
        }}
      >
        <Button title='Add Todo' onPress={handleAddTodo} />
      </View>

      <FlatList
        data={Array.from(todos.values())}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
        refreshControl={<RefreshControl refreshing={!isAsyncStorageReady} />}
      />
    </View>
  );
};

const HomeNavigator: React.FC<Props> = ({ navigation }) => {
  return (
    <HomeStack.Navigator initialRouteName='HomeMain'>
      <HomeStack.Screen
        name='HomeMain'
        options={{
          headerLeft: () => null,
          title: 'Todo List',
        }}
      >
        {() => <TodoList />}
      </HomeStack.Screen>

      <HomeStack.Screen
        name='TodoEdit'
        options={({ route }) => ({
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name='chevron-back-outline' size={30} />
            </TouchableOpacity>
          ),
          title: 'Edit Todo',
        })}
      >
        {() => (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text>Edit Todo</Text>
          </View>
        )}
      </HomeStack.Screen>
    </HomeStack.Navigator>
  );
};

export default HomeNavigator;
