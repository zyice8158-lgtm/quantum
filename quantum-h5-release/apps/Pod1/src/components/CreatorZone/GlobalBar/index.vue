<template>
  <div id="global-bar-9e31c7fa" class="global-bar" ref="globalBarRef">
    <div
      v-if="showHomeBtn"
      class="global-bar__home"
      @click="
        () => {
          router.push('/')
        }
      "
    >
      <img src="@/assets/img/svg/home.svg" />
    </div>

    <div
      v-if="showNewChatBtn"
      class="global-bar__new-chat"
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
            query: {},
          })
        }
      "
    >
      <img src="@/assets/img/svg/newChat.svg" />
      <div v-automation="'new_chat_title'">New chat</div>
    </div>

    <div class="global-bar__rest"></div>

    <div class="global-bar__menu" v-if="true">
      <div
        class="trigger"
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
            visible = !visible
          }
        "
      >
        <img src="@/assets/img/svg/user.svg" />
        <img
          src="@/assets/img/svg/arrow_drop_down.svg"
          :class="{
            rotate: visible,
          }"
        />
      </div>

      <div class="content" v-if="visible">
        <div class="phone">1234567890</div>

        <div
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
          Settings
        </div>
        <div
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
          Feedback
        </div>
        <div
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
              logout()
            }
          "
        >
          Log out
        </div>
      </div>
    </div>
    <div
      class="global-bar__login"
      v-else
      @click="
        () => {
          login()
        }
      "
    >
      Login
    </div>

    <div
      class="global-bar__minimizing"
      @click="
        () => {
          windowMin()
        }
      "
    >
      <img src="@/assets/img/svg/minimizing.svg" />
    </div>

    <div
      class="global-bar__maximizing"
      @click="
        () => {
          windowMax()
        }
      "
    >
      <img src="@/assets/img/svg/maximizing.svg" />
    </div>

    <div
      class="global-bar__close"
      @click="
        () => {
          windowClose()
        }
      "
    >
      <img src="@/assets/img/svg/close2.svg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, Ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { windowMin, windowMax, windowClose } from '@/services/CreatorZone/client'

const router = useRouter()

const props = defineProps({
  showHomeBtn: {
    type: Boolean,
    default: false,
  },
  showNewChatBtn: {
    type: Boolean,
    default: false,
  },
})

const globalBarRef = ref(null)

const visible = ref<Boolean>(false)

const login = () => {
  window.postMessage({
    cmd: 'lenovo.user.login',
  })
}

const logout = () => {
  window.postMessage({
    cmd: 'lenovo.user.logout',
  })
}

const Eclick = (e) => {
  if (!globalBarRef.value.querySelector('.trigger')?.contains(e.target)) {
    visible.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', Eclick)
})

onUnmounted(() => {
  window.removeEventListener('click', Eclick)
})
</script>

<style lang="less" scoped>
.global-bar {
  width: 100%;
  height: 100rem * (32 / 1100);
  display: flex;
  align-items: center;

  &__home {
    margin-right: 100rem * (8 / 1100);
    width: 100rem * (32 / 1100);
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    border: 100rem * (1 / 1100) solid;
    border-image-source: linear-gradient(
      180deg,
      rgba(207, 230, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.24) 100%
    );
    border-radius: 100rem * (999 / 1100);
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
    }
  }

  &__new-chat {
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    padding: 0 100rem * (16 / 1100);
    border: 100rem * (1 / 1100) solid;
    border-image-source: linear-gradient(
      180deg,
      rgba(207, 230, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.24) 100%
    );
    border-radius: 100rem * (999 / 1100);
    cursor: pointer;
    display: flex;
    align-items: center;

    img {
      margin-right: 100rem * (4 / 1100);
      width: 100rem * (16 / 1100);
      height: 100rem * (16 / 1100);
    }

    div {
      font-family: "Rookery New";
      font-size: 100rem * (12 / 1100);
      font-weight: 600;
      color: #6C43C6;
    }

    &.hovered {
      background: rgba(255, 255, 255, 0.5);
    }
  }

  &__rest {
    flex: 1;
  }

  &__login {
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    padding: 0 100rem * (16 / 1100);
    border: 100rem * (1 / 1100) solid;
    border-image-source: linear-gradient(
      180deg,
      rgba(207, 230, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.24) 100%
    );
    border-radius: 100rem * (99 / 1100);
    font-family: "Rookery New";
    font-size: 100rem * (12 / 1100);
    font-weight: 600;
    color: #0e131e;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  &__menu {
    height: 100%;
    position: relative;

    .trigger {
      height: 100%;
      background: rgba(255, 255, 255, 0.3);
      padding: 0 100rem * (16 / 1100);
      border: 100rem * (1 / 1100) solid;
      border-image-source: linear-gradient(
        180deg,
        rgba(207, 230, 255, 0.3) 0%,
        rgba(255, 255, 255, 0.24) 100%
      );
      border-radius: 100rem * (99 / 1100);
      cursor: pointer;
      display: flex;
      align-items: center;

      img {
        width: 100rem * (20 / 1100);
        height: 100rem * (20 / 1100);

        &.rotate {
          rotate: 180deg;
        }
      }

      &.hovered {
        background: rgba(255, 255, 255, 0.5);
      }
    }

    .content {
      position: absolute;
      top: calc(100% + 100rem * (8 / 1100));
      left: 0;
      z-index: 1;
      min-width: 100rem * (132 / 1100);
      background-color: #ffffff;
      padding: 100rem * (12 / 1100);
      border-radius: 100rem * (16 / 1100);
      box-shadow: 0px 2px 6px 2px #00000026;

      > div {
        padding: 100rem * (8 / 1100) 100rem * (4 / 1100);
        font-family: "Rookery New";
        font-size: 100rem * (12 / 1100);
        font-weight: 400;
        color: #3b3b3b;
        cursor: pointer;

        &.phone {
          cursor: default;
        }

        &.hovered {
          background: #001c3b0f;
          border-radius: 100rem * (6 / 1100);
          font-weight: 600;
        }
      }
    }
  }

  &__minimizing,
  &__maximizing,
  &__close {
    width: 100rem * (16 / 1100);
    height: 100rem * (16 / 1100);
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
    }
  }

  &__minimizing {
    margin-left: 100rem * (32 / 1100);
  }

  &__maximizing,
  &__close {
    margin-left: 100rem * (18 / 1100);
  }
}
</style>
