import {  defineComponent, h } from 'vue'
import svgIcons from './assets'
// console.log('svgIcons',svgIcons);


// 定义SVG图标组件
export const SvgIcon = defineComponent({
    name: 'SvgIcon',
    props: {
        name: {
            type: String,
            required: true,
            description: 'SVG图标名称（对应svg文件夹中的文件名）'
        },
        size: {
            type: [Number, String],
            default: 24,
            description: 'size'
        },
        color: {
            type: String,
            default: 'currentColor',
            description: 'color'
        }
    },
    render() {
        const { name, size, color } = this
        // console.log('svgIcons',svgIcons[name]);
        // svgIcons[name]().then(res=>{
        //     console.log(res);
            
        // })

    // 检查图标是否存在
    if (!svgIcons[name]) {
      console.warn(`SVG icong "${name}" not excist`)
      return null
    }
const res=svgIcons[name].replace(/width="\d+"/g,'width='+size).replace(/height="\d+"/g,'height='+size)
// console.log(res);

    // 渲染SVG图标
    return h('svg', {
      inline: true,
      width: size,
      height: size,
      display: 'block', // 以后需要加入class中
      color,
      innerHTML: res
    })
  }
})

// 注册为Vue插件
// export default {
//   install(app: App) {
//     app.component('SvgIcon', SvgIcon)
//   }
// }
