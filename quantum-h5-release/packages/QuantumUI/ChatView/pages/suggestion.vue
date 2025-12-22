<template>
  <div class="suggestionWrap">
		<QIcons class="suggestLogo" size="48" name="PromptButton" />
		<div class="suggestText">
			<!-- <QIcons class="Flogo" name="Ficons" /> -->
			<div class="Ftext">
				{{geminiValue}}
			</div>
			<QIcons class="closeLogo" name="closeIcon" @click="closeSuggestion" />
			<QIcons class="sendLogo" name="sendIcon" />
		</div>
  </div>
</template>

<script setup lang="ts">
import { QIcons } from "../../index";
defineProps<{
  geminiValue:string;
}>();

const emit = defineEmits<{
  (e: "closeGeminiValue"): void;
}>();
const closeSuggestion = () => {
  emit("closeGeminiValue");
}

</script>

<style lang="less" scoped>
.suggestionWrap {
  display: flex;
  align-items: center;
}
.suggestLogo{
	width: 48px;
	height: 48px;
	margin-right: 12px;
}
.suggestText{
	max-width: 547px;
	height: 48px;
	border-radius: 24px;
	padding: 0 4px 0 12px;
	box-sizing: border-box;
	background: var(--Colors-Surfaces-Surface, #FFF);
	display: flex;
	justify-content: center;
	align-items: center;
}
.Flogo{
	width: 24px;
	height: 24px;
	margin: 8px 16px 8px 8px;
}
.Ftext{
	width: 399px;
	max-height: 40px;
	margin-right: 8px;
	/* Blazer Type/Body M */
	font-family: var(--Type-Style-Body-Font, "Rookery New");
	font-size: 14px;
	font-style: normal;
	font-weight: 700;
	line-height: 20px; /* 142.857% */
	letter-spacing: 0.25px;
	background: var(--Processing, radial-gradient(50% 50% at 50% 50%, var(--Colors-AI-Steps-Step-15, #5C8DFF) 0%, var(--Colors-Accents-AI-Accent, #855EE1) 100%));
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
  display: -webkit-box; /* 旧版 WebKit 内核的盒模型 */
  -webkit-box-orient: vertical; /* 垂直排列文本 */
  -webkit-line-clamp: 2; /* 限制显示的行数 */
  
  /* 溢出隐藏并显示省略号 */
  overflow: hidden; /* 溢出内容隐藏 */
  text-overflow: ellipsis; /* 溢出时显示省略号（配合 overflow 使用） */

}
.closeLogo{
	width: 24px;
	height: 24px;
	margin: 8px;
	cursor: pointer;
}
.sendLogo{
	width: 24px;
	height: 24px;
	margin: 8px;
	cursor: pointer;
}
</style>