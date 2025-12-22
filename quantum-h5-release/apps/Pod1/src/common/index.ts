import { reactive } from 'vue'

export const GlobalConfig = reactive({
  isEdge: false,
  edgeServer: '',
  emailUrl: '',
  videoUrl: 'http://47.104.166.168:9208/index.html',
  localPKBPath: '',
  kbFileServer: '',
  tokens: {
    access_token: '',
    refresh_token: '',
    lenovo_id: '',
    lenovo_username: ''
  }
})