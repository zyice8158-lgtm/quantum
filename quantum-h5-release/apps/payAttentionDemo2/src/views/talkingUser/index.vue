<template>
  <div class="talkUser">
		<div class="suggestWrap">
			<img src="@/assets/attention/recordClose.svg"
				alt=""
				class="closeLogo" />
			<div class="cardContainer">11111111</div>
			<div class="sayWrap">
				<div class="askContainer">
					<img src="@/assets/attention/MotoAILogoMark.svg"
							alt=""
							class="logoMark" />
					<el-input
						v-model="inputValue"
						placeholder="Ask Anything"
						@keyup.enter="handleKeyupEnter"
						ref="inputRef" :input-style="{ border: 'none', boxShadow: 'none' }"
						class="input"
					/>
					<img src="@/assets/attention/Add11.svg"
						alt=""
						class="addLogo" />
					<img src="@/assets/attention/Mic1.svg"
						alt=""
						class="micLogo" />
				</div>
				<img src="@/assets/attention/records.svg"
					alt=""
					class="recordLogo" />
				<img src="@/assets/attention/more.svg"
					alt=""
					class="recordLogo" />
			</div>
		</div>
		<div class="voiceBtn">
			<img src="@/assets/attention/audio01.svg"
				alt="" v-if="audioLogo"
				class="audioLogo"
				@click="handleVoice" />
			<img src="@/assets/attention/stopAudio.svg"
				alt="" v-else
				class="audioLogo"
				@click="handleVoice" />
			<img src="@/assets/attention/colp.svg"
				alt=""
				class="audioLogo" />
		</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const inputValue = ref('');
const audioLogo = ref(false);
const handleKeyupEnter = () => {
  if (inputValue.value) {
    // 处理输入值
    console.log(inputValue.value);
    // 清空输入框
    inputValue.value = '';
  }
}
const handleVoice = () => {
  audioLogo.value = !audioLogo.value;
}
</script>

<style src="./style.less" lang="less" scoped></style>