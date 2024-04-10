package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
    "os"
    "fmt"
    "io/ioutil"
    "strconv"
    "strings"
)

var count uint64
const fileName string = "visit.txt"

func readCount() {
    // 读取文件内容
	data, err := ioutil.ReadFile(fileName)
	if err != nil {
		fmt.Println("Error reading file:", err)
		return
	}

	// 将读取到的数据转换为字符串
	numStr := string(data)
    numStr = strings.TrimSpace(numStr)
	// 将字符串转换为整数
	count, err := strconv.Atoi(numStr)
	if err != nil {
		fmt.Println("Error converting string to int:", err)
		return
	}

	fmt.Printf("current visit cout is: %d\n", count)
}

func writeCount(countStr string) {
    file, err := os.OpenFile(fileName, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0666)
	if err != nil {
		// 处理可能的错误
		fmt.Println("Error opening file:", err)
		return
	}
	defer file.Close() // 确保在函数结束时关闭文件
    

	// 向文件写入内容
	_, err = file.WriteString(countStr)
	if err != nil {
		fmt.Println("Error writing to file:", err)
		return
	}

	fmt.Println("File written successfully")
}

func main() {
    args := os.Args
    var url string
    if len(args) > 1 {
        url = args[1]
    } else {
        fmt.Println("unkown input");
        return
    }
    // 创建一个默认的 Gin 引擎
    readCount()
    r := gin.Default()
    r.Use(Cors())
    // 定义一个路由，处理 GET 请求
    r.GET("/visit", func(c *gin.Context) {
        // 返回一个 JSON 响应
        count++
        countStr := strconv.FormatUint(count, 10)
        writeCount(countStr)
        c.JSON(http.StatusOK, gin.H{
            "visit":countStr,
        })
    })

    // 启动 HTTP 服务器，监听在 8080 端口
    r.Run(url)
}

func Cors() gin.HandlerFunc {
    return func(c *gin.Context) {
        method := c.Request.Method
        origin := c.Request.Header.Get("Origin") //请求头部
        if origin != "" {
            //接收客户端发送的origin （重要！）
            c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
            //服务器支持的所有跨域请求的方法
            c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE,UPDATE")
            //允许跨域设置可以返回其他子段，可以自定义字段
            c.Header("Access-Control-Allow-Headers", "Authorization, Content-Length, X-CSRF-Token, Token,session")
            // 允许浏览器（客户端）可以解析的头部 （重要）
            c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers")
            //设置缓存时间
            c.Header("Access-Control-Max-Age", "172800")
            //允许客户端传递校验信息比如 cookie (重要)
            c.Header("Access-Control-Allow-Credentials", "true")
        }

        //允许类型校验
        if method == "OPTIONS" {
            c.JSON(http.StatusOK, "ok!")
        }

        defer func() {
            if err := recover(); err != nil {
                println("Panic info is: %v", err)
            }
        }()

        c.Next()
    }
}


