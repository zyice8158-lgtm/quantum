<template>
  <div id="editorBox"
       @focus="toSetEditorFocus(true);"
       @blur="toSetEditorFocus(false)">
    <p class="notesTitle">
      <span v-if="isBlankNote">{{ $t('learningZone.newNote') }}</span>
    </p>
    <!-- <div class="editorFileContent" v-if="titleCard=='listCard'">
      <div class="file-item"  v-for="(item, index) in editorFileData" :key="index">
        <div class="file-info">
          <div class="file-title">{{ item.noteTitle }}</div>
        </div>
      </div>
    </div> -->
    <!-- 录音组件 -->
    <Recording v-if="isRecording" />
    <div class="editorBox"
         @dragstart.stop="editorDragStart"
         @contextmenu="hideTargetBar">
      <Toolbar :editor="editorRef"
               :default-config="toolbarConfig"
               :mode="mode" />
      <Editor v-model="valueHtml"
              tabindex="1"
              id="EditorContent"
              role="presentation"
              aria-live="polite"
              :default-content="defaultContent"
              :default-config="editorConfig"
              :mode="mode"
              @custom-paste="customPaste"
              @on-created="handleCreated"
              @on-change="handleChange" />
    </div>
    <div class="placeholder-bottom"></div>
  </div>
</template>

<script lang="ts">
import { i18nChangeLanguage, IDomEditor } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
import {
  onBeforeUnmount,
  ref,
  shallowRef,
  onMounted,
  reactive,
  nextTick,
} from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { Boot } from '@wangeditor/editor'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { EDITOR_LIMIT } from './constants/appConstants.ts'
import './addI18nResource'
import Recording from '@/views/LearningZone/components/Recording/index.vue'
import { ChatEventBus } from '@libs/p-comps/ChatBaseComponent/types/AIServiceGateway'
import { LzBankKind, Card } from '@/types/lz'
import { addToFavorites, removeToFavorites } from '@/store/lz'
export default {
  components: {
    Editor,
    Toolbar,
    Recording,
  },
  props: {
    noteHtml: {
      type: String,
      default: '',
    },
    maxLength: {
      type: Number,
      default: EDITOR_LIMIT,
    },
    aiMode: {
      type: String,
      default: '',
    },
    noteState: {
      type: String,
      default: '',
    },
    noteTitle: {
      type: String,
      default: '',
    },
    titleCard: {
      type: String,
      default: '',
    },
  },
  emits: [
    'toSaveNote',
    'toOpenTemplate',
    'toJumpShare',
    'PageReport',
    'toSaveFile',
  ],
  setup(props, ctx) {
    window.ctx = ctx
    let needReport = true
    const $t = useI18n().t
    const route = useRoute()
    const isRecording = ref(
      route.query.isRecording == undefined ? false : route.query.isRecording
    )
    const isBlankNote = ref(
      route.query.isBlankNote == undefined ? false : route.query.isBlankNote
    )
    // 新建笔记时，添加到列表
    if (isBlankNote.value) {
      const card: Card = {
        title: $t('learningZone.newBlankNote'),
        description: $t('learningZone.createNewBlankNote'),
        createdDate: Date.now(), // mock，to delete
        type: LzBankKind.Notes,
        chatId: 'chat-blank-note-messages',
        chatMessageId: 'b8d5c085-1dc5-4435-9ec0-1384747a8741',
      }
      addToFavorites(card)
    }
    const recordData = ref(``)
    function editorDragStart(e) {
      e.preventDefault()
      window.resetEditor()
    }

    let debounceTimer = null
    let init = ref(true)

    const previewImgObject = reactive({})

    const editorFileData = ref([
      {
        noteTitle: 'Learning Zone Experience.pdf',
        noteType: 'PDF',
        fileSize: '2.5 MB',
        uploadTime: '2024-01-15',
        fileUrl: '/path/to/file.pdf',
      },
      {
        noteTitle: 'Math Homework.docx',
        noteType: 'DOCX',
        fileSize: '1.2 MB',
        uploadTime: '2024-01-10',
        fileUrl: '/path/to/file.docx',
      },
    ])

    function hideTargetBar(e?) {
      e?.preventDefault()
      const hoverBar = document.getElementsByClassName('w-e-hover-bar')[0]
      if (hoverBar) {
        hoverBar.classList.add('w-e-bar-hidden')
        hoverBar.classList.remove('w-e-bar-show')
      }
      const editorModalClass =
        document.getElementsByClassName('editorModalClass')
      if (editorModalClass) {
        for (const e of editorModalClass) {
          if (e) {
            e.classList.add('hideIt')
            e.style.display = 'none'
          }
        }
      }
    }

    const valueHtml = ref()
    const mode = 'simple'
    const editorRef = shallowRef()
    const defaultContent = reactive([
      {
        type: 'paragraph',
        children: [{ text: ``, fontFamily: 'SimSun', fontSize: '14px' }],
      },
    ])

    // 保留完整的 toolbarConfig 配置
    const toolbarConfig = ref({
      toolbarKeys: [
        'undo',
        'redo',
        'headerSelect',
        'fontFamily',
        'fontSize',
        'color',
        'bold',
        'italic',
        'through',
        'clearStyle',
        'bgColor',
        'lineHeight',
        'bulletedList',
        'numberedList',
        {
          key: 'group-more-justify',
          title: '',
          menuKeys: [
            'underline',
            'indent',
            'delIndent',
            'justifyLeft',
            'justifyRight',
            'justifyCenter',
            'justifyJustify',
            'blockquote',
            'todo',
          ],
        },
        '|',
        {
          key: 'group-more-export',
          title: '',
          menuKeys: ['exportWord', 'exportPDF'],
        },
      ],
      modalAppendToBody: false,
    })

    const editorConfig = {
      placeholder: 'Please enter content...',
      // maxLength: props.maxLength,
      autoFocus: true,
      MENU_CONF: {
        table: {
          row: 3,
          col: 3,
        },
        fontSize: {
          fontSizeList: [
            '12px',
            '14px',
            '16px',
            '18px',
            '20px',
            '24px',
            '28px',
            '32px',
            '36px',
          ],
        },
        lineHeight: {
          lineHeightList: ['1.25', '1.5', '1.75', '2.0', '2.5', '3.0'],
        },
        fontFamily: {
          fontFamilyList: [
            'SimHei',
            'FangSong',
            'KaiTi',
            'STFangsong',
            'STKaiti',
            'SimSun',
            'Microsoft YaHei',
            'Times New Roman',
            'Courier New',
          ],
        },
      },
      hoverbarKeys: {
        text: {
          menuKeys: [],
        },
        divider: {
          menuKeys: [],
        },
        image: {
          menuKeys: [],
        },
        link: {
          menuKeys: [],
        },
        pre: {
          menuKeys: [],
        },
        video: {
          menuKeys: [],
        },
      },
    }

    const customPaste = (_, event: ClipboardEvent) => {
      const text = event.clipboardData.getData('text/plain')
      const textLength = toGetTextLength()
      if (text.length + textLength >= EDITOR_LIMIT) {
        maxLengthFun()
        return false
      }
    }

    const maxLengthFun = () => {
      // 长度限制提示逻辑
    }

    let editorFocus = true
    const toSetEditorFocus = (flag: boolean) => {
      if (!editorFocus && flag) {
        editorRef.value.focus()
      }
      editorFocus = flag
    }

    // 处理工具栏下拉菜单的显示/隐藏
    const handleToolbarHover = (e) => {
      const target = e.target
      const isToolbarItem = target.closest('.w-e-bar-item')
      const isDropdownMenu = target.closest('.w-e-bar-item-menus-container')

      if (isToolbarItem || isDropdownMenu) {
        // 阻止隐藏工具栏下拉菜单
        e.stopPropagation()
      }
    }

    // 在 setup 函数外部定义模块变量，避免重复注册
    let isCustomModuleRegistered = false

    // ==== 修改1：修改 handleCreated 函数，设置光标到开头 ====
    const handleCreated = (editor) => {
      editorRef.value = Object.seal(editor)
      window.editorRef = editorRef.value
      console.log('editorRef.value', props.titleCard)

      // 设置带格式的 HTML 内容
      if (props.titleCard == 'listCard') {
        console.log('🚀 开始设置 listCard 内容')
        nextTick(() => {
          setTimeout(() => {
            forceFocusAndCursorToStart()
          }, 300)
        })
      }

      // 修复：添加检查，避免重复注册
      if (!isCustomModuleRegistered) {
        Boot.registerModule(customtoolBarModule)
        isCustomModuleRegistered = true
      }

      const editorBox = document.querySelector('.editorBox')
      const hidePanel = (event) => {
        if (event.key === 'Escape') {
          editor.hidePanelOrModal()
        }
      }
      editorBox.addEventListener('keydown', hidePanel)

      editor.on('modalOrPanelShow', (modalOrPanel) => {
        if (modalOrPanel.type !== 'modal') return
        const { $elem } = modalOrPanel
        const { top } = $elem[0].getBoundingClientRect()
        const windowHeight = document.documentElement.clientHeight
        const base = $elem[0].querySelector('.baseModalBox')
        if (base) {
          base.style.maxHeight = 'min(' + (windowHeight - top) + 'px ,40vh)'
        }
        $elem[0].style.maxHeight = 'min(' + (windowHeight - top) + 'px ,40vh)'
        $elem[0].classList.add('editorModalClass')
        $elem[0].classList.add('hideIt')
      })

      editor.handleTab = () => {
        return false
      }

      // ========== 核心修复：强制初始化下拉菜单 ==========
      const forceInitExportMenu = () => {
        const toolbar = document.querySelector('.w-e-toolbar')
        if (!toolbar) return

        const exportButton = toolbar.querySelector(
          '[data-menu-key="group-more-export"]'
        )
        if (!exportButton) {
          setTimeout(forceInitExportMenu, 100)
          return
        }

        // 关键修复：先移除已存在的事件监听，避免重复绑定
        const oldExportMenu = exportButton
          .closest('.w-e-bar-item')
          .querySelector('.w-e-bar-item-menus-container')
        if (oldExportMenu) {
          // 移除旧菜单的所有事件监听
          const clonedMenu = oldExportMenu.cloneNode(true)
          oldExportMenu.parentNode.replaceChild(clonedMenu, oldExportMenu)
        }

        // 重新创建并绑定新菜单
        let exportMenu = exportButton
          .closest('.w-e-bar-item')
          .querySelector('.w-e-bar-item-menus-container')
        if (!exportMenu) {
          // 创建菜单容器（与之前相同）
          exportMenu = document.createElement('div')
          exportMenu.className = 'w-e-bar-item-menus-container'
          exportMenu.style.position = 'absolute'
          exportMenu.style.top = '100%'
          exportMenu.style.left = '0'
          exportMenu.style.zIndex = '100'
          exportMenu.style.backgroundColor = '#fff'
          exportMenu.style.border = '1px solid #eee'
          exportMenu.style.padding = '5px 0'
          exportMenu.style.display = 'none'
          exportButton.closest('.w-e-bar-item').appendChild(exportMenu)

          // 添加导出选项（与之前相同）
          const exportWordItem = document.createElement('div')
          exportWordItem.className = 'w-e-bar-item-menu'
          exportWordItem.dataset.menuKey = 'exportWord'
          exportWordItem.textContent = '导出Word'
          exportMenu.appendChild(exportWordItem)

          const exportPDFItem = document.createElement('div')
          exportPDFItem.className = 'w-e-bar-item-menu'
          exportPDFItem.dataset.menuKey = 'exportPDF'
          exportPDFItem.textContent = '导出PDF'
          exportMenu.appendChild(exportPDFItem)
        }

        // 绑定事件处理函数（使用命名函数便于解绑）
        const handleMouseEnter = () => {
          const text = editor.getText().trim()
          if (text) {
            exportMenu.style.display = 'block'
            exportMenu.classList.remove('hideIt')
          }
        }

        const handleMouseLeave = () => {
          setTimeout(() => {
            if (!exportMenu.matches(':hover')) {
              exportMenu.style.display = 'none'
              exportMenu.classList.add('hideIt')
            }
          }, 150)
        }

        const handleClick = (e) => {
          e.stopPropagation()
          const text = editor.getText().trim()
          if (text) {
            const isHidden = exportMenu.style.display === 'none'
            exportMenu.style.display = isHidden ? 'block' : 'none'
          }
        }

        // 先移除可能存在的旧事件监听，再添加新的
        exportButton.removeEventListener('mouseenter', handleMouseEnter)
        exportButton.removeEventListener('mouseleave', handleMouseLeave)
        exportButton.removeEventListener('click', handleClick)

        exportButton.addEventListener('mouseenter', handleMouseEnter)
        exportButton.addEventListener('mouseleave', handleMouseLeave)
        exportButton.addEventListener('click', handleClick)

        // 菜单自身的事件
        exportMenu.removeEventListener('mouseenter', handleMouseEnter)
        exportMenu.removeEventListener('mouseleave', handleMouseLeave)
        exportMenu.addEventListener('mouseenter', handleMouseEnter)
        exportMenu.addEventListener('mouseleave', handleMouseLeave)
      }

      // 同时修改 onBeforeUnmount 生命周期钩子，确保完全清理
      onBeforeUnmount(() => {
        // 其他清理逻辑...

        // 额外清理导出菜单相关事件
        const exportButton = document.querySelector(
          '[data-menu-key="group-more-export"]'
        )
        if (exportButton) {
          const exportMenu = exportButton
            .closest('.w-e-bar-item')
            .querySelector('.w-e-bar-item-menus-container')
          if (exportMenu) {
            // 移除所有事件监听
            const clone = exportButton.cloneNode(true)
            exportButton.parentNode.replaceChild(clone, exportButton)

            // 移除菜单元素
            exportMenu.remove()
          }
        }
      })

      // ========== 初始化触发 ==========
      nextTick(() => {
        // 立即初始化一次
        forceInitExportMenu()

        // 监听编辑器内容变化，实时触发菜单状态更新
        editor.on('change', () => {
          const text = editor.getText().trim()
          const exportButton = document.querySelector(
            '[data-menu-key="group-more-export"]'
          )
          if (exportButton) {
            // 启用/禁用按钮
            exportButton.disabled = !text
            // 内容非空时强制刷新菜单
            if (text) {
              forceInitExportMenu()
            }
          }
        })
      })
    }

    // ==== 修改3：新增设置光标到开头的函数 ====
    function forceFocusAndCursorToStart() {
      if (!editorRef.value) {
        console.warn('❌ 编辑器实例不存在，无法设置光标')
        return
      }

      console.log('🎯 开始强制设置光标到文档开头 (0,0)')

      try {
        // 方法1: 先确保编辑器获得焦点
        const editorElement = document.getElementById('EditorContent')
        if (editorElement) {
          editorElement.focus({ preventScroll: true })
          console.log('✅ 编辑器元素获得焦点')
        }

        // 方法2: 使用编辑器的 focus 方法
        editorRef.value.focus(true)
        console.log('✅ 编辑器实例获得焦点')

        // 方法3: 使用 moveToStart 方法移动到开头
        editorRef.value.moveToStart()
        console.log('✅ 使用 moveToStart 设置光标到开头')

        // 方法4: 使用 select 方法精确定位到 (0,0)
        editorRef.value.select({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        })
        console.log('✅ 使用 select 方法精确定位到 (0,0)')

        // 方法5: 使用 moveReverse 移动到开头
        const text = editorRef.value.getText()
        if (text && text.length > 0) {
          editorRef.value.moveReverse(text.length)
          console.log('✅ 使用 moveReverse 移动到开头')
        }

        console.log('🎉 光标设置到开头流程完成')
      } catch (error) {
        console.error('❌ 设置光标到开头失败:', error)

        // 备用方案：使用 DOM 操作
        setTimeout(() => {
          try {
            const editorContent = document.querySelector(
              '#EditorContent .w-e-text-container'
            )
            if (editorContent) {
              editorContent.focus()

              // 创建 range 和 selection
              const range = document.createRange()
              const selection = window.getSelection()

              // 找到第一个文本节点
              const walker = document.createTreeWalker(
                editorContent,
                NodeFilter.SHOW_TEXT,
                null,
                false
              )

              const firstNode = walker.nextNode()
              if (firstNode) {
                range.setStart(firstNode, 0)
                range.setEnd(firstNode, 0)
                range.collapse(true)

                selection.removeAllRanges()
                selection.addRange(range)
                console.log('✅ 使用 DOM 方式设置光标到开头成功')
              }
            }
          } catch (domError) {
            console.error('❌ DOM 方式也失败:', domError)
          }
        }, 200)
      }
    }

    // ==== 修改4：更新 removeCursorToEnd 函数为 removeCursorToStart ====
    function removeCursorToStart() {
      if (!editorRef.value) return

      try {
        editorRef.value.focus(true)
        editorRef.value.moveToStart()
        editorRef.value.select({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        })
      } catch (error) {
        console.log('设置光标到开头失败:', error)
      }
    }

    // ==== 修改5：保留原来的 removeCursorToEnd 但重命名为 removeCursorToStart ====
    function removeCursorToEnd() {
      if (!editorRef.value) return

      try {
        editorRef.value.focus(true)
        editorRef.value.moveToEnd()
      } catch (error) {
        console.log('设置光标到末尾失败:', error)
      }
    }

    function toGetTextLength() {
      let text = getTextForEditor() ?? ''
      if (text) {
        text = text.replace(/\n/g, '')
      }
      const textLength = text.length ?? 0
      return textLength
    }

    function toHandelTextLength() {
      const textLength = toGetTextLength()
      if (textLength === EDITOR_LIMIT) {
        maxLengthFun()
        editorRef.value.deleteBackward()
      }
    }

    const handleChange = () => {
      clearTimeout(debounceTimer)
      toHandelTextLength()
      debounceTimer = setTimeout(() => {
        if (props.noteHtml === getHtmlForEditor()) {
          return
        }
        if (init.value) {
          init.value = false
          return
        }
        ctx.emit('toSaveNote', {
          text: getTextForEditor(),
          html: getHtmlForEditor(),
        })
      }, 1000)
    }

    function clearDebounceTimer() {
      clearTimeout(debounceTimer)
    }

    // 保留导出功能相关代码
    class MyBarButtonMenu {
      constructor(title = '', fun, svg = '') {
        this.title = title
        this.tag = 'button'
        this.iconSvg = svg
        this.fun = fun
      }

      getValue(editor) {
        return false
      }

      isActive(editor) {
        return false
      }

      isDisabled(editor) {
        const text = editor.getText().trim()
        return !text
      }

      exec(editor, value) {
        this.fun(editor)
      }
    }

    // 导出 Word 文档
    function exportWordFun(editor) {
      console.log('exportWordFun clicked')
      // 导出逻辑...
    }

    // 导出 PDF 文档
    function exportPDFFun(editor) {
      console.log('exportPDFFun clicked')
      // 导出逻辑...
    }

    const wordSvg = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" rx="6.66667" fill="#3872FC"/>
    <path d="M13.2298 7.6665L11.9974 12.2886H10.9023L10.1145 9.27485C10.0728 9.11173 10.0479 8.94164 10.0399 8.76459H10.028C10.0081 8.97148 9.98025 9.14157 9.94444 9.27485L9.13878 12.2886H8.0019L6.76953 7.6665H7.84972L8.53602 10.7996C8.56586 10.9369 8.58675 11.11 8.59869 11.3188H8.61957C8.62952 11.1557 8.66036 10.9777 8.71208 10.7847 L9.57145 7.6665H10.6188L11.4006 10.8235C11.4324 10.9488 11.4573 11.112 11.4752 11.3129H11.4901C11.4981 11.1398 11.521 10.9707 11.5588 10.8056L12.2301 7.6665H13.2298Z" fill="white"/>
    <rect width="20" height="20" rx="6.66667" fill="#3872FC"/>
    <path d="M15 6.5L13.0924 13.5H11.3972L10.1778 8.93577C10.1132 8.68872 10.0747 8.43114 10.0624 8.16301H10.0439C10.0131 8.47633 9.96998 8.73391 9.91455 8.93577L8.66744 13.5H6.90762L5 6.5H6.67206L7.73441 11.245C7.7806 11.4529 7.81293 11.715 7.83141 12.0313H7.86374C7.87914 11.7843 7.92687 11.5146 8.00693 11.2224L9.33718 6.5H10.9584L12.1686 11.2811C12.2179 11.4709 12.2564 11.718 12.2841 12.0223H12.3072C12.3195 11.7602 12.3549 11.5041 12.4134 11.254L13.4527 6.5H15Z" fill="white"/>
    </svg>`

    const PDFSvg = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" rx="6.66667" fill="#FD5454"/>
    <path d="M4.83607 7.07576C5.33868 7.07576 5.76411 7.15918 6.11219 7.32715C6.46107 7.48949 6.71247 7.72172 6.86622 8.02497C7.02624 8.32823 7.07724 8.68221 7.0202 9.08805C6.96317 9.49389 6.81251 9.849 6.56733 10.1517C6.32842 10.4544 6.01127 10.69 5.61597 10.858C5.22146 11.0203 4.77291 11.1015 4.27030 11.1015H3.49959L3.23041 13.0168H1.82902L2.66398 7.07576H4.83607ZM4.27863 9.93242C4.61731 9.93242 4.90249 9.8676 5.13424 9.73739C5.36534 9.60775 5.50220 9.3913 5.54482 9.08805C5.58665 8.79043 5.50739 8.5768 5.30703 8.44716C5.11316 8.31188 4.84945 8.24424 4.51589 8.24424H3.90172L3.66446 9.93242H4.27863ZM10.2146 7.07520C10.7997 7.07520 11.3133 7.19187 11.7558 7.42467C12.1913 7.64968 12.5317 8.00512 12.7352 8.44716C12.9517 8.89077 13.0161 9.42118 12.9294 10.0378C12.8427 10.6550 12.6289 11.1877 12.2869 11.6369C11.9579 12.0802 11.5177 12.438 11.0189 12.6679C10.5161 12.9007 9.96981 13.0168 9.37954 13.0168H7.21599L8.05095 7.07576L10.2146 7.07520ZM9.38845 11.8478C9.98384 11.8478 10.4567 11.6911 10.8070 11.3771C11.1568 11.0631 11.3727 10.6167 11.4540 10.0378C11.5346 9.46458 11.4412 9.02323 11.1732 8.71490C10.9111 8.40094 10.4852 8.24424 9.89489 8.24424H9.28812L8.78168 11.8478H9.38845ZM14.2542 7.07520H18.2706L18.1006 8.28482H15.4862L15.3037 9.58351H17.6477L17.4788 10.7847H15.1349L14.8212 13.0168H13.4192L14.2542 7.07520Z" fill="white"/>
    </svg>`

    const toolbarMenu1 = {
      key: 'exportWord',
      factory() {
        return new MyBarButtonMenu(
          $t('LZ_Notes_Button_Word'),
          exportWordFun,
          wordSvg
        )
      },
    }

    const toolbarMenu2 = {
      key: 'exportPDF',
      factory() {
        return new MyBarButtonMenu(
          $t('LZ_Notes_Button_PDF'),
          exportPDFFun,
          PDFSvg
        )
      },
    }

    const customtoolBarModule = {
      menus: [toolbarMenu1, toolbarMenu2],
    }

    // 保留编辑器操作方法
    const addTextToEditor = (text) => {
      editorRef.value.focus()
      removeCursorToStart() // 修改为设置光标到开头
      editorRef.value.insertText(text)
    }

    const addHtmlToEditor = (html) => {
      editorRef.value.dangerouslyInsertHtml(html)
    }

    const resetHtmlToEditor = (html, type) => {
      editorRef.value.dangerouslyInsertHtml(html)
      removeCursorToStart() // 修改为设置光标到开头
    }

    function toControlDisable(flag) {
      if (flag) {
        editorRef.value?.focus()
        editorRef.value?.disable()
        removeCursorToStart() // 修改为设置光标到开头
      } else {
        editorRef.value?.enable()
      }
    }

    const getTextForEditor = () => {
      const text = editorRef.value.getText()
      return text
    }

    const getHtmlForEditor = (flag = false) => {
      const html = editorRef.value.getHtml()
      return html
    }

    const resetTextToEditor = (text) => {
      editorRef.value.insertText(text)
    }

    function removeCursorToHead() {
      const text = editorRef.value.getText()
      editorRef.value.moveReverse(text.length)
    }

    // 修改现有的 outSideCancel 方法
    const outSideCancel = (e) => {
      const hoverBar = document.querySelector('.w-e-bar.w-e-hover-bar')
      const editorModal = document.querySelector('.w-e-modal.editorModalClass')
      const dropdownMenus = document.querySelectorAll(
        '.w-e-bar-item-menus-container'
      )

      // 检查点击是否在工具栏相关元素内
      const isInDropdownMenu = e.target.closest('.w-e-bar-item-menus-container')
      const isInToolbarItem = e.target.closest('.w-e-bar-item')
      const isInToolbar = e.target.closest('.w-e-toolbar')

      // 隐藏悬浮工具栏（除非在工具栏区域内）
      if (hoverBar && !hoverBar.contains(e.target) && !isInToolbar) {
        hoverBar.classList.add('w-e-bar-hidden')
        hoverBar.classList.remove('w-e-bar-show')
      }

      // 隐藏编辑器模态框（除非在工具栏或下拉菜单内）
      if (
        editorModal &&
        !editorModal.contains(e.target) &&
        !isInDropdownMenu &&
        !isInToolbar
      ) {
        if (!editorModal.classList.contains('hideIt')) {
          editorModal.classList.add('hideIt')
          editorModal.style.display = 'none'
        }
      }

      // 处理工具栏下拉菜单：只有点击完全外部区域才隐藏
      dropdownMenus.forEach((menu) => {
        editorBox
        if (menu && !menu.contains(e.target) && !isInToolbarItem) {
          menu.style.display = 'none'
          menu.classList.add('hideIt')
        }
      })
    }
    const handleData = (data) => {
      console.log('----recording数据123----：', data)
      // recordData.value = `<h3><span style=\"color:#079992\">📚 Justice and Moral Reasoning</span></h3>\n<p><span>🎓 Core Theme: To introduce the complexities of moral philosophy through thought experiments and real-world cases, highlighting the contrast between consequentialist and categorical moral reasoning.</span></p>\n<h4>🗝️ <span style=\"color:#079992;\">Key Concepts</span></h4>\n<h5>📖 Important Definitions</h5>\n<p>Consequentialist Moral Reasoning: Locates morality in the consequences of an act, focusing on the state of the world that will result. → <span style=\"color:#8e44ad\">(Example: Utilitarianism, where the greatest good for the greatest number is sought.)</span></p>\n<p>Categorical Moral Reasoning: Locates morality in absolute moral requirements, duties, and rights, regardless of consequences. → <span style=\"color:#8e44ad\">(Example: The belief that certain acts are inherently wrong, like murder, regardless of outcome.)</span></p>\n<p>Utility: The balance of pleasure over pain, or happiness over suffering. → <span style=\"color:#8e44ad\">(Central to utilitarian philosophy, where the goal is to maximize overall utility.)</span></p>\n<h5>💡 Core Points</h5>\n<p>The Trolley Problem: A thought experiment where one must choose between saving five lives by sacrificing one, exploring the tension between consequentialist and categorical ethics. → <span style=\"color:#8e44ad\">(Highlights our intuitive moral judgments and their underlying principles.)</span></p>\n<p>The Fat Man Case: A variation of the trolley problem where direct intervention (pushing a fat man) to save five lives feels more morally wrong to many, despite the same consequentialist outcome. → <span style=\"color:#8e44ad\">(Reveals the significance of active versus passive involvement and the intrinsic quality of an act.)</span></p>\n<p>The Doctor's Dilemma: A hypothetical where a doctor can save five patients by letting one die, or sacrifice one healthy person for five organ transplants. → <span style=\"color:#8e44ad\">(Further tests the limits of consequentialist reasoning and highlights the importance of individual rights and consent.)</span></p>\n<p>The Queen v. Dudley and Stevens: A real-life legal case involving cannibalism at sea to survive, illustrating the defense of necessity and the challenges of applying utilitarian principles to extreme situations. → <span style=\"color:#8e44ad\">(Demonstrates how legal and moral judgments can diverge and the role of consent in moral justification.)</span></p>\n<p>The Risks of Philosophy: Engaging with moral philosophy can be unsettling, challenging familiar assumptions and potentially making one a \"worse citizen\" before becoming a better one. → <span style=\"color:#8e44ad\">(Encourages critical self-reflection and a willingness to question deeply held beliefs.)</span></p>\n<h4>📝 <span style=\"color:#079992;\">Action List</span></h4>\n<h5>✅ To-Do Items</h5>\n<p>□ Read Jeremy Bentham's and John Stuart Mill's works on Utilitarianism. → <span style=\"color:#8e44ad\">(Understand the foundational texts of consequentialist moral reasoning.)</span></p>\n<p>□ Read Immanuel Kant's philosophy on categorical imperatives. → <span style=\"color:#8e44ad\">(Explore the primary counterpoint to utilitarianism in moral philosophy.)</span></p>\n<h5>🤔 Deep Thinking</h5>\n<p>❓ Why does direct action (pushing the fat man) feel more morally reprehensible than indirect action (pulling a lever), even if the outcome (one death, five saved) is the same? → <span style=\"color:#8e44ad\">(Consider the concept of agency, responsibility, and the perceived \"intrinsic wrongness\" of an act.)</span></p>\n<p>❓ How does the concept of consent change the moral calculus in dilemmas like the lifeboat or organ transplant scenarios? What are the limits of consent? → <span style=\"color:#8e44ad\">(Reflect on individual autonomy, coercion, and the idea of non-transferable rights.)</span></p>\n<p>⚡ How do we reconcile the intuitive appeal of \"the greatest good for the greatest number\" with the discomfort many feel when it requires sacrificing an innocent individual? → <span style=\"color:#8e44ad\">(Explore the ethical challenges of balancing collective welfare with individual rights.)</span></p>\n<h4>🔍 <span style=\"color:#079992;\">Terminology Analysis</span></h4>\n<table>\n  <tr><td><strong>Term/Concept</strong></td><td><strong>Definition/Explanation</strong></td><td><strong>Usage Scenario</strong></td></tr>\n  <tr><td>Consequentialist Moral Reasoning</td><td>Moral reasoning that judges the morality of an action based on its outcomes or consequences.</td><td>Deciding to turn the trolley to save five people at the cost of one.</td></tr>\n  <tr><td>Categorical Moral Reasoning</td><td>Moral reasoning that judges the morality of an action based on absolute moral duties, rules, or rights, regardless of consequences.</td><td>Believing that killing an innocent person is always wrong, even if it saves more lives.</td></tr>\n  <tr><td>Utilitarianism</td><td>A consequentialist ethical theory that advocates actions that maximize overall happiness and well-being for the greatest number of people.</td><td>Jeremy Bentham's philosophy suggesting laws should aim for the greatest good for the greatest number.</td></tr>\n  <tr><td>The Trolley Problem</td><td>A thought experiment in ethics involving a runaway trolley and the choice between two bad outcomes, typically sacrificing one person to save five.</td><td>Used to illustrate the conflict between consequentialist and categorical moral principles.</td></tr>\n  <tr><td>Consent</td><td>Permission for something to happen or agreement to do something. In ethics, often a key factor in justifying actions that affect an individual's autonomy.</td><td>Discussing whether Parker's agreement to be sacrificed would make the act morally permissible in the lifeboat case.</td></tr>\n  <tr><td>Skepticism (in philosophy)</td><td>The view that it is impossible to know anything for certain, or that definitive moral answers are unobtainable.</td><td>The evasion of moral reflection by claiming that fundamental questions have no definitive answers.</td></tr>\n</table>\n<h4>⚖️ <span style=\"color:#079992;\">Comparative Analysis</span></h4>\n<table>\n  <tr><td><strong>Comparison Dimension</strong></td><td><strong>Consequentialist Reasoning</strong></td><td><strong>Categorical Reasoning</strong></td><td><strong>Key Differences</strong></td></tr>\n  <tr><td>Basis of Morality</td><td>Outcomes, results, state of the world post-action</td><td>Intrinsic quality of the act, duties, rights, regardless of outcome</td><td>Focus on future effects vs. inherent rightness/wrongness of the action itself</td></tr>\n  <tr><td>Trolley Problem (Initial)</td><td>Favors turning the trolley to save five lives (maximizes utility)</td><td>Hesitates to turn, as it involves actively choosing to kill, or may view sacrificing an individual as inherently wrong</td><td>\"Greater good\" calculation vs. \"murder is murder\" principle</td></tr>\n  <tr><td>Fat Man Case</td><td>Still points to pushing the man to save five (same outcome)</td><td>Strongly opposes pushing, as it's a direct act of murder, violating intrinsic rights</td><td>Highlights the discomfort with direct action and individual agency in causing harm, even for a better outcome</td></tr>\n  <tr><td>Role of Individual Rights</td><td>Can be overridden if it serves the greater good</td><td>Are considered fundamental and often absolute, not to be violated</td><td>Individual well-being as a means to collective good vs. an end in itself</td></tr>\n</table>`;
      // console.log("----stoprecording数据123----：", data,recordData.value);
      // nextTick(() => {
      // if (editorRef.value) {
      //     editorRef.value.setHtml(recordData.value);
      //   }
      // });
    }
    // 在 onMounted 中添加事件监听
    onMounted(() => {
      document.addEventListener('mousedown', outSideCancel)

      // 添加鼠标移动事件监听，处理工具栏悬停
      const editorBox = document.querySelector('.editorBox')
      if (editorBox) {
        editorBox.addEventListener('mousemove', handleToolbarHover)
      }

      const lang = useI18n().locale.value
      i18nChangeLanguage(lang)
      nextTick(() => {
        window.addTextToEditor = addTextToEditor
      })
      ChatEventBus.on('openLZRecordNote', handleData)
    })

    // 在 onBeforeUnmount 中移除事件监听
    onBeforeUnmount(() => {
      ChatEventBus.clear('openLZRecordNote')
      document.removeEventListener('mousedown', outSideCancel)

      const editorBox = document.querySelector('.editorBox')
      if (editorBox) {
        editorBox.removeEventListener('mousemove', handleToolbarHover)
      }

      // 移除按钮的事件监听
      const justifyButton = document.querySelector(
        '[data-menu-key="group-more-justify"]'
      )
      const exportButton = document.querySelector(
        '[data-menu-key="group-more-export"]'
      )

      if (justifyButton) {
        const justifyMenu = justifyButton
          .closest('.w-e-bar-item')
          .querySelector('.w-e-bar-item-menus-container')
        if (justifyMenu) {
          justifyButton.removeEventListener('mouseenter', () => {})
          justifyButton.removeEventListener('mouseleave', () => {})
          justifyMenu.removeEventListener('mouseenter', () => {})
          justifyMenu.removeEventListener('mouseleave', () => {})
        }
      }

      if (exportButton) {
        const exportMenu = exportButton
          .closest('.w-e-bar-item')
          .querySelector('.w-e-bar-item-menus-container')
        if (exportMenu) {
          exportButton.removeEventListener('mouseenter', () => {})
          exportButton.removeEventListener('mouseleave', () => {})
          exportMenu.removeEventListener('mouseenter', () => {})
          exportMenu.removeEventListener('mouseleave', () => {})
        }
      }

      window.ctx = null
      const editor = editorRef.value
      if (editor === null) return
      editor.destroy()
    })

    return {
      recordData,
      Recording,
      isBlankNote,
      isRecording,
      editorFileData,
      editorDragStart,
      clearDebounceTimer,
      editorRef,
      mode,
      defaultContent,
      valueHtml,
      toolbarConfig,
      editorConfig,
      handleCreated,
      handleChange,
      customPaste,
      addTextToEditor,
      getTextForEditor,
      addHtmlToEditor,
      getHtmlForEditor,
      resetTextToEditor,
      resetHtmlToEditor,
      toSetEditorFocus,
      toControlDisable,
      previewImgObject,
      hideTargetBar,
      removeCursorToHead,
      removeCursorToStart, // 新增导出
    }
  },
}
</script>

<style scoped lang="less" src="./index.less"></style>
