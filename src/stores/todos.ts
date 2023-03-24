import { GlobalStore } from './GlobalStore';

export interface Todo {
  id: string;
  title: string;
}

const store = new GlobalStore<Map<string, Todo>>(
  new Map([
    [
      '-1',
      {
        id: '-1',
        title: 'Example todo default',
      },
    ],
    [
      '-2',
      {
        id: '-2',
        title: 'Example todo 2 default',
      },
    ],
  ]),
  {
    asyncStorageKey: 'todos',
  }
);

export const useTodos = store.getHook();
