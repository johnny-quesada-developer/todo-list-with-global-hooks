import asyncStorage from '@react-native-async-storage/async-storage';

import {
  ActionCollectionConfig,
  StateChangesParam,
  StateConfigCallbackParam,
  StateSetter,
  GlobalStoreAbstract,
  GlobalStoreConfig,
  formatFromStore,
  formatToStore,
} from 'react-native-global-state-hooks';

export class GlobalStore<
  TState,
  TMetadata extends {
    asyncStorageKey?: string;
    isAsyncStorageReady?: boolean;
  },
  TStateSetter extends
    | ActionCollectionConfig<TState, TMetadata>
    | StateSetter<TState> = StateSetter<TState>
> extends GlobalStoreAbstract<TState, TMetadata, TStateSetter> {
  constructor(
    state: TState,
    config: GlobalStoreConfig<TState, TMetadata, TStateSetter> = {},
    setterConfig: TStateSetter | null = null
  ) {
    super(state, config, setterConfig);

    this.initialize();
  }

  protected onInitialize = async ({
    setState,
    setMetadata,
    getMetadata,
    getState,
  }: StateConfigCallbackParam<TState, TMetadata, TStateSetter>) => {
    const metadata = getMetadata();
    const { asyncStorageKey } = metadata;

    if (!asyncStorageKey) return;

    const storedItem = (await asyncStorage.getItem(asyncStorageKey)) as string;
    setMetadata({
      ...metadata,
      isAsyncStorageReady: true,
    });

    if (storedItem === null) {
      const state = getState();

      // force the re-render of the subscribed components even if the state is the same
      return setState(state, { forceUpdate: true });
    }

    const items = formatFromStore<TState>(storedItem, {
      jsonParse: true,
    });

    setState(items, { forceUpdate: true });
  };

  protected onChange = ({
    getMetadata,
    getState,
  }: StateChangesParam<TState, TMetadata, NonNullable<TStateSetter>>) => {
    const { asyncStorageKey } = getMetadata();

    if (!asyncStorageKey) return;

    const state = getState();

    const formattedObject = formatToStore(state, {
      stringify: true,
    });

    asyncStorage.setItem(asyncStorageKey, formattedObject);
  };
}
