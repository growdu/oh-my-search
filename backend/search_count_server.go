package main

import (
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const countFile = "search_count.txt"

func getCount() int {
	data, err := ioutil.ReadFile(countFile)
	if err != nil {
		return 0
	}
	count, err := strconv.Atoi(string(data))
	if err != nil {
		return 0
	}
	return count
}

func setCount(count int) {
	os.WriteFile(countFile, []byte(strconv.Itoa(count)), 0644)
}

func main() {
	r := gin.Default()

	// 允许跨域
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.GET("/api/search-count", func(c *gin.Context) {
		count := getCount()
		c.JSON(http.StatusOK, gin.H{"count": count})
	})

	r.POST("/api/increment-search-count", func(c *gin.Context) {
		count := getCount() + 1
		setCount(count)
		c.JSON(http.StatusOK, gin.H{"count": count})
	})

	r.Run(":3001") // 监听3001端口
}
