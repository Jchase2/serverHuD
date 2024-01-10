package main

import (
	"bytes"
	"fmt"
	"log"
	"math"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/JChase2/serverhud/serverhud-extension-server/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/host"
	"github.com/shirou/gopsutil/mem"
)

func GetUpgradeable() string {
	cmd := exec.Command("/usr/bin/apt", "list", "--upgradeable")
	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Fatalf("cmd.Run() failed with %s\n", err)
	}
	cmd.Run()
	fmt.Printf("combined out:\n%s\n", string(out))
	return string(out)
}

// GetHostname returns hostname of system
func GetHostname() string {
	var info, _ = host.Info()
	return info.Hostname
}

// GetUptime obvs gets uptime in hours
func GetUptime() uint64 {
	var currUptime, _ = host.Uptime()
	return currUptime / 60 / 60
}

// Get smart result
func GetSmartInfo() []string {

	// Gets a list of drives
	smartScan, err := exec.Command("smartctl", "--scan").CombinedOutput()

	if err != nil {
		fmt.Print("ERROR FROM SCAN IS: ", err.Error())
		slice := []string{"Error with smartctl, please ensure it is installed and in your path."}
		return slice
	}

	// Splits the list of drives by newline
	smartList := strings.Split(string(smartScan), "\n")

	if smartList[len(smartList)-1] == "" {
		// Create a new slice without the last element
		smartList = smartList[:len(smartList)-1]
	}

	// Creates an array of arrays containing split up commands
	// for input into smartctl -H
	var smartArr = make([][]string, len(smartList))
	for i := 0; i < len(smartList); i++ {
		smartArr[i] = strings.Split(smartList[i], " ")
	}

	// Creates smartResults array and gets the result of smartctl -H
	// into it for each drive. Only checks drives that are mounted.
	var smartResults = make([][]byte, len(smartArr))
	for i := 0; i < len(smartArr); i++ {
		grep := exec.Command("grep", smartArr[i][0], "/proc/mounts")
		out, grepErr := grep.CombinedOutput()
		if grepErr != nil {
			fmt.Println("DISK LIST GREP ERROR (this is usually ok): ", grepErr)
		} else if out != nil {
			var currArr = smartArr[i]
			smartResults[i], err = exec.Command("smartctl", "-H", currArr[0], currArr[1], currArr[2]).CombinedOutput()
			if err != nil {
				fmt.Print("ERROR FROM RES IS: ", err.Error())
			}
		}
	}

	var smartResultsStringified = make([]string, len(smartArr))
	for i := 0; i < len(smartArr); i++ {
		colonIndex := strings.Index(string(smartResults[i]), "www.smartmontools.org")
		if colonIndex != -1 {
			result := string(smartResults[i])[colonIndex+len("www.smartmontools.org"):]
			smartResultsStringified[i] = result

		} else {
			fmt.Println(string(smartResults[i]))
		}
	}

	for i := 0; i < len(smartArr); i++ {
		colonIndex := strings.Index(string(smartResults[i]), "=== START OF READ SMART DATA SECTION ===")
		if colonIndex != -1 {
			result := smartArr[i][0] + string(smartResults[i])[colonIndex+len("=== START OF READ SMART DATA SECTION ==="):]
			smartResultsStringified[i] = result

		} else {
			fmt.Println(string(smartResults[i]))
		}
	}
	return smartResultsStringified
}

// GetMemUsage gets % of memory used.
func GetMemUsage() float64 {
	var memUsage, _ = mem.VirtualMemory()
	return math.Round(memUsage.UsedPercent*100) / 100
}

// GetCpuUsage gets % of all cpu's used.
func GetCpuUsage() float64 {
	var cpuUsage, _ = cpu.Percent(0, false)
	return math.Round(cpuUsage[0]*100) / 100
}

// Struct for Login
type LoginReq struct {
	Key string
}

// Provide JWT assuming correct key is provided.
func Login(c *gin.Context) {
	var req LoginReq
	c.BindJSON(&req)

	var serverSecret = []byte(os.Getenv("SERVER_SECRET"))
	var serverKey = []byte(req.Key)
	if bytes.Equal(serverSecret, serverKey) {
		var newJwt = jwt.New(jwt.SigningMethodHS256)
		claims := newJwt.Claims.(jwt.MapClaims)
		claims["exp"] = time.Now().Add(60 * time.Minute).Unix()
		claims["iat"] = time.Now()
		myjwt, err := newJwt.SignedString(serverKey)
		if err == nil {
			c.JSON(200, myjwt)
		} else {
			println("ERROR WITH KEY")
		}
	} else {
		c.JSON(401, "Unauthorized")
	}
}

type GetReq struct {
	Token string
}

func initRouter() *gin.Engine {
	fmt.Println("Initalizing Router.")
	r := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	r.Use(cors.New(config))
	api := r.Group("/api")
	api.POST("/login", Login)
	serverinfo := api.Group("/serverinfo").Use(middleware.Auth())

	serverinfo.GET("/disk", func(c *gin.Context) {
		var req GetReq
		if err := c.Bind(&req); err != nil {
			println("ERROR WITH BIND: ", err)
		}

		c.JSON(200, gin.H{
			"diskData": GetCombinedDiskInfo(),
		})
	})

	serverinfo.GET("/smart", func(c *gin.Context) {
		var req GetReq
		if err := c.Bind(&req); err != nil {
			println("ERROR WITH BIND: ", err)
		}

		c.JSON(200, gin.H{
			"Smart Results: ": GetSmartInfo(),
		})
	})

	serverinfo.GET("/resources", func(c *gin.Context) {

		println("Running /resources")

		var req GetReq
		if err := c.Bind(&req); err != nil {
			println("ERROR WITH BIND: ", err)
		}

		c.JSON(200, gin.H{
			"hostName": GetHostname(),
			"memUsage": GetMemUsage(),
			"cpuUsage": GetCpuUsage(),
		})
	})

	serverinfo.GET("/upgrades", func(c *gin.Context) {

		println("Running /upgrades")

		var req GetReq
		if err := c.Bind(&req); err != nil {
			println("ERROR WITH BIND: ", err)
		}

		c.JSON(200, gin.H{
			"hostName": GetHostname(),
			"upgrades": GetUpgradeable(),
		})
	})

	serverinfo.GET("/", func(c *gin.Context) {

		println("Running / (get all)")

		var req GetReq

		if err := c.Bind(&req); err != nil {
			println("ERROR WITH BIND: ", err)
		}

		c.JSON(200, gin.H{
			"hostName":      GetHostname(),
			"uptimeInHours": GetUptime(),
			"diskData":      GetCombinedDiskInfo(),
			"upgrades":      GetUpgradeable(),
			"smart":         GetSmartInfo(),
			"memUsage":      GetMemUsage(),
			"cpuUsage":      GetCpuUsage(),
		})
	})

	return r
}

func main() {
	// Pull in .env environmental variables.
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	r := initRouter()
	r.Run(":" + os.Getenv("CONFIG_PORT"))
}
