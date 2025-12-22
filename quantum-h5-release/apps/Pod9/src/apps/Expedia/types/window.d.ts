export {}
declare global {
  interface Window {
    topTunnel: {
      next(): Promise<any>
      on(fn: (d: any) => void): () => void
      emit(data: any): void
    }
  }
}