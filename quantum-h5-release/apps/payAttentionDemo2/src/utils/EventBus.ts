/* eslint-disable @typescript-eslint/ban-types */
export default class EventBus {

    events: Record<string, Function[]> = {}
    on<K extends string, T extends Function>(key: K, callback: T) {
        if (!this.events[key]) {
            this.events[key] = []
        }
        this.events[key].push(callback);

    }
    emit(event: string, ...args: unknown[]) {
        this.events[event].forEach(cb => cb(...args));
    }
    remove(key: string) {
        this.events[key] = []
    }

}