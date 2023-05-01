import asyncStorage from '@react-native-async-storage/async-storage';

import {
  formatFromStore,
  formatToStore,
  createCustomGlobalStateWithDecoupledFuncs,
} from 'react-native-global-state-hooks';

type HookConfig = {
  asyncStorageKey?: string;
};

// This is the base metadata that all the stores created from the builder will have.
type BaseMetadata = {
  isAsyncStorageReady?: boolean;
};

export const createGlobalState = createCustomGlobalStateWithDecoupledFuncs<
  BaseMetadata,
  HookConfig
>({
  /**
   * This function executes immediately after the global state is created, before the invocations of the hook
   */
  onInitialize: async ({ setState, setMetadata }, config) => {
    setMetadata((metadata) => ({
      ...(metadata ?? {}),
      isAsyncStorageReady: null,
    }));

    const asyncStorageKey = config?.asyncStorageKey;
    if (!asyncStorageKey) return;

    const storedItem = (await asyncStorage.getItem(asyncStorageKey)) as string;

    // update the metadata, remember, metadata is not reactive
    setMetadata((metadata) => ({
      ...metadata,
      isAsyncStorageReady: true,
    }));

    if (storedItem === null) {
      return setState((state) => state, { forceUpdate: true });
    }

    const parsed = formatFromStore(storedItem, {
      jsonParse: true,
    });

    setState(parsed, { forceUpdate: true });
  },

  onChange: ({ getState }, config) => {
    if (!config?.asyncStorageKey) return;

    const state = getState();

    const formattedObject = formatToStore(state, {
      stringify: true,
    });

    asyncStorage.setItem(config.asyncStorageKey, formattedObject);
  },
});
