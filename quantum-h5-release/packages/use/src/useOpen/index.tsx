import { computed, defineComponent, reactive, shallowReactive, shallowRef, nextTick } from 'vue';
import { isEqual } from 'lodash-es';
import { useEvent } from '../useEvent';

const OpenMountedMap = shallowReactive(new Map<string, { Com: any; props: any }>());
const OpenMountedEventMap = shallowReactive(new Map<string, Record<string, any>>());

/** open打开挂载点 */
export const OpenMounted = defineComponent({
  name: 'OpenMounted',
  setup() {
    return () => {
      return [...OpenMountedMap.keys()].map((key) => {
        const { Com, props } = OpenMountedMap.get(key)!;
        const propsRef = shallowRef(props);
        const vnode: any = <Com key={key} {...propsRef.value} />;
        Object.assign(vnode.ctx.provides, OpenMountedEventMap.get(key), { isUseOpen: true });
        return vnode;
      });
    };
  },
});

export const openMount = (key, Com, props = {}) => {
  if (!OpenMountedMap.has(key) || !isEqual(OpenMountedMap.get(key)!.props, props)) {
    OpenMountedMap.set(key, {
      Com,
      props,
    });
  }
};

export const openUnmount = (key: string) => {
  OpenMountedMap.delete(key);
};

type UseOpenOpts = {
  key?: string;
  onOpenChange?: (next: boolean) => boolean;
  unmountAfterClose?: boolean;
  fieldNames?: {
    afterClose?: string;
  };
};

export const useOpen = (opts: UseOpenOpts = {}) => {
  const {
    key,
    onOpenChange,
    unmountAfterClose = true,
    fieldNames = {
      open: 'open',
      afterClose: 'afterClose',
      'onUpdate:open': 'onUpdate:open',
    },
  } = opts;
  const randomKey = key || Math.random().toString();

  const state = reactive({
    open: false,
  });
  const { runEvent, onEvent, offEvent } = useEvent();

  const openToggle = async (next?: boolean) => {
    if (!OpenMountedMap.has(randomKey)) return false;
    const nextOpen = next === undefined ? !state.open : next;
    const list = [
      onOpenChange?.(nextOpen),
      ...runEvent('beforeOpenChange', nextOpen, 'parallel'),
      ...(nextOpen ? [] : runEvent('beforeClose', nextOpen, 'parallel')),
    ].filter((item) => item !== undefined);

    const canNext = list.length
      ? await Promise.all(list).then((list = []) => {
          return list.find((item) => item === false) ?? true;
        })
      : true;
    if (canNext !== false) {
      state.open = nextOpen;
      await nextTick();
      runEvent('openChange', nextOpen, 'parallel');
      return true;
    }
    return false;
  };

  const open = async (data) => {
    const list = [...runEvent('beforeOpen', data, 'parallel')].filter((item) => item !== undefined);
    const canNext = list.length
      ? await Promise.all(list).then((list = []) => {
          return list.find((item) => item === false) ?? true;
        })
      : true;
    if (canNext === false) return false;

    const isOpen = await openToggle(true);
    if (isOpen) {
      runEvent('open', data, 'parallel');
    }
    return isOpen;
  };
  const openModal = async (Com, data = {}, modalProps = {}) => {
    openMount(randomKey, Com, modalProps);
    await nextTick();
    return open(data);
  };
  const close = () => {
    return openToggle(false);
  };
  const afterClose = () => {
    if (!state.open) {
      runEvent('close', state.open, 'parallel');
      if (unmountAfterClose) {
        openUnmount(randomKey);
      }
    }
  };
  const vBind = computed(() => {
    return {
      [fieldNames['open'] || 'open']: state.open,
      [fieldNames['afterClose'] || 'afterClose']: afterClose,
      [fieldNames['onUpdate:open'] || 'onUpdate:open']: openToggle,
    };
  });
  const unMount = () => {
    openUnmount(randomKey);
  };
  const unMountedSafe = async () => {
    if (state.open) {
      await close();
    }
    if (!unmountAfterClose) {
      onEvent('close', unMount);
    }
  };
  const emitOpenEvent = (data = {}) => {
    runEvent('event', data, 'parallel');
  };
  const eventObj = {
    onOpen: onEvent.bind(null, 'open'),
    onBeforeOpen: onEvent.bind(null, 'beforeOpen'),
    onClose: onEvent.bind(null, 'close'),
    onBeforeClose: onEvent.bind(null, 'beforeClose'),
    onOpenChange: onEvent.bind(null, 'openChange'),
    onBeforeOpenChange: onEvent.bind(null, 'beforeOpenChange'),
    emitOpenEvent,
    onOpenEvent: onEvent.bind(null, 'event'),
    offOpenEvent: offEvent.bind(null, 'event'),
  };
  OpenMountedEventMap.set(randomKey, eventObj);
  return {
    vBind,
    openToggle,
    open: openModal,
    close,
    unMount: unMountedSafe,
    ...eventObj,
  };
};

export const useDrawerOpen = (opts: Omit<UseOpenOpts, 'fieldNames'> = {}) => {
  return useOpen({
    ...opts,
    fieldNames: {
      afterClose: 'onAfterOpenChange',
    },
  });
};
