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

	"github.com/JChase2/hud-server/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/disk"
	"github.com/shirou/gopsutil/host"
	"github.com/shirou/gopsutil/mem"
)

// GetStatus returns http status of url or ip
// func GetStatus(url string) string {
// 	resp, err := http.Get(url)
// 	if err != nil {
// 		return err.Error()
// 	} else if resp.StatusCode == 200 {
// 		return "Up"
// 	}
// 	return strconv.Itoa(resp.StatusCode)
// }

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

// GetCertStatus returns cert expiration for url
// func GetCertStatus(url string, port string) string {

// 	conn, err := net.Dial("tcp", url+":"+port)
// 	if err != nil {
// 		fmt.Println("NO")
// 		return err.Error()
// 	}
// 	client := tls.Client(conn, &tls.Config{
// 		ServerName: url,
// 	})
// 	defer client.Close()

// 	if err := client.Handshake(); err != nil {
// 		fmt.Println("Client handshake error")
// 		return err.Error()
// 	}

// 	cert := client.ConnectionState().PeerCertificates[0]
// 	var retMeUnformatted = cert.NotAfter.Format(time.RFC3339)
// 	var retMe = strings.Split(retMeUnformatted, "T")
// 	return retMe[0]
// }

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

// GetDiskUsage gets remaining disk space in GB for curr partition.
func GetDiskUsage() uint64 {
	var diskUsage, _ = disk.Usage("./")
	return diskUsage.Free / 1024 / 1024 / 1024
}

// Get Disk Size gets total disk space.
func GetDiskSize() uint64 {
	var diskSize, _ = disk.Usage("./")
	println("DISK SIZE RETURNING: ", diskSize.Total/1024/1024/1024)
	return diskSize.Total / 1024 / 1024 / 1024
}

// Get smart result
func GetSmartInfo() []string {

	// Gets a list of drives
	smartScan, err := exec.Command("smartctl", "--scan").CombinedOutput()
	if err != nil {
		log.Fatalf(err.Error())
		var errMessage []string
		errMessage[0] = err.Error()
		return errMessage
	}

	// Splits the list of drives by newline
	smartList := strings.Split(string(smartScan), "\n")

	// Creates an array of arrays containing split up commands
	// for input into smartctl -H
	var smartArr = make([][]string, len(smartList))
	for i := 0; i < len(smartList); i++ {
		smartArr[i] = strings.Split(smartList[i], " ")
	}

	// Creates smartResults array and gets the result of smartctl -H
	// into it for each drive.
	var smartResults = make([][]byte, len(smartArr))
	for i := 0; i < len(smartArr)-1; i++ {
		var currArr = smartArr[i]
		smartResults[i], err = exec.Command("smartctl", "-H", currArr[0], currArr[1], currArr[2]).CombinedOutput()
		if err != nil {
			log.Fatalf(err.Error())
			var errMessage []string
			errMessage[0] = err.Error()
			return errMessage
		}
	}

	var smartResultsStringified = make([]string, len(smartArr))
	for i := 0; i < len(smartArr)-1; i++ {
		smartResultsStringified[i] = string(smartResults[i])
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
	r := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	r.Use(cors.New(config))
	api := r.Group("/api")
	api.POST("/login", Login)
	GetSmartInfo()
	serverinfo := api.Group("/serverinfo").Use(middleware.Auth())

	serverinfo.GET("/disk", func(c *gin.Context) {

		println("Running /disk")

		var req GetReq
		if err := c.Bind(&req); err != nil {
			println("ERROR WITH BIND: ", err)
		}

		c.JSON(200, gin.H{
			"hostName": GetHostname(),
			"diskUsed": GetDiskUsage(),
			"diskSize": GetDiskSize(),
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
			"diskUsed":      GetDiskUsage(),
			"diskSize":      GetDiskSize(),
			"upgrades":      GetUpgradeable(),
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
