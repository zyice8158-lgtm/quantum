export default {
  plugins: {
    'postcss-pxtorem': {
      rootValue: process.env.DESIGN_DRAFT_WIDTH / 10, // 设计稿基准值，例如 Vant UI 库通常以 37.5 为基准
      propList: ['*'], // 指定需要转换的属性，'*' 代表所有属性
    }
  }
}