import { StoreTools } from 'react-native-global-state-hooks';
import { createGlobalState } from './GlobalStore';

export interface Todo {
  id: string;
  title: string;
  completed?: boolean;
}

export const [useTodos] = createGlobalState(
  new Map<string, Todo>([
    [
      '-1',
      {
        id: '-1',
        title: 'Example todo default',
      },
    ],
  ]),
  {
    config: {
      asyncStorageKey: 'todos',
    },
    actions: {
      add(todo: Omit<Todo, 'id'>) {
        return ({ setState, getState }: StoreTools<Map<string, Todo>>) => {
          const newState = new Map(getState());

          const id = new Date().getTime().toString();

          newState.set(id, {
            ...todo,
            id,
          });

          setState(newState);

          return getState();
        };
      },

      update(todo: Todo) {
        return ({ setState, getState }: StoreTools<Map<string, Todo>>) => {
          const newState = new Map(getState());

          newState.set(todo.id, todo);
          setState(newState);

          return getState();
        };
      },

      partialUpdate(update: Partial<Todo> & { id: string }) {
        return ({ setState, getState }: StoreTools<Map<string, Todo>>) => {
          const newState = new Map(getState());

          const todo = newState.get(update.id);

          if (todo) {
            newState.set(update.id, { ...todo, ...update });
            setState(newState);
          }

          return getState();
        };
      },

      remove(id: string) {
        return ({ setState, getState }: StoreTools<Map<string, Todo>>) => {
          const newState = new Map(getState());

          newState.delete(id);
          setState(newState);

          return getState();
        };
      },
    } as const,
  }
);
