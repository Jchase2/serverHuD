package main

import (
	"fmt"
	"log"
	"os/exec"
	"strconv"
	"strings"

	"github.com/shirou/gopsutil/disk"
)

// GetDiskUsage gets remaining disk space in GB for curr partition.
func GetDiskUsage(device string) uint64 {
	var diskUsage, _ = disk.Usage(device)
	return diskUsage.Free / 1024 / 1024 / 1024
}

// Get Disk Size gets total disk space.
func GetDiskSize(device string) uint64 {
	cmd := exec.Command("df", "-h", device, "|", "sed", "1d")
	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Fatalf("cmd.Run() failed with %s\n", err)
	} else if out != nil {
		var diskSize, _ = disk.Usage(device)
		return diskSize.Total / 1024 / 1024 / 1024
	}
	return 0
}

func ConvertMbToGb(mbString string) float64 {
	mbString = strings.TrimRight(mbString, "M")
	fmt.Println("STRING IS: ", mbString)
	var valueInMb, err = strconv.ParseFloat(mbString, 64)
	if err != nil {
		fmt.Println("MB TO GB CONVERSION ERROR: ", err)
	}
	var valueInGb = valueInMb / 1024
	return valueInGb
}

type DiskInfo struct {
	FileSystem string
	DiskSize   uint64
	DiskUsed   uint64
}

func GetDiskInfo(device string) map[string]string {
	var retDiskInfo = make(map[string]string)
	df := exec.Command("df", "-BM", device)
	sed := exec.Command("sed", "1d")
	awk := exec.Command("awk", "{$1=$1}1")
	pipe, _ := df.StdoutPipe()
	defer pipe.Close()
	sed.Stdin = pipe
	pipe2, _ := sed.StdoutPipe()
	defer pipe2.Close()
	awk.Stdin = pipe2
	df.Start()
	sed.Start()
	res, err := awk.Output()
	if err != nil {
		log.Fatalf("cmd.Run() failed with %s\n", err)
	}
	lines := strings.Split(strings.TrimSpace(string(res)), " ")
	retDiskInfo["FileSystem"] = lines[0]
	retDiskInfo["DiskSize"] = strconv.FormatFloat(ConvertMbToGb(lines[1]), 'f', 1, 64)
	retDiskInfo["DiskUsed"] = strconv.FormatFloat(ConvertMbToGb(lines[2]), 'f', 1, 64)
	return retDiskInfo
}

// Requires lsblk to be installed on host system.
func GetDiskList() [][]string {

	// Get list of disks
	cmd := exec.Command("lsblk", "-n", "-d", "-o", "NAME,TYPE,SIZE")
	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Fatalf("cmd.Run() failed with %s\n", err)
	}

	// Split strings by newline and trim
	lines := strings.Split(strings.TrimSpace(string(out)), "\n")

	var devices [][]string

	// Loop over lines to create array of arrays
	for _, line := range lines {
		fields := strings.Fields(line)
		if len(fields) == 3 {
			grep := exec.Command("grep", "/dev/"+fields[0], "/proc/mounts")
			out, grepErr := grep.CombinedOutput()
			if grepErr != nil {
				fmt.Println("DISK LIST GREP ERROR (this is usually ok): ", grepErr)
			} else if out != nil {
				device := []string{"/dev/" + fields[0], fields[1], fields[2]}
				devices = append(devices, device)
			}
		}
	}
	return devices
}

// CombinedDiskInfo struct
type CombinedDiskInfo struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Size     string `json:"diskSize"`
	DiskUsed string `json:"diskUsed"`
}

// Get combined data for disks.
func GetCombinedDiskInfo() []CombinedDiskInfo {
	var diskList = GetDiskList()
	var retArr []CombinedDiskInfo
	for _, innerArr := range diskList {
		var innerCdi CombinedDiskInfo

		var diskInformation = GetDiskInfo(innerArr[0])

		innerCdi = CombinedDiskInfo{
			Name:     innerArr[0],
			Type:     innerArr[1],
			Size:     diskInformation["DiskSize"],
			DiskUsed: diskInformation["DiskUsed"],
		}

		retArr = append(retArr, innerCdi)
	}
	// Gets marshalled while sending
	return retArr
}
