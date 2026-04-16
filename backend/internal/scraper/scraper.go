package scraper

import (
	"fmt"
	"io"
	"net/http"
	"time"
)

func FetchHTML(url string) (string, error) {
	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return "", fmt.Errorf("kurir gagal mencapai alamat %s: %w", url, err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("server menolak permintaan (Status HTTP: %d)", resp.StatusCode)
	}

	htmlBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("berhasil menghubungi server, tapi gagal membaca isi dokumen HTML: %w", err)
	}

	return string(htmlBytes), nil
}
