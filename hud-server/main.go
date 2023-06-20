package main

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"os/exec"
	"time"

	"github.com/JChase2/hud-server/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/shirou/gopsutil/disk"
	"github.com/shirou/gopsutil/host"
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
	{
		r.POST("/login", Login)

		secured := api.Group("/secured").Use(middleware.Auth())
		{
			secured.GET("/serverinfo", func(c *gin.Context) {
				var req GetReq
				c.BindJSON(&req)
				c.JSON(200, gin.H{
					"hostName":              GetHostname(),
					"uptimeInHours":         GetUptime(),
					"gbFreeOnCurrPartition": GetDiskUsage(),
					"upgrades":              GetUpgradeable(),
				})
			})

		}
	}
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
