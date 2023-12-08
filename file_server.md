# 文件服务器

文件服务器有四个选择：

- httpd（apache）

稳定，使用广泛，服务器一般自带，对于开发人员来说强烈推荐。

- nginx

稳定高效，使用广泛，linux命令可直接下载，对于开发人员来说强烈推荐。

- miniserve

简单易用，可直接下载安装包使用，跨平台。

- gohttpserver

简单易用，可直接下载安装包使用，跨平台，还支持上传功能。

## gohttpserver安装使用

这里推荐使用gohttpserver。二进制包请点击[这里](https://github.com/codeskyblue/gohttpserver)下载.

这里以amd64为例，使用如下命令下载二进制包：

```shell
(base) ┌──(dys㉿kali)-[~/tools]
└─$wget https://github.com/codeskyblue/gohttpserver/releases/download/1.1.4/gohttpserver_1.1.4_linux_amd64.tar.gz
(base) ┌──(dys㉿kali)-[~/tools]
└─$ tar -xvf gohttpserver_1.1.4_linux_amd64.tar.gz
LICENSE
README.md
gohttpserver
```
解压完成后使用如下命令运行：

```shell
(base) ┌──(dys㉿kali)-[~/tools]
└─$ ./gohttpserver -r /video --port 8096 --upload
2023/12/05 19:49:33 httpstaticserver.go:75: root path: /video/
2023/12/05 19:49:33 main.go:185: plistproxy: "https://plistproxy.herokuapp.com/plist"
2023/12/05 19:49:33 main.go:244: listening on ":8096", local address http://192.168.0.110:8096
2023/12/05 19:49:34 httpstaticserver.go:90: Started making search index
2023/12/05 19:50:07 httpstaticserver.go:92: Completed search index in 32.823624317s
2023/12/05 19:50:39 httpstaticserver.go:145: GET  /video
2023/12/05 19:50:39 main.go:57: 192.168.0.110 - GET 200 /
2023/12/05 19:50:46 httpstaticserver.go:145: GET -/user /video/-/user
2023/12/05 19:50:46 main.go:57: 192.168.0.110 - GET 404 /-/user
2023/12/05 19:50:46 main.go:57: 192.168.0.110 - GET 200 /?json=true&_=1701777380703
2023/12/05 19:50:56 main.go:57: 192.168.0.110 - GET 200 /video?json=true&_=1701777380704
```

为了保证gohttpserver开机可用或者意外停止后仍然可用，需要将gohttpserver配置成服务。

## httpd配置

使用如下命令安装apache，

```shell
(base) ┌──(dys㉿kali)-[~/tools]
└─$ sudo apt install apache2
```

然后启动apache2，

```shell
(base) ┌──(dys㉿kali)-[~/tools]
└─$ sudo systemctl  status apache2.service  
○ apache2.service - The Apache HTTP Server
     Loaded: loaded (/lib/systemd/system/apache2.service; disabled; preset: disabled)
     Active: inactive (dead)
       Docs: https://httpd.apache.org/docs/2.4/
                                                                                                                                                                                            
(base) ┌──(dys㉿kali)-[~/tools]
└─$ sudo systemctl  start apache2.service
```

修改ports.conf，将监听端口改为自己想要的然后再重启服务器。

```shell
(base) ┌──(dys㉿kali)-[~/tools]
└─$ sudo vim /etc/apache2/ports.conf  
                                                                                                                                                                                            
(base) ┌──(dys㉿kali)-[~/tools]
└─$ sudo systemctl  restart apache2.service
```

## nginx配置

若nginx未下载，则需要先下载nginx。

```shell
apt install nginx
```

下载完成后，需要修改nginx配置：

```shell
vim /etc/nginx/nginx.conf
```

然后在http节点添加如下内容：

```shell
  autoindex on;             #开启索引功能
  autoindex_exact_size off; # 关闭计算文件确切大小（单位bytes），只显示大概大小（单位kb、mb、gb）
  autoindex_localtime on;   # 显示本机时间而非 GMT 时间
  charset utf-8; # 避免中文乱码

  server {
    listen       8080; #监听端口号
    server_name  192.168.0.110;
    root         /video; # 共享的文件目录

    location / {
    }

    error_page 404 /404.html;
      location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
      location = /50x.html {
    }
  }
```

然后启动nginx，

```shell
systemctl restart nginx
```