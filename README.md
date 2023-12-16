const README = `

# Todo List with Global State Hooks

This is a simple Todo List app built using React Native and Global State Hooks. The app uses a custom implementation of the `react-native-global-state-hooks` package along with `AsyncStorage` for persisting the state.

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/todo-list-with-global-hooks.git
```

## Introduction

In this project, we demonstrate how to use the `react-native-global-state-hooks` package to handle global state in a React Native app. We also show how to extend the `GlobalStore` class to create a persisted store that can be rehydrated between sessions.

## Features

- Add and remove todo items
- Persists todo items using AsyncStorage
- Uses Global State Hooks to manage state across components

## Implementation Details

### Creating the `useTodos` Hook

In the `@src/stores/todos.ts` file, we define a simple Todo interface and create a new instance of the `GlobalStore` class to manage the state of our todos. We then define a new hook called `useTodos` that retrieves the state and setter functions from the global store.

```ts
import { GlobalStore } from './GlobalStore';

export interface Todo {
  id: string;
  title: string;
}

const store = new GlobalStore<Map<string, Todo>>(new Map(), {
  asyncStorageKey: 'todos',
});

export const useTodos = store.getHook();
```

### Using the `useTodos` Hook

In the `TodoList` component, we use the `useTodos` hook to manage the state of our todos. We add a new todo by creating a new object with a unique id and title and then updating the state with the new object. We remove a todo by deleting it from the state object.

```tsx
const TodoList: React.FC = () => {
  const [todos, setTodos, { isAsyncStorageReady }] = useTodos(); // State to store the todos

  //...
  // if isAsyncStorageReady means that the hook already retrieved the information from the asyncStorage
// ...
```

### Persisting the State

To persist the state of our todos between app sessions, we extend the `GlobalStore` class to add support for AsyncStorage. We define a new class called `AsyncGlobalStore` that extends the `GlobalStore` class and adds methods for reading and writing the state to AsyncStorage. We then create a new instance of `AsyncGlobalStore` and pass it to our `useTodos` hook.

```ts
const store = new GlobalStore<Map<string, Todo>>(new Map(), {
  asyncStorageKey: 'todos', // for persisting the data you just need to add a key for the asyncStorageKey
});
```

## Conclusion

Using Global State Hooks and the `AsyncStorage` API in React Native can simplify state management and make it easier to share state across components. By extending the `GlobalStore` class, we can create custom stores that support advanced features like persistence.

## `[IMPORTANT!]`: From version 6.0.0, you can continue creating your custom implementations or using your previous ones. However, now AsyncStorage is already integrated into the global hooks with @react-native-async-storage/async-storage. You simply need to add a key for the persistent storage, and that will do the trick.

```ts
// this is all you need fo using async storage
const useCountPersisted = createGlobalState(1, {
  asyncStorage: {
    key: 'count',
  },
});

/**
 * Usage in your components:
 * [NOTE]: If no key is provided, the default metadata is null. Otherwise, it's set to { isAsyncStorageReady: false }.
 *
 * Upon the first successful retrieval from AsyncStorage, components will re-render with { isAsyncStorageReady: true } in the metadata.
 * The metadata and components will be updated and re-rendered even if there's no difference between the value stored in AsyncStorage and the store's default value. This is the only instance where the metadata forces a re-render, after this the metadata will not update the component
 */
const [count, setCount, { isAsyncStorageReady }] = useCountPersisted();
```

Now lets continue analizing how to create a custom GlobalStore

# GlobalStore With AsyncStorage

```ts
import { GlobalStore as GlobalStoreBase } from 'react-native-global-state-hooks';
import { formatFromStore, formatToStore } from 'json-storage-formatter';
import asyncStorage from '@react-native-async-storage/async-storage';

import {
  StateSetter,
  StateConfigCallbackParam,
  StateChangesParam,
  ActionCollectionConfig,
} from 'react-native-global-state-hooks/lib/GlobalStore.types';

/**
 * GlobalStore is an store that could also persist the state in the async storage
 * @template {TState} TState - The state of the store
 * @template {TMetadata} TMetadata - The metadata of the store, it must contain a readonly property called isAsyncStorageReady which cannot be set from outside the store
 * @template {TStateSetter} TStateSetter - The storeActionsConfig of the store
 */
export class GlobalStore<
  TState,
  // this restriction is needed to avoid the consumers to set the isAsyncStorageReady property from outside the store,
  // ... even when the value will be ignored is better to avoid it to avoid confusion
  TMetadata extends { readonly isAsyncStorageReady?: never } & Record<
    string,
    unknown
  > = {},
  TStateSetter extends StorageSetter<TState, TMetadata> = StateSetter<TState>
> extends GlobalStoreBase<TState, StorageMetadata<TMetadata>, TStateSetter> {
  /**
   * Config for the async storage
   * includes the asyncStorageKey and the metadata which will be used to determine if the async storage is ready or not
   * @template {TState} TState - The state of the store
   * @template {TMetadata} TMetadata - The metadata of the store
   * @template {TStateSetter} TStateSetter - The storeActionsConfig of the store
   **/
  protected config: StorageConfig<TState, TMetadata, TStateSetter> = {};

  /**
   * Creates a new instance of the GlobalStore
   * @param {TState} state - The initial state of the store
   * @param {GlobalStoreConfig<TState, TMetadata, ActionCollectionConfig<TState, TMetadata> | StateSetter<TState>> & { asyncStorageKey: string; }} config - The config of the store
   * @param  {GlobalStoreConfig<TState, TMetadata, ActionCollectionConfig<TState, TMetadata> | StateSetter<TState>> & { asyncStorageKey: string; }} config.metadata - The metadata of the store which will be used to determine if the async storage is ready or not, also it could store no reactive data
   * @param  {GlobalStoreConfig<TState, TMetadata, ActionCollectionConfig<TState, TMetadata> | StateSetter<TState>> & { asyncStorageKey: string; }} config.asyncStorageKey - The key of the async storage
   * @param  {GlobalStoreConfig<TState, TMetadata, ActionCollectionConfig<TState, TMetadata> | StateSetter<TState>> & { asyncStorageKey: string; }} config.onInit - The callback that will be called once the store is created
   * @param  {GlobalStoreConfig<TState, TMetadata, ActionCollectionConfig<TState, TMetadata> | StateSetter<TState>> & { asyncStorageKey: string; }} config.onStateChange - The callback that will be called once the state is changed
   * @param  {GlobalStoreConfig<TState, TMetadata, ActionCollectionConfig<TState, TMetadata> | StateSetter<TState>> & { asyncStorageKey: string; }} config.onSubscribed - The callback that will be called every time a new component is subscribed to the store
   * @param  {GlobalStoreConfig<TState, TMetadata, ActionCollectionConfig<TState, TMetadata> | StateSetter<TState>> & { asyncStorageKey: string; }} config.computePreventStateChange - The callback that will be called before the state is changed, if it returns true the state will not be changed
   * @param {TStateSetter} setterConfig - The actions configuration object (optional) (default: null) if not null the store manipulation will be done through the actions
   */
  constructor(
    state: TState,
    config: StorageConfig<TState, TMetadata, TStateSetter> | null = null,
    setterConfig: TStateSetter | null = null
  ) {
    const { onInit, asyncStorageKey, ...configParameters } =
      config ?? ({} as StorageConfig<TState, TMetadata, TStateSetter>);

    super(state, configParameters, setterConfig as TStateSetter);

    // if there is not async storage key this is not a persistent store
    const isAsyncStorageReady: boolean | null = asyncStorageKey ? false : null;

    this.config = {
      ...config,
      metadata: {
        ...((configParameters.metadata ?? {}) as TMetadata),
        isAsyncStorageReady,
      },
    };

    const hasInitCallbacks = !!(asyncStorageKey || onInit);
    if (!hasInitCallbacks) return;

    const parameters = this.getConfigCallbackParam({});

    this.onInit(parameters);
    onInit?.(parameters);
  }

  /**
   * This method will be called once the store is created after the constructor,
   * this method is different from the onInit of the confg property and it won't be overriden
   */
  protected onInit = async ({
    setState,
    setMetadata,
    getMetadata,
  }: StateConfigCallbackParam<
    TState,
    StorageMetadata<TMetadata>,
    NonNullable<TStateSetter>
  >) => {
    const { asyncStorageKey } = this.config;
    if (!asyncStorageKey) return;

    const storedItem: string = await asyncStorage.getItem(asyncStorageKey);

    setMetadata({
      ...getMetadata(),
      isAsyncStorageReady: true,
    });

    if (storedItem === null) return;

    const jsonParsed = JSON.parse(storedItem);
    const items = formatFromStore<TState>(jsonParsed);

    setState(items);
  };

  protected onStateChanged = ({
    getState,
  }: StateChangesParam<
    TState,
    StorageMetadata<TMetadata>,
    NonNullable<TStateSetter>
  >) => {
    const { asyncStorageKey } = this.config;
    if (!asyncStorageKey) return;

    const state = getState();
    const formattedObject = formatToStore(state, {
      stringify: true,
    });

    asyncStorage.setItem(asyncStorageKey, formattedObject);
  };
}

/**
 * Metadata of the store
 * @template {TMetadata} TMetadata - The metadata type which also contains the isAsyncStorageReady property
 */
type StorageMetadata<TMetadata> = Omit<TMetadata, 'isAsyncStorageReady'> & {
  readonly isAsyncStorageReady?: boolean | null;
};

/**
 * The setter of the store
 * @template {TState} TState - The state of the store
 * @template {TMetadata} TMetadata - The metadata of the store, it must contain a readonly property called isAsyncStorageReady which cannot be set from outside the store
 * */
type StorageSetter<TState, TMetadata> =
  | ActionCollectionConfig<TState, StorageMetadata<TMetadata>>
  | StateSetter<TState>
  | null;

/**
 * Config for the async storage
 * includes the asyncStorageKey
 * @template {TState} TState - The state of the store
 * @template {TMetadata} TMetadata - The metadata of the store, it must contain a readonly property called isAsyncStorageReady which cannot be set from outside the store
 * @template {TStateSetter} TStateSetter - The storeActionsConfig of the store
 */
type StorageConfig<
  TState,
  TMetadata extends { readonly isAsyncStorageReady?: never },
  TStateSetter extends
    | ActionCollectionConfig<TState, StorageMetadata<TMetadata>>
    | StateSetter<TState>
    | null = StateSetter<TState>
> = {
  asyncStorageKey?: string;

  metadata?: TMetadata;

  onInit?: (
    parameters: StateConfigCallbackParam<
      TState,
      StorageMetadata<TMetadata>,
      NonNullable<TStateSetter>
    >
  ) => void;

  onStateChanged?: (
    parameters: StateChangesParam<
      TState,
      StorageMetadata<TMetadata>,
      NonNullable<TStateSetter>
    >
  ) => void;

  onSubscribed?: (
    parameters: StateConfigCallbackParam<
      TState,
      StorageMetadata<TMetadata>,
      NonNullable<TStateSetter>
    >
  ) => void;

  computePreventStateChange?: (
    parameters: StateChangesParam<
      TState,
      StorageMetadata<TMetadata>,
      NonNullable<TStateSetter>
    >
  ) => boolean;
};
```

## License

MIT
