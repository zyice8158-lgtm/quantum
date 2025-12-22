module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能（feature）
        'fix', // 修补bug
        'docs', // 文档（documentation）
        'style', // 格式（不影响代码运行的变动）
        'refactor', // 重构（即不是新增功能，也不是修改bug的代码变动）
        'test', // 增加测试
        'revert', // 回滚
        'config', // 构建过程或辅助工具的变动
        'chore', // 其他改动
        'update', // 更新某功能
        'optimize' // 优化构建工具或运行时性能
      ]
    ],
    'type-empty': [2, 'never'], 
    'subject-empty': [2, 'never'], 
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never']
  }
}
