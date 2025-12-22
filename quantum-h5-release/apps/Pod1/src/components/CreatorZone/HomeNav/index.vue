<template>
  <div class="home-nav">
    <div
      class="header"
      @click="
        () => {
          router.push('/')
        }
      "
    >
      <img class="header__logo" src="@/assets/img/svg/QuantumLogo.svg" />
      <div class="header__name">Creator Zone</div>
    </div>

    <div class="body">
      <div
        class="item chat"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                e.target.classList.add('hovered')
              },
              cancel: (e) => {
                e.target.classList.remove('hovered')
              },
            }
          }
        "
        @click="
          () => {
            router.push('/')
          }
        "
      >
        <img class="item__logo" src="@/assets/img/svg/chat.svg" />
        <div class="item__name">Chat to Create</div>
      </div>

      <div
        class="item customized"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                e.target.classList.add('hovered')
              },
              cancel: (e) => {
                e.target.classList.remove('hovered')
              },
            }
          }
        "
      >
        <img class="item__logo" src="@/assets/img/svg/CustomizedGeneration.svg" />
        <div class="item__name">Customized Generation</div>
      </div>

      <div
        class="item scribble"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                e.target.classList.add('hovered')
              },
              cancel: (e) => {
                e.target.classList.remove('hovered')
              },
            }
          }
        "
      >
        <img class="item__logo" src="@/assets/img/svg/Scribble.svg" />
        <div class="item__name">Scribble</div>
      </div>

      <div
        class="item edit"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                e.target.classList.add('hovered')
              },
              cancel: (e) => {
                e.target.classList.remove('hovered')
              },
            }
          }
        "
        @click="
          () => {
            router.push('/editor')
          }
        "
      >
        <img class="item__logo" src="@/assets/img/svg/edit.svg" />
        <div class="item__name">Edit</div>
      </div>

      <div
        class="item video"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                e.target.classList.add('hovered')
              },
              cancel: (e) => {
                e.target.classList.remove('hovered')
              },
            }
          }
        "
      >
        <img class="item__logo" src="@/assets/img/svg/video.svg" />
        <div class="item__name">Video Creation</div>
      </div>

      <div
        class="item play-list"
        v-hover.mouse="
          () => {
            return {
              start: (e) => {
                e.target.classList.add('hovered')
              },
              cancel: (e) => {
                e.target.classList.remove('hovered')
              },
            }
          }
        "
      >
        <img class="item__logo" src="@/assets/img/svg/playList.svg" />
        <div class="item__name">Playlist Creation</div>
      </div>

      <div class="separate">
        <div
          class="item gallery"
          v-hover.mouse="
            () => {
              return {
                start: (e) => {
                  e.target.classList.add('hovered')
                },
                cancel: (e) => {
                  e.target.classList.remove('hovered')
                },
              }
            }
          "
          @click="
            () => {
              router.push('/gallery')
            }
          "
        >
          <img class="item__logo" src="@/assets/img/svg/gallery.svg" />
          <div class="item__name">Gallery</div>
        </div>
      </div>

      <div class="title">Recent Designs</div>

      <el-scrollbar @touchmove.stop>
        <template v-for="session in sessions">
          <div
            class="item session"
            v-hover.mouse="
              () => {
                return {
                  start: (e) => {
                    e.target.classList.add('hovered')
                  },
                  cancel: (e) => {
                    e.target.classList.remove('hovered')
                  },
                }
              }
            "
            @click="
              () => {
                router.push({
                  path: '/session',
                  query: { sessionId: session.sessionId },
                })
              }
            "
          >
            <img class="item__logo" src="@/assets/img/svg/chatLogo.svg" />
            <div class="item__name">{{ session.sessionName }}</div>
          </div>
        </template>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, Ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Isession } from '@/types'
import { getSessionList } from '@/services/CreatorZone/session'

const router = useRouter()

const sessions = ref<Isession[]>([])

onMounted(async () => {
  const getSessionListRes = await getSessionList()

  if (getSessionListRes.success) {
    sessions.value = getSessionListRes.data
  } else {
    ElMessage({
      message: 'Failed to retrieve session list',
      type: 'error',
    })
  }
})

onUnmounted(() => {})
</script>

<style lang="less" scoped>
.home-nav {
  width: 100rem * (222 / 1100);
  height: 100%;
  background: rgba(255, 255, 255, 0.63);
  padding: 100rem * (16 / 1100) 100rem * (12 / 1100);

  .header {
    padding: 100rem * (8 / 1100) 0 100rem * (8 / 1100) 100rem * (12 / 1100);
    cursor: pointer;
    display: flex;

    &__logo {
      width: 100rem * (22 / 1100);
      margin-right: 100rem * (10 / 1100);
    }

    &__name {
      font-family: "Rookery New";
      font-size: 100rem * (18 / 1100);
      font-weight: 500;
      color: #0e131e;
    }
  }

  .body {
    margin-top: 100rem * (16 / 1100);
    height: calc(100% - 100rem * (60 / 1100));
    display: flex;
    flex-direction: column;

    .item {
      margin-top: 100rem * (8 / 1100);
      padding: 100rem * (8 / 1100) 0 100rem * (8 / 1100) 100rem * (12 / 1100);
      cursor: pointer;
      display: flex;
      align-items: center;

      &.hovered {
        background: rgba(0, 28, 59, 0.05);
        border-radius: 100rem * (6 / 1100);

        .item__name {
          font-weight: 600;
        }
      }

      &__logo {
        width: 100rem * (16 / 1100);
        height: 100rem * (16 / 1100);
        margin-right: 100rem * (8 / 1100);
      }

      &__name {
        font-family: "Rookery New";
        font-size: 100rem * (12 / 1100);
        font-weight: 400;
        color: #0e131e;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .chat {
      &.hovered {
        background: rgba(255, 255, 255, 0.4);
      }

      .item__name {
        font-weight: 600;
        color: #992e8a;
      }
    }

    .customized {
      margin-top: 100rem * (24 / 1100);
    }

    .separate {
      margin-top: 100rem * (8 / 1100);
      border: 100rem * (1 / 1100) solid rgba(120, 119, 119, 0.11);
      border-right: 0;
      border-left: 0;

      .item:first-child {
        width: 100%;
        margin: 100rem * (8 / 1100) 0;
      }
    }

    .title {
      margin-top: 100rem * (8 / 1100);
      font-family: "Rookery New";
      font-size: 100rem * (12 / 1100);
      font-weight: 600;
      color: rgba(14, 19, 30, 0.4);
      line-height: 100rem * (16 / 1100);
    }

    :deep(.el-scrollbar) {
      flex: 1;

      .session {
        .item__logo {
          width: 100rem * (22 / 1100);
          height: 100rem * (22 / 1100);
        }
      }
    }
  }
}
</style>
