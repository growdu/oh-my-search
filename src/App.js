// Step #1, import statements
import React, { useState, useEffect } from "react";
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";
import {
  PagingInfo,
  ResultsPerPage,
  Paging,
  SearchProvider,
  Results,
  SearchBox,
  Sorting // 修复：导入Sorting组件
} from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

// Step #2, The connector
const connector = new ElasticsearchAPIConnector({
  host: "http://192.168.80.20:9200",
  apiKey: "WjUxNVpZc0JTb3pYN2J6cEdqRHQ6R3Y0all0R1dTai1LSjhqMGc5THFVdw==",
  index: "doc_index"
});
 
// Step #3: Configuration options
const configurationOptions = {
  searchQuery: {
    search_fields: {
      title: { weight: 3 },
      author: { weight: 2 }, // 新增作者字段
      // 可以根据需要添加更多字段
    },
    result_fields: {
      title: { snippet: {} },
      url: { snippet: {} },
      category: { snippet: {} },
      author: { raw: {} }, // 新增作者字段
      date: { raw: {} },   // 新增日期字段
      path: { raw: {} },   // 新增路径字段
    },
    sort: [
      { field: "date", direction: "desc" } // 默认按时间降序
    ]
  },
  autocompleteQuery: {
    results: {
      resultsPerPage: 5,
      search_fields: {
        "title.suggest": { weight: 3 },
        author: { weight: 2 }
      },
      result_fields: {
        title: {
          snippet: {
            size: 100,
            fallback: true
          }
        },
        url: { raw: {} },
        author: { raw: {} },
        date: { raw: {} },
        path: { raw: {} }
      }
    }
  },
  apiConnector: connector,
  alwaysSearchOnInitialLoad: true
};
 
export default function App() {
  const [searchCount, setSearchCount] = useState(0);

  // 页面加载时获取累计计数
  useEffect(() => {
    fetch("/api/search-count")
      .then(res => res.json())
      .then(data => setSearchCount(data.count || 0));
  }, []);

  // 查询时远程+1
  const handleSearch = () => {
    fetch("/api/increment-search-count", { method: "POST" })
      .then(res => res.json())
      .then(data => setSearchCount(data.count));
  };

  const customSearchBox = (
    <SearchBox
      searchFields={["title", "author"]}
      onSubmit={handleSearch}
    />
  );

  return (
    <SearchProvider config={configurationOptions}>
      <div className="App" style={{ position: 'relative' }}>
        {/* 查询次数显示在右上角 */}
        <div style={{ position: 'absolute', top: 10, right: 20, zIndex: 10, background: '#fff', padding: '6px 16px', borderRadius: 16, boxShadow: '0 1px 4px #eee', fontWeight: 'bold' }}>
          查询次数：{searchCount}
        </div>
        <Layout
          header={customSearchBox}
          bodyContent={
            <Results
              titleField="title"
              urlField="url"
              view={({ result }) => (
                <div style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                  <div><strong>文件名:</strong> {result.title?.raw || result.title?.snippet}</div>
                  <div><strong>作者:</strong> {result.author?.raw}</div>
                  <div><strong>修改时间:</strong> {result.date?.raw}</div>
                  <div><strong>路径:</strong> {result.path?.raw}</div>
                  <div><strong>URL:</strong> {result.url?.raw || result.url?.snippet}</div>
                </div>
              )}
            />
          }
          sideContent={
            <div>
              <h4>排序</h4>
              <Sorting
                label={"排序方式"}
                sortOptions={[
                  { name: "按修改时间降序", value: "date", direction: "desc" },
                  { name: "按修改时间升序", value: "date", direction: "asc" }
                ]}
              />
            </div>
          }
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