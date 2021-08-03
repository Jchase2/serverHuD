package main

import (
	"crypto/rand"
	"crypto/tls"
	b64 "encoding/base64"
	"fmt"
	"log"
	"net"
	"net/http"
	"os/exec"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/disk"
	"github.com/shirou/gopsutil/host"
)

var configUrl = "http://jamesdchase.com"

// GenerateAPIKey creates a key for
// the API upon setup, unused for now
func GenerateAPIKey() string {
	key := make([]byte, 64)

	_, err := rand.Read(key)
	if err != nil {
		return "Key generation error!"
	}
	return b64.StdEncoding.EncodeToString(key)
}

// GetStatus returns http status of url or ip
func GetStatus(url string) string {
	resp, err := http.Get(url)
	if err != nil {
		return err.Error()
	} else if resp.StatusCode == 200 {
		return "Up"
	}
	return strconv.Itoa(resp.StatusCode)
}

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

//GetCertStatus returns cert expiration for url
func GetCertStatus(url string, port string) string {

	conn, err := net.Dial("tcp", url+":"+port)
	if err != nil {
		fmt.Println("NO")
		return err.Error()
	}
	client := tls.Client(conn, &tls.Config{
		ServerName: url,
	})
	defer client.Close()

	if err := client.Handshake(); err != nil {
		fmt.Println("Client handshake error")
		return err.Error()
	}

	cert := client.ConnectionState().PeerCertificates[0]
	var retMeUnformatted = cert.NotAfter.Format(time.RFC3339)
	var retMe = strings.Split(retMeUnformatted, "T")
	return retMe[0]
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

// GetDiskUsage gets remaining disk space in GB for curr partition.
func GetDiskUsage() uint64 {
	var diskUsage, _ = disk.Usage("./")
	return diskUsage.Free / 1024 / 1024 / 1024
}

func main() {
	// Server and CORS setup.
	r := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	r.Use(cors.New(config))
	// Return JSON API
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"hostName":              GetHostname(),
			"uptimeInHours":         GetUptime(),
			"gbFreeOnCurrPartition": GetDiskUsage(),
			"certExpires":           GetCertStatus(configUrl, "443"),
			"upOrDown":              GetStatus(configUrl),
			"upgrades":              GetUpgradeable(),
		})
	})
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
