#!/usr/bin/env bash
# git 同步推送，对应 Windows 下的 gg.bat
# 用法 ./gg.sh 或 ./gg.sh "提交信息"

set -euo pipefail

cd "$(dirname "$0")"

git branch -M main

message="${1:-}"
if [ -z "$message" ]; then
  git status
  printf "输入提交信息: "
  IFS= read -r message
fi

if [ -z "${message// /}" ]; then
  echo "提交信息为空，已取消推送"
  exit 1
fi

git add .
git commit -m "$message"
git push origin main

git status
echo "代码已提交并推送完成"
