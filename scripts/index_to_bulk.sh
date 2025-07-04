#!/bin/bash

# ====== 配置区 ======
TYPE="svn" # 可选: svn http ftp
SRC_URL="http://your-svn-server/svn/your-repo"   # 仓库/目录地址
ES_URL="http://192.168.80.20:9200"
ES_INDEX="doc_index"
# ====================

if [ "$TYPE" == "svn" ]; then
  echo "[SVN] 获取文件信息..."
  svn list -R -v "$SRC_URL" > svn_list.txt
  python scripts/svn_to_bulk.py "$SRC_URL" "$ES_INDEX"
  BULK_FILE="bulk.json"
elif [ "$TYPE" == "http" ]; then
  echo "[HTTP] 获取文件信息..."
  python scripts/http_to_bulk.py "$SRC_URL" "$ES_INDEX"
  BULK_FILE="bulk.json"
elif [ "$TYPE" == "ftp" ]; then
  echo "[FTP] 获取文件信息..."
  python scripts/ftp_to_bulk.py "$SRC_URL" "$ES_INDEX"
  BULK_FILE="bulk.json"
else
  echo "不支持的类型: $TYPE"
  exit 1
fi

echo "[导入] 导入到Elasticsearch..."
curl -H "Content-Type: application/x-ndjson" -XPOST "$ES_URL/$ES_INDEX/_bulk" --data-binary @"$BULK_FILE"

echo "全部完成！" 