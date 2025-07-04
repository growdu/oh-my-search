import sys, ftplib, json, os
from urllib.parse import urlparse

if len(sys.argv) < 3:
    print("用法: python ftp_to_bulk.py <ftp_base_url> <es_index>")
    sys.exit(1)

ftp_url = sys.argv[1]
es_index = sys.argv[2]
bulk_file = "bulk.json"
file_map = {}

def list_ftp(ftp, path):
    try:
        items = []
        ftp.retrlines('LIST ' + path, items.append)
        for item in items:
            parts = item.split()
            name = parts[-1]
            if item.startswith('d'):
                list_ftp(ftp, os.path.join(path, name))
            else:
                filename = name
                file_map[filename] = {
                    "title": filename,
                    "author": "",
                    "date": "",
                    "path": os.path.join(path, filename),
                    "url": f"{ftp_url}{os.path.join(path, filename)}"
                }
    except Exception as e:
        pass

parsed = urlparse(ftp_url)
ftp = ftplib.FTP(parsed.hostname)
ftp.login() # 匿名登录，如需账号密码可改
list_ftp(ftp, parsed.path or "/")
ftp.quit()

with open(bulk_file, "w", encoding="utf-8") as f:
    for file in file_map.values():
        f.write(f'{{ "index": {{ "_index": "{es_index}" }} }}\n')
        f.write(json.dumps(file, ensure_ascii=False) + '\n')

print(f"已生成 bulk 文件：{bulk_file}") 