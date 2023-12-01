# oh-my-search

使用elasticsearch和search-ui搭建自己的搜索引擎，快速查找资源和文件。

## 搭建elasticsearch

### 先搭建eleasticsearch再搭建kibana

#### 搭建elasticsearch

```shell
mkdir elasticsarch
cd elasticsarch
mkdir -p /es/plugins
mkdir -p /es/data
mkdir -p /es/logs
mkdir -p /es/config
vim docker-compose.yml
```
编辑docker-compose.yml文件，内容如下：

```shell
version: '3'
services:
  elasticsearch:
    image: elasticsearch:8.9.0
    container_name: elasticsearch
    privileged: true
    environment:
      - "cluster.name=elasticsearch" #设置集群名称为elasticsearch
      - "discovery.type=single-node" #以单一节点模式启动
      - "ES_JAVA_OPTS=-Xms512m -Xmx1096m" #设置使用jvm内存大小
      - bootstrap.memory_lock=true
    volumes:
      - ./es/plugins:/usr/share/elasticsearch/plugins #插件文件挂载
      - ./es/data:/usr/share/elasticsearch/data:rw #数据文件挂载
      - ./es/logs:/usr/share/elasticsearch/logs:rw
      - ./es/config/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml
    ports:
      - 9200:9200
      - 9300:9300
    deploy:
     resources:
        limits:
           cpus: "2"
           memory: 1000M
        reservations:
           memory: 200M
```

其中./es/config/elasticsearch.yml的内容如下，可按需修改：

```yaml
cluster.name: "elasticsearch"
network.host: 0.0.0.0
```
- 启动elasticsearch

配置完成后，启动elasticsearch。

```shell
docker-compose --compatibility up -d
```

同时进入elasticsearch容器内部，修改密码。

```shell
# 进入容器内部
docker exec -it elasticsearch bash
# 修改密码
elasticsearch@4c37fcfb6f13:~$ ls
LICENSE.txt  NOTICE.txt  README.asciidoc  bin  config  data  jdk  lib  logs  modules  plugins
elasticsearch@4c37fcfb6f13:~$ bin/elasticsearch-reset-password --username elastic -i
bin/elasticsearch-reset-password --username kibana -i
```

#### 搭建kibana

```shell
mkdir kibana
cd kibana
vim docker-compose.yml
```
docker-compose.yml的内容如下：

```yaml
version: '3'
services:
  kibana:
    image: kibana:8.9.0
    container_name: kibana
    volumes:
      - ./kibana.yml:/usr/share/kibana/config/kibana.yml
    ports:
      - 5601:5601
    deploy:
     resources:
        limits:
           cpus: "1"
           memory: 1000M
        reservations:
           memory: 200M
```

kibana.yml的文件内容如下，可按需修改：

```yaml
elasticsearch.hosts: http://elasticsearch:9200
elasticsearch.username: kibana
elasticsearch.password: kibana
server.host: "0.0.0.0"
server.name: kibana
xpack.monitoring.ui.container.elasticsearch.enabled: true
i18n.locale: zh-CN
```

启动kibana，

```shell
docker-compose --compatibility up -d
```


### 同时搭建eleasticsearch和kibana

- 使用docker-compose启动elasticsearch

编辑docker-compose.yml文件，内容如下：

```yaml
version: '3'
services:
  elasticsearch:
    image: elasticsearch:8.9.0
    container_name: elasticsearch
    privileged: true
    environment:
      - "cluster.name=elasticsearch" #设置集群名称为elasticsearch
      - "discovery.type=single-node" #以单一节点模式启动
      - "ES_JAVA_OPTS=-Xms512m -Xmx1096m" #设置使用jvm内存大小
      - bootstrap.memory_lock=true
    volumes:
      - ./es/plugins:/usr/local/dockercompose/elasticsearch/plugins #插件文件挂载
      - ./es/data:/usr/local/dockercompose/elasticsearch/data:rw #数据文件挂载
      - ./es/logs:/usr/local/dockercompose/elasticsearch/logs:rw
    ports:
      - 9200:9200
      - 9300:9300
    deploy:
     resources:
        limits:
           cpus: "2"
           memory: 1000M
        reservations:
           memory: 200M
  kibana:
    image: kibana:8.9.0
    container_name: kibana
    depends_on:
      - elasticsearch #kibana在elasticsearch启动之后再启动
    volumes:
      - ./es/config/kibana:/usr/share/kibana/config/kibana.yaml
    ports:
      - 5601:5601
```

其中kibana.yaml的内容如下：

```shell
elasticsearch.hosts: http://elasticsearch:9200
server.host: "0.0.0.0"
server.name: kibana
xpack.monitoring.ui.container.elasticsearch.enabled: true
i18n.locale: zh-CN
```

- 进入elasticsearch终端，修改elasticsearch密码

```shell
# 进入容器内部
docker exec -it elasticsearch bash
# 修改密码
elasticsearch@4c37fcfb6f13:~$ ls
LICENSE.txt  NOTICE.txt  README.asciidoc  bin  config  data  jdk  lib  logs  modules  plugins
elasticsearch@4c37fcfb6f13:~$ bin/elasticsearch-reset-password --username elastic -i
WARNING: Owner of file [/usr/share/elasticsearch/config/users] used to be [root], but now is [elasticsearch]
WARNING: Owner of file [/usr/share/elasticsearch/config/users_roles] used to be [root], but now is [elasticsearch]
This tool will reset the password of the [elastic] user.
You will be prompted to enter the password.
Please confirm that you would like to continue [y/N]y


Enter password for [elastic]: 
Re-enter password for [elastic]: 
Password for the [elastic] user successfully reset.
elasticsearch@4c37fcfb6f13:~$
```

- 生成kibana的token

```shell
# 重启容器然后进入容器内部生成kibana的token
docker exec -it elasticsearch bash
elasticsearch@4c37fcfb6f13:~$ bin/elasticsearch-create-enrollment-token -s kibana
```

- 获取kibana验证码

```shell
# 在浏览器打开http://ip:5601,粘贴kibana的token，然后进入kibana容器内部获取验证码
sudo docker exec -it kibana bash       
kibana@fce2ab8aec1e:~$ ls
LICENSE.txt  NOTICE.txt  README.txt  bin  config  data  logs  node  node_modules  package.json  packages  plugins  src  x-pack
kibana@fce2ab8aec1e:~$ bin/kibana-verification-code 
Your verification code is:  042 943 
```

## 搭建search-ui

- 创建search-ui项目

```shell
npm install -g  create-react-app
# 创建名为doc_index的项目
create-react-app doc_index --use-npm
cd doc_index
npm install --save @elastic/react-search-ui @elastic/search-ui-app-search-connector @elastic/search-ui-elasticsearch-connector
```
- 启动search-ui项目

```shell
npm start
```

- 创建api_key

登录kibana，进入到/app/management/security/api_keys/，创建一个api_key并记录api_key.

- 创建索引

登录kibana的dev_tools创建和设置索引：

```shell
# 创建索引
PUT /doc_index

# 设置索引属性
PUT /doc_index/_mapping
{
  "properties":{
    "title":{
      "type":"text",
      "fields":{
        "suggest": {
          "type": "search_as_you_type"
        }
      }
    },
    "category":{
      "type":"text"
    },
    "url":{
      "type":"text"
    }
  }
}

# 设置查询返回的最大条数
PUT /doc_index/_settings
{
  "index" : {
    "max_result_window": 500000
  }
}
```

- 导入数据

```shell
# 插入单条数据
POST /doc_index/_bulk
{"index":{}}
{"title":"test","category":"test","url":"http://localhost:3000"}

## 批量插入
POST /doc_index/_bulk
{"index":{}}
{"title":"test2","category":"test","url":"http://localhost:3001"}
{"index":{}}
{"title":"dir","category":"test","url":"http://localhost:3002"}
{"index":{}}
{"title":"ddssd","category":"test","url":"http://localhost:3003"}
{"index":{}}
{"title":"测试","category":"test","url":"http://localhost:3004"}
```

当然也可以用命令行插入，如使用curl命令：

```shell
curl --username username:password -H "Content-Type: application/json" -XPOST  192.168.56.130:9200/bank/account/_bulk?pretty --data-binary "@test.json"
```
其中--username指定elasticsearch的用户名和密码，test.json的内容如下：

```json
{"index":{}}
{"title":"test2","category":"test","url":"http://localhost:3001"}
{"index":{}}
{"title":"dir","category":"test","url":"http://localhost:3002"}
{"index":{}}
{"title":"ddssd","category":"test","url":"http://localhost:3003"}
{"index":{}}
{"title":"测试","category":"test","url":"http://localhost:3004"}
```
完整数据插入命令如下：

```shell

PUT /doc_index/_mapping
{
  "properties":{
    "title":{
      "type":"text",
      "fields":{
        "suggest": {
          "type": "search_as_you_type"
        }
      }
    },
    "category":{
      "type":"text"
    },
    "url":{
      "type":"text"
    }
  }
}

PUT /doc_index/_settings
{
  "index" : {
    "max_result_window": 500000
  }
}

GET /doc_index/_search

POST /doc_index/_bulk
{"index":{}}
{"title":"test2","category":"test","url":"http://localhost:3001"}
{"index":{}}
{"title":"dir","category":"test","url":"http://localhost:3002"}
{"index":{}}
{"title":"ddssd","category":"test","url":"http://localhost:3003"}
{"index":{}}
{"title":"测试","category":"test","url":"http://localhost:3004"}
```
## 完善search-ui

search-ui下载下来之后，还没有绑定数据，此时还需要修改app.js来进行适配。

app.js需更改成：

```javascript
// Step #1, import statements
import React from "react";
// 这里需要注意app和网页的接口名称不一样
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";
import {
  PagingInfo,
  ResultsPerPage,
  Paging,
  SearchProvider,
  Results,
  SearchBox,
  Sorting
} from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

// Step #2, The connector
const connector = new ElasticsearchAPIConnector({
  host: "http://elasticsearch:9200", // elasticsearch的地址
  apiKey: "WjUxNVpZc0JTb3pYN2J6cEdqRHQ6R3Y0all0R1dTai1LSjhqMGc5THFVdw==", // elasticsearch 的登录秘钥，在kibana上生成
  index: "doc_index" // 要访问的索引的地址
});
 
// Step #3: Configuration options
const configurationOptions = {
  searchQuery: {
    search_fields: {
      title: {
        weight: 3
      },
      url: {},
      category: {}
    },
    result_fields: {
      title: {
        snippet: {}
      },
      url: {
        snippet: {}
      },
      category: {
        snippet: {}
      }
    }
  },
  apiConnector: connector,
  alwaysSearchOnInitialLoad: true
};

// step4 show result 
export default function App() {
  return (
    <SearchProvider config={configurationOptions}>
      <div className="App">
        <Layout
          header={<SearchBox />}
          // 要展示的标题和标题对应的连接
          bodyContent={<Results titleField="title" urlField="url" />}
          bodyHeader={
            <>
              <PagingInfo />
              <ResultsPerPage />
            </>
          }
          bodyFooter={<Paging />}
        />
      </div>
    </SearchProvider>
  );
}
```
还可以修改一下public下面的title标签，修改成自己的项目标签。如：

```html
<title>doc_index</title>
```