package scraper

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestFetchHTML_SkenarioSukses(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("<html><body><h1>Halo dari Server Bohongan</h1></body></html>"))
	}))

	defer mockServer.Close()

	htmlResult, err := FetchHTML(mockServer.URL)

	if err != nil {
		t.Fatalf("Ekspektasi sukses, tapi malah mendapat error: %v", err)
	}

	expectedContent := "<h1>Halo dari Server Bohongan</h1>"
	if !strings.Contains(htmlResult, expectedContent) {
		t.Errorf("Isi HTML tidak sesuai.\nEkspektasi mengandung: %s\nRealita mendapat: %s", expectedContent, htmlResult)
	}
}

func TestFetchHTML_SkenarioHalamanTidakDitemukan(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound) // HTTP 404
		w.Write([]byte("Halaman tidak ada bro"))
	}))
	defer mockServer.Close()

	_, err := FetchHTML(mockServer.URL)

	if err == nil {
		t.Fatal("Ekspektasi error karena status 404, tapi fungsi menganggapnya sukses")
	}

	if !strings.Contains(err.Error(), "404") {
		t.Errorf("Pesan error tidak mencantumkan status code HTTP yang bermasalah. Pesan asli: %v", err)
	}
}