// 批量导入所有SVG文件
const svgModules = import.meta.glob('./*.svg', { query: '?raw', eager: true, import: 'default' })

// 处理导入的SVG模块
const svgIcons: Record<string, any> = {}

Object.keys(svgModules).forEach(key => {
  // 提取文件名作为图标名称
  const iconName = key.replace(/\.\/(.*)\.svg$/, '$1')
  // 存储SVG组件
  // console.log(svgModules);
  svgIcons[iconName] = (svgModules[key] as { default: any })
})

export default svgIcons