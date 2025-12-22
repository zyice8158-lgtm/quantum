<template>
    <component :is="displayIconComponent" :style="{width: iconSize + 'px', height: iconSize + 'px'}"/>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import { IconFileExcel, IconFileWord, 
    IconFilePpt, IconFilePdf, 
    IconFileZipped, IconFileUnknown, 
    IconFileTxt, IconFileAPK, IconFileMusic,
    IconFileFolder } from '@quantum/icons';
const props = withDefaults(defineProps<{ iconType: string; iconSize?: number; }>(), {
    iconType: '.jpg',
    iconSize: 15,
    iconSuffixType: 'default',
});
console.log('iconType---------', props.iconType);
const IconFileMap: Record<string, {
    icon: any,
    suffix?: string[],
}> = {
    excel: {
        icon: IconFileExcel,
        suffix: ['.xls', '.xlsx', '.csv', '.tsv'],
    },
    word: {
        icon: IconFileWord,
        suffix: ['.doc', '.docx'],
    },
    ppt: {
        icon: IconFilePpt,
        suffix: ['.ppt', '.pptx'],
    },
    pdf: {
        icon: IconFilePdf,
        suffix: ['.pdf'],
    },
    zipped: {
        icon: IconFileZipped,
        suffix: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.zipx', '.zipx', '.tar.gz', '.tar.bz2', '.tar.xz', '.tar.7z', '.tar.gz', '.tar.bz2', '.tar.xz', '.tar.7z', '.tar.gz', '.tar.bz2', '.tar'],
    },
    unknown: {
        icon: IconFileUnknown,
    },
    txt: {
        icon: IconFileTxt,
        suffix: ['.txt'],
    },
    apk: {
        icon: IconFileAPK,
        suffix: ['.apk'],
    },
    music: {
        icon: IconFileMusic,
        suffix: ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.wma', '.m4a', '.alac', '.aiff', '.cda', '.mid', '.midi', '.amr', '.wmv', '.avi', '.mov', '.mp4', '.mpg', '.mpeg', '.3gp', '.mkv', '.webm', '.vob', '.ogv', '.ogg', '.gif', '.png', '.jpg',]
    },
    folder: {
        icon: IconFileFolder,
        suffix: ['.folder'],
    },
    default: {
        icon: IconFileUnknown,
    },
}
const displayIconComponent = computed(() => {
    let displayIconComponent = IconFileUnknown;
    for(let [key, value] of Object.entries(IconFileMap)) {
        if(value.suffix && value.suffix.includes(props.iconType)) {
            displayIconComponent = value.icon;
            break;
        }
    }
    return displayIconComponent;
});
</script>