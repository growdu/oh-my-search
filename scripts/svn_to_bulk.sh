#!/bin/bash

# ====== 配置区 ======
SVN_URL="http://your-svn-server/svn/your-repo"   # 修改为你的SVN仓库地址
ES_URL="http://192.168.80.20:9200"              # 修改为你的Elasticsearch地址
ES_INDEX="doc_index"                            # 索引名
SVN_BASE_URL="http://your-svn-server/svn/your-repo" # 用于拼接url字段
# ====================

# 1. 获取SVN文件信息
echo "[1/3] 获取SVN文件信息..."
svn list -R -v "$SVN_URL" > svn_list.txt

# 2. 生成bulk.json
echo "[2/3] 生成bulk.json..."
python scripts/svn_to_bulk.py "$SVN_BASE_URL" "$ES_INDEX"

# 3. 导入到Elasticsearch
echo "[3/3] 导入到Elasticsearch..."
curl -H "Content-Type: application/x-ndjson" -XPOST "$ES_URL/$ES_INDEX/_bulk" --data-binary @bulk.json

echo "全部完成！" 