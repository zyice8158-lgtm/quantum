import { getCurrentInstance, onUnmounted } from 'vue';
/**
 * 运行方式
 * - `serial` -> 串行
 * - `parallel` -> 并行
 * */
export type EventRunType = 'parallel' | 'serial';


const ScopeMap: Record<string, {
  runEvent: {
    (type: string, data: any, runType: "parallel"): any[];
    (type: string, data: any, runType: "serial"): Promise<any>;
  };
  onEvent: (type: string, fn: Fn) => () => void;
  offEvent: (type: string, fn: Fn) => void;
  clearEvent: (type?: string) => void;
}> = Object.create(null);
type Fn = (...args: any[]) => any;

/**
 * 构建事件
 * @param opts.scopeName - 命名空间
  */
export const useEvent = (opts: {
  scopeName?: string;
} = {}) => {
  const { scopeName } = opts
  if (scopeName && ScopeMap[scopeName]) {
    return ScopeMap[scopeName]
  }

  const EventSet: Record<string, Set<Fn>> = Object.create(null);

  const runEventSerial = async (iterator: IterableIterator<Fn>, data: any) => {
    if (!iterator) return data;

    let nextData = data;
    let next = iterator.next();
    while (!next.done) {
      nextData = await next.value(nextData);
      next = iterator.next();
    }
    return nextData;
  };

  const runEventParallel = (iterator: IterableIterator<Fn>, data: any) => {
    if (!iterator) return [];

    const list: any[] = [];
    let next = iterator.next();
    while (!next.done) {
      list.push(next.value(data));
      next = iterator.next();
    }
    return list;
  };
  /** 并行执行，返回执行数组  */
  function runEvent(type: string, data: any, runType: 'parallel'): any[];
  /** 串行执行，返回汇总执行结果 */
  function runEvent(type: string, data: any, runType: 'serial'): Promise<any>;
  function runEvent(type: string, data: any, runType: EventRunType = 'parallel') {
    const iterator = EventSet[type]?.values();

    if (runType === 'serial') {
      return runEventSerial(iterator, data);
    }

    if (runType === 'parallel') {
      return runEventParallel(iterator, data);
    }
  }
  const onEvent = (type: string, fn: Fn) => {
    if (!EventSet[type]) {
      EventSet[type] = new Set();
    }
    EventSet[type].add(fn);
    // 组件内自动卸载
    const instance = getCurrentInstance();
    if (instance) {
      onUnmounted(() => {
        offEvent(type, fn);
      }, instance);
    }
    return () => offEvent(type, fn);
  };
  const offEvent = (type: string, fn: Fn) => {
    EventSet[type]?.delete(fn);
  };
  const clearEvent = (type?: string) => {
    if (type) {
      EventSet[type]?.clear();
    } else {
      Object.keys(EventSet).forEach((key) => {
        delete EventSet[key];
      });
    }
  };
  const medthod = {
    runEvent,
    onEvent,
    offEvent,
    clearEvent,
  }
  if (scopeName) {
    ScopeMap[scopeName] = medthod
  }
  return medthod;
};


export const useEventBus = (opts: {
  scopeName?: string;
} = {}) => {
  const Bus = useEvent(opts);
  return {
    on: Bus.onEvent,
    off: Bus.offEvent,
    clear: (type: string) => Bus.clearEvent(type),
    once: (type: string, fn: Fn) => {
      const onceFn = (...args: any[]) => {
        Bus.offEvent(type, onceFn);
        fn(...args);
      };
      Bus.onEvent(type, onceFn);
    },
    emit: (type: string, data?: unknown) => Bus.runEvent(type, data, 'parallel')
  };
}

export const EventBus = useEventBus()
