package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHandleSearchSuccessWithHTML(t *testing.T) {
	app := &application{
		fetchHTML: func(_ string) (string, error) {
			return "", nil
		},
	}

	body := map[string]any{
		"html":      "<html><body><p class=\"x\">Halo</p></body></html>",
		"algorithm": "bfs",
		"selector":  "p.x",
		"limit":     1,
	}
	req := httptest.NewRequest(http.MethodPost, "/search", marshalBody(t, body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	app.routes().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status harus 200, dapat: %d body: %s", rec.Code, rec.Body.String())
	}

	var resp searchResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("response JSON tidak valid: %v", err)
	}

	if resp.MatchCount != 1 {
		t.Fatalf("match_count harus 1, dapat: %d", resp.MatchCount)
	}
	if len(resp.Matches) != 1 || resp.Matches[0].Tag != "p" {
		t.Fatalf("node match tidak sesuai: %+v", resp.Matches)
	}
	if resp.Matches[0].UID == "" {
		t.Fatalf("uid node match tidak boleh kosong")
	}
	if resp.Matches[0].Index < 0 {
		t.Fatalf("node_index tidak valid, dapat: %d", resp.Matches[0].Index)
	}
	if resp.Matches[0].Depth < 1 {
		t.Fatalf("depth node match tidak valid, dapat: %d", resp.Matches[0].Depth)
	}
	if !strings.Contains(resp.Matches[0].Path, "p.x") {
		t.Fatalf("path node match tidak sesuai, dapat: %q", resp.Matches[0].Path)
	}
	if resp.MaxDepth < resp.Matches[0].Depth {
		t.Fatalf("max_depth tidak valid, dapat: %d", resp.MaxDepth)
	}
	if len(resp.Tree) == 0 {
		t.Fatalf("tree tidak boleh kosong")
	}
	if resp.Tree[0].UID != "root" {
		t.Fatalf("node root pada tree tidak sesuai: %+v", resp.Tree[0])
	}
	if len(resp.TraversalSequence) == 0 {
		t.Fatalf("traversal_sequence tidak boleh kosong")
	}
	if len(resp.TraversalSequence) != resp.VisitedCount {
		t.Fatalf("panjang traversal_sequence salah, dapat: %d", len(resp.TraversalSequence))
	}
	if resp.TraversalSequence[0] != "root" {
		t.Fatalf("traversal_sequence harus diawali root, dapat: %q", resp.TraversalSequence[0])
	}
	foundMatchedUID := false
	for _, uid := range resp.TraversalSequence {
		if uid == resp.Matches[0].UID {
			foundMatchedUID = true
			break
		}
	}
	if !foundMatchedUID {
		t.Fatalf("uid matched node tidak ditemukan pada traversal_sequence")
	}
}

func TestHandleSearchSuccessWithURL(t *testing.T) {
	app := &application{
		fetchHTML: func(_ string) (string, error) {
			return "<html><body><div><span id=\"a\">X</span></div></body></html>", nil
		},
	}

	body := map[string]any{
		"url":       "https://example.com",
		"algorithm": "dfs",
		"selector":  "div > span#a",
		"limit":     2,
	}
	req := httptest.NewRequest(http.MethodPost, "/search", marshalBody(t, body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	app.routes().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status harus 200, dapat: %d body: %s", rec.Code, rec.Body.String())
	}
}

func TestHandleSearchValidationErrors(t *testing.T) {
	app := &application{
		fetchHTML: func(_ string) (string, error) {
			return "", nil
		},
	}

	tests := []map[string]any{
		{"algorithm": "bfs", "selector": "p"},
		{"url": "https://example.com", "html": "<html></html>", "algorithm": "bfs", "selector": "p"},
	}

	for _, body := range tests {
		req := httptest.NewRequest(http.MethodPost, "/search", marshalBody(t, body))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		app.routes().ServeHTTP(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("status harus 400, dapat: %d body: %s", rec.Code, rec.Body.String())
		}
	}
}

func TestHandleSearchInvalidHTML(t *testing.T) {
	app := &application{
		fetchHTML: func(_ string) (string, error) {
			return "", nil
		},
	}

	body := map[string]any{
		"html":      "<html><body><div><p>bad</div></body></html>",
		"algorithm": "bfs",
		"selector":  "p",
		"limit":     1,
	}
	req := httptest.NewRequest(http.MethodPost, "/search", marshalBody(t, body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	app.routes().ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status harus 400 untuk HTML invalid, dapat: %d body: %s", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), "gagal parse HTML") {
		t.Fatalf("response error harus berisi gagal parse HTML, dapat: %s", rec.Body.String())
	}
}

func TestHandleSearchMethodNotAllowed(t *testing.T) {
	app := &application{}

	req := httptest.NewRequest(http.MethodGet, "/search", nil)
	rec := httptest.NewRecorder()

	app.routes().ServeHTTP(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status harus 405, dapat: %d", rec.Code)
	}
}

func marshalBody(t *testing.T, v any) *bytes.Buffer {
	t.Helper()

	b, err := json.Marshal(v)
	if err != nil {
		t.Fatalf("gagal marshal JSON: %v", err)
	}
	return bytes.NewBuffer(b)
}
