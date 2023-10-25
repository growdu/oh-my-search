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
  autocompleteQuery: {
    results: {
      resultsPerPage: 5,
      search_fields: {
        "title.suggest": {
          weight: 3
        }
      },
      result_fields: {
        title: {
          snippet: {
            size: 100,
            fallback: true
          }
        },
        url: {
          raw: {}
        }
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
          header={<SearchBox />}
          bodyContent={<Results titleField="title" urlField="url" />}
          // sideContent={
          //   <div>
          //     <Sorting
          //       label={"Sort by"}
          //       sortOptions={[
          //         {
          //           name:"title",
          //           value: "",
          //           direction: ""
          //         },
          //         {
          //           name:"title",
          //           value: "url",
          //           direction: "asc"
          //         }
          //       ]}
          //     />
          //   </div>
          // }
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