module.exports = {
  plugins: [
    require('postcss-pxtorem')({
      rootValue: 60, // 换算的基数
      selectorBlackList: [], // 忽略转换正则匹配项
      propList: ['*'],
      minPixelValue: 2 // 设置要替换的最小像素值
    }),
  ],
};