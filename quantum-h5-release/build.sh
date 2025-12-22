#!/bin/bash
# 定义打包目录，可根据实际情况修改
PACK_DIR="./dist"

# 判断 dist 目录是否存在，如果存在则删除
if [ -d "$PACK_DIR" ]; then
    echo "检测到已存在的 $PACK_DIR 目录，正在删除..."
    rm -rf "$PACK_DIR"
    if [ $? -eq 0 ]; then
        echo "$PACK_DIR 目录已成功删除"
    else
        echo "删除 $PACK_DIR 目录失败"
        exit 1
    fi
else
    echo "未检测到 $PACK_DIR 目录，无需删除"
fi
pnpm run build:halo
pnpm run build:pod1
pnpm run build:loading
# 定义打包目录，可根据实际情况修改
PACK_DIR="./dist"

# 确保打包目录存在
mkdir -p "$PACK_DIR"

# 获取当前分支名
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

# 获取最后一条提交记录（包含哈希值、作者、日期和提交信息）
LAST_COMMIT=$(git log -1 --pretty=format:"Last Commit Hash: %H%nAuthor: %an%nDate: %ad%nMessage: %s" --date=format:"%Y-%m-%d %H:%M:%S")

# 输出文件路径
OUTPUT_FILE="$PACK_DIR/git_info.txt"

# 写入信息到文件
{
    echo "当前分支: $BRANCH_NAME"
    echo "----------------------------------------"
    echo "$LAST_COMMIT"
} > "$OUTPUT_FILE"

# 提示执行结果
if [ $? -eq 0 ]; then
    echo "Git信息已成功写入: $OUTPUT_FILE"
else
    echo "生成Git信息文件失败"
    exit 1
fi

# 将 dist 目录打包成 zip 文件
ZIP_NAME="dist_$(date +%Y%m%d_%H%M%S).zip"
if command -v zip >/dev/null 2>&1; then
    # 使用 zip 命令打包
    zip -r "$ZIP_NAME" "$PACK_DIR"
    if [ $? -eq 0 ]; then
        echo "已成功创建压缩包: $ZIP_NAME"
    else
        echo "创建压缩包失败"
        exit 1
    fi
else
    echo "系统未安装 zip 命令，跳过压缩步骤"
fi