import re
import sys

if len(sys.argv) < 3:
    print("用法: python svn_to_bulk.py <svn_base_url> <es_index>")
    sys.exit(1)

svn_base_url = sys.argv[1]
es_index = sys.argv[2]
svn_file = "svn_list.txt"
bulk_file = "bulk.json"

pattern = re.compile(r'^\s*(\d+)\s+(\S+)\s+\d+\s+(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}\s+(.+)$')
file_map = {}

with open(svn_file, encoding='utf-8') as f:
    for line in f:
        m = pattern.match(line)
        if m:
            revision, author, date, path = m.groups()
            if not path.endswith('/'):
                filename = path.split('/')[-1]
                if filename not in file_map or int(revision) > int(file_map[filename]['revision']):
                    file_map[filename] = {
                        'title': filename,
                        'author': author,
                        'date': date,
                        'path': path,
                        'url': f"{svn_base_url}/{path}",
                        'revision': revision
                    }

with open(bulk_file, 'w', encoding='utf-8') as f:
    for file in file_map.values():
        f.write(f'{{ "index": {{ "_index": "{es_index}" }} }}\n')
        doc = {k: v for k, v in file.items() if k != 'revision'}
        import json
        f.write(json.dumps(doc, ensure_ascii=False) + '\n')

print(f"已生成 bulk 文件：{bulk_file}") 