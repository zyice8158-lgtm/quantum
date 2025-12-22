import type { Locale } from '@/i18n'

// 定义类型
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
  
  export interface DefineDateTimeFormat {}
  
  export interface DefineNumberFormat {}
}

interface MessageSchema {
  common: {
    confirm: string
    cancel: string
    save: string
    delete: string
    edit: string
    add: string
    close: string
    submit: string
    reset: string
    search: string
    loading: string
    noData: string
    success: string
    error: string
    warning: string
  }
  chat: {
    title: string
    inputPlaceholder: string
    send: string
    clearHistory: string
    refresh: string
    refreshing: string
    newChat: string
    history: string
    relatedQuestions: string
    recommendations: string
    skills: string
    knowledgeBase: string
    sendMessageError: string
  }
  home: {
    welcome: string
    description: string
    getStarted: string
  }
  layout: {
    chats: string
    settings: string
    language: string
    theme: string
  }
  settings: {
    title: string
    languageSetting: string
    themeSetting: string
    darkMode: string
    lightMode: string
    systemMode: string
  }
}