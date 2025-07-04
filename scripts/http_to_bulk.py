import sys, requests, re, json
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

if len(sys.argv) < 3:
    print("用法: python http_to_bulk.py <http_base_url> <es_index>")
    sys.exit(1)

base_url = sys.argv[1]
es_index = sys.argv[2]
bulk_file = "bulk.json"
visited = set()
file_map = {}

def crawl(url):
    if url in visited: return
    visited.add(url)
    try:
        r = requests.get(url)
        if r.status_code != 200: return
        soup = BeautifulSoup(r.text, "html.parser")
        for link in soup.find_all("a"):
            href = link.get("href")
            if not href or href.startswith("?") or href.startswith("#"): continue
            full_url = urljoin(url, href)
            if href.endswith("/"):
                crawl(full_url)
            else:
                filename = href.split("/")[-1]
                file_map[filename] = {
                    "title": filename,
                    "author": "",
                    "date": "",
                    "path": urlparse(full_url).path,
                    "url": full_url
                }
    except Exception as e:
        pass

crawl(base_url)

with open(bulk_file, "w", encoding="utf-8") as f:
    for file in file_map.values():
        f.write(f'{{ "index": {{ "_index": "{es_index}" }} }}\n')
        f.write(json.dumps(file, ensure_ascii=False) + '\n')

print(f"已生成 bulk 文件：{bulk_file}") 