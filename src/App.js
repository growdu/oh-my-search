import React from "react";
import {
  // PagingInfo,
  // ResultsPerPage,
  // Paging,
  SearchProvider,
  Results,
  SearchBox,
  Sorting
} from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import { PagingInfo, ResultsPerPage, Paging } from "@elastic/react-search-ui";

const connector = new ElasticsearchAPIConnector({
  host: "http://192.168.80.21:9200",
  index: "doc_index"
});

const config = {
  searchQuery: {
    search_fields: { title: {}, author: {} },
    sort: [
      { field: "date", direction: "desc" }
    ]
  },
  apiConnector: connector,
  alwaysSearchOnInitialLoad: true
};

export default function App() {
  return (
    <SearchProvider config={config}>
      <Layout
        header={<SearchBox searchFields={["title", "author"]} />}
        bodyContent={<Results titleField="title" />}
        sideContent={
          <Sorting
            label="排序方式"
            sortOptions={[
              { name: "按修改时间降序", value: "date", direction: "desc" },
              { name: "按修改时间升序", value: "date", direction: "asc" }
            ]}
          />
        }
        bodyHeader={
          <>
            <PagingInfo />
            <ResultsPerPage />
          </>
        }
        bodyFooter={<Paging />}
      />
    </SearchProvider>
  );
}