import { useEventBus } from "@quantum/use";
import { reactive } from "vue";

export const oobeEventBus = useEventBus();

export type AppRoute = "OOBE" | "Chat";
export enum PanelStep {
  Splash = "Splash",
  Permissions = "Permissions",
  BarLoading = "BarLoading",
  LanguageSettings = "LanguageSettings",
  LoginText = "LoginText",
  Login = "Login",
  QtSettings = "QtSettings",
  Preview = "Preview",
  Start = "Start",
  StartQiraTour = "startQiraTour",
  LenovoIdForSmartConnect = "lenovoIdForSmartConnect",
}

export interface QtOption {
  key: "autoSummary" | "autoSave" | "voicePlay" | "highContrast" | "pinBar";
  value: boolean;
}
export interface OobeSnapshot {
  route: AppRoute;
  step: PanelStep;
  language: string;
  voiceEnabled: boolean;
  loginOk: boolean;
  previewPageName?: string;
}

const SUPPORTED_LANGS = ["zh-CN", "en-US"] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const ORDER: ReadonlyArray<PanelStep> = [
  PanelStep.Permissions,
  PanelStep.BarLoading,
  PanelStep.LanguageSettings,
  PanelStep.LoginText,
  PanelStep.Login,
  PanelStep.QtSettings,
  PanelStep.Preview,
  PanelStep.Start,
  PanelStep.StartQiraTour,
  PanelStep.LenovoIdForSmartConnect,
];

export default class OobeState {
  snap = reactive<OobeSnapshot>({
    route: "OOBE",
    step: PanelStep.Splash,
    language: "zh-CN",
    voiceEnabled: false,
    loginOk: false,
    previewPageName: "Chat",
  });

  get snapshot(): Readonly<OobeSnapshot> { return this.snap; }
  get supportedLanguages(): ReadonlyArray<SupportedLang> { return SUPPORTED_LANGS; }

  // —— 流转 —— //
  onSplashDone(): void {
    console.log("onSplashDone", this.snap.step);
    if (this.snap.step !== PanelStep.Splash) return;
    this.setStep(PanelStep.BarLoading);
  }
  next(): void {
    if (this.snap.route !== "OOBE") return;
    if (this.snap.step === PanelStep.Login && !this.snap.loginOk) return;
    if (this.snap.step === PanelStep.Start) { this.finish(); return; }
    const idx = ORDER.indexOf(this.snap.step);
    const nextStep = ORDER[idx + 1] ?? PanelStep.Start;
    this.setStep(nextStep);
  }
  prev(): void {
    if (this.snap.route !== "OOBE") return;
    const idx = ORDER.indexOf(this.snap.step);
    const prevStep = idx > 0 ? ORDER[idx - 1] : PanelStep.Permissions;
    this.setStep(prevStep);
  }
  finish(): void {
    this.snap.route = "Chat";
    this.snap.step = PanelStep.Start;
    oobeEventBus.emit("oobe:finished");
    oobeEventBus.emit("oobe:state", this.snap);
  }

  // —— 写入 —— //
  setLanguage(lang: SupportedLang): void {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    this.snap.language = lang;
    oobeEventBus.emit("oobe:pref", { language: lang });
    oobeEventBus.emit("oobe:state", this.snap);
  }
  setVoiceEnabled(enabled: boolean): void {
    this.snap.voiceEnabled = enabled;
    oobeEventBus.emit("oobe:pref", { voiceEnabled: enabled });
    oobeEventBus.emit("oobe:state", this.snap);
  }
  setLoginResult(ok: boolean): void {
    this.snap.loginOk = ok;
    oobeEventBus.emit("oobe:login-updated", ok);
    oobeEventBus.emit("oobe:state", this.snap);
  }

  setStep(step: PanelStep): void {
    this.snap.step = step;
    oobeEventBus.emit("oobe:state", this.snap);
    console.log("setStep", this.snap);
  }
}
