import { computed, defineComponent, reactive, Ref, ref, watch } from 'vue';
import { useLocale } from '@/hooks/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { Header } from '@/layouts/layout1/header';
import LayoutMenu, { LayoutMenuItem, MenuGroup, MenuItem, router2Menu } from '@/layouts/LayoutMenu';
import { GlobalStore, toggleSidebar } from '@/store/global';
import { isWebView } from '@/utils';
import { LScroll } from '@libs/p-comps/Scroll';
import { IconAbout, IconAccount, IconBack, IconCMU, IconConnector, IconDevices, IconEarth, IconFocusStar, IconFolder, IconHistory, IconLaunch, IconMic, IconNetwork, IconQuantumLogo, IconRecord, IconSyncData } from '@quantum/icons';
import { RouterView, useRoute, useRouter } from 'vue-router';
import SearchHeader from './comps/SearchHeader';



export default defineComponent({
  name: 'Settings',
  setup() {
    const { t, locale } = useLocale()
    const router = useRouter()
    const route = useRoute()
    router
    console.log(router.getRoutes());
    console.log(router);

    const historyPath = router.options.history.state.back as string
    const SettingMenu = computed(() => {



      return [
        {
          label: t('settings.personal.title'),
          items: [
            {
              title: t('settings.personal.account'), icon: IconAccount, route: {
                name: 'Personal', meta: { params: { anchor: 'account' } }
              },
            },
            // {
            //   title: t('settings.personal.devices'), icon: IconDevices,
            //   route: {
            //     name: 'Personal', meta: { params: { anchor: 'devices' } }
            //   },
            // },

          ]
        },
        {
          label: t('settings.general.title'),
          items: [
            {
              title: t('settings.general.language'), icon: IconEarth,
              route: {
                name: 'General', meta: {

                  params: {
                    anchor: 'language'
                  }
                }
              }
            },
            // {
            //   title: t('settings.general.recordings'), route: {
            //     name: 'General', meta: {

            //       params: {
            //         anchor: 'recordings'
            //       }
            //     }
            //   }, icon: IconRecord,
            // },
            // { title: t('settings.general.launchOptions'), icon: IconLaunch, route: { name: 'General', meta: { params: { anchor: 'launchOptions' } } } },
            { title: t('settings.general.voice'), icon: IconMic, route: { name: 'General', meta: { params: { anchor: 'voice' } } } },
          ]
        },
        {
          label: t('settings.dataControl.title'),
          items: [
            {
              title: t('settings.dataControl.syncData'), icon: IconSyncData,
              route: {
                name: 'DataControl', meta: {

                  params: {
                    anchor: 'syncData'
                  }
                }
              }
            },
            // {
            //   title: t('settings.dataControl.useOnAnyNetwork'), route: {
            //     name: 'DataControl', meta: {

            //       params: {
            //         anchor: 'useOnAnyNetwork'
            //       }
            //     }
            //   }, icon: IconNetwork,
            // },
            { title: t('settings.dataControl.chatHistory'), icon: IconHistory, route: { name: 'DataControl', meta: { params: { anchor: 'chatHistory' } } } },
            // { title: t('settings.dataControl.fileSavingPath'), icon: IconFolder, route: { name: 'DataControl', meta: { params: { anchor: 'fileSavingPath' } } } },
          ]
        },
        {
          label: t('settings.personalization.title'),
          items: [
            // {
            //   title: t('settings.personalization.personalizedContent'), icon: IconFocusStar,
            //   route: {
            //     name: 'Personalization', meta: {

            //       params: {
            //         anchor: 'personalizedContent'
            //       }
            //     }
            //   }
            // },
            // {
            //   title: t('settings.personalization.CMU'), route: {
            //     name: 'Personalization', meta: {

            //       params: {
            //         anchor: 'CMU'
            //       }
            //     }
            //   }, icon: IconCMU,
            // },
            { title: t('settings.personalization.connectors.title'), icon: IconConnector, route: { name: 'PersonalizationMain', meta: { params: { anchor: 'connectors' } } } },
            { title: t('settings.personalization.CMU'), icon: IconCMU, route: { name: 'PersonalizationMain', meta: { params: { anchor: 'cmu' } } } },

          ]
        },
        {
          label: t('settings.about.title'),
          items: [
            { title: t('settings.about.title'), icon: IconAbout, route: { name: 'About', meta: { params: { anchor: 'about' } } } },
            // { title: t('settings.personalization.CMU'), icon: IconCMU, route: { name: 'PersonalizationMain', meta: { params: { anchor: 'cmu' } } } },

          ]
        },
      ]
    })


    // Ref<(MenuItem | MenuGroup)[]> = ref()
    const currentDisplay = reactive({
      title: '',
      subTitle: '',
    })
    const handleBack = () => {
      router.push({ path: historyPath || '/quantum/chat' })
    }

    watch(() => route.path, () => {
      console.log(router, route);
      currentDisplay.title = t(route.meta?.title as string)
      currentDisplay.subTitle = t(route.meta?.subTitle as string)
    })
    return () => (

      <div class={["w-full h-full", {
        'p-[10px]': !isWebView
      }]}>
        <div
          class={[
            "flex h-[100vh] w-full relative acrylic-view acrylic-view-none rounded-[32px]",
            {
              "bg-gray-100 h-[calc(100vh-20px)] rounded-[32px] shadow-[0_0_10px_0_rgba(0,0,0,0.4)]": !isWebView,
            },
          ]}
        >
          <div class={["flex-none bg-[var(--color-surfaces-surface-blur)] flex flex-col overflow-auto rounded-l-[32px] pb-[4px] transition-width duration-300", GlobalStore.sidebar ? 'w-[260px]' : 'w-[88px]']}>
            <LScroll class="flex flex-auto flex-col overflow-auto">
              {/* Logo */}
              <div class="px-[29px] py-[26px] border-gray-200 flex-none flex items-center">
                <IconQuantumLogo class="text-[32px] flex-none" onClick={toggleSidebar} />
                {GlobalStore.sidebar ? <span class="text-[20px] font-semibold bg-gradient-to-r from-[#855EE1] to-[#5C8DFF] bg-clip-text text-transparent ml-[8px]">
                  Qira
                </span> : null}

              </div>
              <LayoutMenuItem
                onClick={handleBack}
                item={{
                  icon: IconBack,
                  title: t('settings.title'),
                }}
              />
              <LayoutMenu items={SettingMenu.value} />
            </LScroll>
          </div>
          <div class="flex-auto flex flex-col h-full  bg-[var(--color-window-bg)] rounded-tr-[32px] rounded-br-[32px]">
            <Header class="flex-none" />
            <div class="p-[8px_32px] flex flex-col h-[calc(100%-80px)]">
              <SearchHeader title={currentDisplay.title} subTitle={currentDisplay.subTitle}></SearchHeader>
              {/* <div class='overflow-auto'> */}
              <div class='overflow-auto flex-1'>
                <RouterView></RouterView>
              </div>


              {/*
              <h1 class="text-2xl font-bold mb-[8px]">{t('settings.title')}</h1>
              <div class="bg-white rounded-lg shadow p-[12px]">
                <h2 class="text-xl font-semibold mb-[8px]">{t('settings.languageSetting')}</h2>

                <div class="mb-[8px]">
                  <p class="text-gray-600 mb-[4px]">{t('layout.language')}: {locale()}</p>
                </div>

                <LanguageSwitcher />
            </div>*/}
            </div>
          </div>
        </div>

      </div >




    );
  }
});

