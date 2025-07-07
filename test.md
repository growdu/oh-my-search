# doc_index 测试步骤（Kibana Dev Tools）


## 1. 创建索引及映射（支持中文分词和模糊匹配）

```json
PUT doc_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "ik_max_word_analyzer": {
          "type": "custom",
          "tokenizer": "ik_max_word"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title":    { "type": "text", "analyzer": "ik_max_word", "search_analyzer": "ik_max_word", "fields": { "keyword": { "type": "keyword" } } },
      "author":   { "type": "text", "analyzer": "ik_max_word", "search_analyzer": "ik_max_word", "fields": { "keyword": { "type": "keyword" } } },
      "date":     { "type": "date", "format": "yyyy-MM-dd||yyyy-MM-dd HH:mm:ss||strict_date_optional_time||epoch_millis" },
      "path":     { "type": "keyword" },
      "url":      { "type": "keyword" },
      "category": { "type": "keyword" }
    }
  }
}
```

---

## 2. 插入两条测试数据

```json
POST doc_index/_bulk
{ "index": {} }
{ "title": "Elasticsearch中文分词测试文档", "author": "alice", "date": "2024-07-04", "path": "project/README.md", "url": "http://svn.example.com/project/README.md", "category": "文档" }
{ "index": {} }
{ "title": "main.py模糊检索样例", "author": "bob", "date": "2024-07-03", "path": "project/src/main.py", "url": "http://svn.example.com/project/src/main.py", "category": "代码" }
```

---

## 3. 查询测试（中文分词+模糊匹配）

### 3.1 中文分词匹配
```json
GET doc_index/_search
{
  "query": {
    "match": {
      "title": "分词测试"
    }
  }
}
```

### 3.2 模糊匹配
```json
GET doc_index/_search
{
  "query": {
    "fuzzy": {
      "title": {
        "value": "分词测",
        "fuzziness": 2
      }
    }
  }
}
```

---

## 操作说明

1. 离线安装ik分词插件并重启Elasticsearch。
2. 用Kibana Dev Tools依次粘贴上面命令，分别执行。
3. 前端刷新页面即可看到支持中文分词和模糊匹配的测试数据。

