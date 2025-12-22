import { computed, ref, Ref, ComputedRef } from 'vue'
import { Isnapshot } from '@/types'

interface IcurrentSnapshot extends Isnapshot {
  prevActive: Boolean
  nextActive: Boolean
}

export function useSnapshots(snapshotMaxLength: number): {
  snapshots: Ref<{
    currentIndex: number
    list: Array<Isnapshot>
  }>
  currentSnapshot: ComputedRef<IcurrentSnapshot>
  setSnapshots: (value: Array<Isnapshot> | Isnapshot | number) => void
} {
  // 操作快照
  const snapshots = ref<{
    currentIndex: number
    list: Array<Isnapshot>
  }>({
    currentIndex: -1,
    list: [],
  })

  // 当前操作快照
  const currentSnapshot = computed(() => {
    const snapshot = snapshots.value.list[snapshots.value.currentIndex]

    return {
      ...snapshot,
      prevActive: snapshots.value.currentIndex > 0,
      nextActive: snapshots.value.currentIndex < snapshots.value.list.length - 1,
    }
  })

  // 设置操作快照
  const setSnapshots = (value) => {
    // value 等于 -1 表示重置快照
    // value 等于 0 表示后退快照
    // value 等于 1 表示前进快照
    // value 不为数字表示添加快照

    if (value === -1) {
      snapshots.value = {
        currentIndex: -1,
        list: [],
      }
    } else if (value === 0) {
      if (currentSnapshot.value.prevActive) {
        snapshots.value = {
          ...snapshots.value,
          currentIndex: snapshots.value.currentIndex - 1,
        }
      }
    } else if (value === 1) {
      if (currentSnapshot.value.nextActive) {
        snapshots.value = {
          ...snapshots.value,
          currentIndex: snapshots.value.currentIndex + 1,
        }
      }
    } else {
      snapshots.value = {
        ...snapshots.value,
        currentIndex: Math.min(
          snapshots.value.currentIndex + (value instanceof Array ? value.length : 1),
          snapshotMaxLength - 1
        ),
        list: [
          ...snapshots.value.list.slice(0, snapshots.value.currentIndex + 1),
          ...(value instanceof Array ? value : [value]),
        ].slice(-snapshotMaxLength),
      }
    }
  }

  return {
    snapshots,
    currentSnapshot,
    setSnapshots,
  }
}
