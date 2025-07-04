// Step #1, import statements
import React from "react";
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";
import {
  PagingInfo,
  ResultsPerPage,
  Paging,
  SearchProvider,
  Results,
  SearchBox,
  //Sorting
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
  return (
    <SearchProvider config={configurationOptions}>
      <div className="App">
        <Layout
          header={<SearchBox searchFields={["title", "author"]} />}
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