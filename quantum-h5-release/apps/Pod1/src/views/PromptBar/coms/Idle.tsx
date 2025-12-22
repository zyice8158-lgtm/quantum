import { BarStore, LiveMode } from "@/store/bar";
import { throttle } from "@/utils";
import { IconQuantumLogo } from "@quantum/icons";
import { defineComponent, onMounted, onUnmounted, watch } from "vue";
import { useFiles } from "@libs/p-comps/hooks/useFiles";
import { useRouter } from "vue-router";

export const IdleView = defineComponent({
  name: "IdleView",
  setup() {
    const showRaw = (e: DragEvent) => {
      console.log("showRaw", BarStore.fileArea);
      if (!BarStore.fileArea) {
        BarStore.fileArea = true;
      }
    };

    const show = throttle(showRaw, 100);

    const hide = () => {
      if (BarStore.fileArea) BarStore.fileArea = false;
    };

    const onDragLeaveWindow = (e: DragEvent) => {
      if (e.relatedTarget == null) hide();
    };
    const onDrop = (e: DragEvent) => {
      console.log("onDrop");
      hide();
    };
    const onDragOver = (e: DragEvent) => {
      showRaw(e);
    };
    const { files } = useFiles();
    const router = useRouter();
    watch(files, (newFiles) => {
      router.push({
        name: "Chat",
        state: {
          files: JSON.parse(JSON.stringify(newFiles)),
        },
      });
    });
    onMounted(() => {
      window.addEventListener("dragenter", show); //拖拽时进入窗口
      window.addEventListener("dragleave", onDragLeaveWindow); // 拖拽时离开窗口
      window.addEventListener("drop", onDrop); // 在窗口内松手时
      window.addEventListener("dragover", onDragOver);
    });
    onUnmounted(() => {
      window.removeEventListener("dragenter", show);
      window.removeEventListener("dragleave", onDragLeaveWindow);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
      deleteScope();
    });
    return () => {
      return (
        <div class="idle-view">
          <div class="idle-border">
            <div class="idle-body acrylic-view rounded-[15px] flex justify-center items-center w-[48px] h-[24px] gap-[8px]">
              <IconQuantumLogo class="quantum-logo text-[16px]" />
              <IdleLive />
              <IdleRecord />
            </div>
          </div>
        </div>
      );
    };
  },
});

const IdleLive = defineComponent({
  name: "IdleLive",
  setup() {
    return () => {
      if (BarStore.liveMode != LiveMode.none) {
        return <div class="idle-live"></div>;
      }
    };
  },
});

const IdleRecord = defineComponent({
  name: "IdleRecord",
  setup() {
    return () => {
      if (BarStore.recording) {
        return <div class="idle-record"></div>;
      }
    };
  },
});
