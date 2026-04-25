package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"tubes-stima-backend/internal/dom"
	"tubes-stima-backend/internal/lca"
	"tubes-stima-backend/internal/parser"
	"tubes-stima-backend/internal/scraper"
	"tubes-stima-backend/internal/service"
)

type application struct {
	fetchHTML func(string) (string, error)
}

type searchRequest struct {
	URL       string `json:"url"`
	HTML      string `json:"html"`
	Algorithm string `json:"algorithm"`
	Selector  string `json:"selector"`
	Limit     int    `json:"limit"`
}

type matchedNodeResponse struct {
	UID     string            `json:"uid"`
	Index   int               `json:"node_index"`
	Tag     string            `json:"tag"`
	ID      string            `json:"id,omitempty"`
	Class   string            `json:"class,omitempty"`
	Content string            `json:"content,omitempty"`
	Depth   int               `json:"depth"`
	Path    string            `json:"path"`
	Attrs   map[string]string `json:"attributes,omitempty"`
}

type searchResponse struct {
	Matches           []matchedNodeResponse `json:"matches"`
	Tree              []treeNodeResponse    `json:"tree"`
	MatchCount        int                   `json:"match_count"`
	VisitedCount      int                   `json:"visited_count"`
	DurationMS        int64                 `json:"duration_ms"`
	MaxDepth          int                   `json:"max_depth"`
	TraversalLog      []string              `json:"traversal_log"`
	TraversalSequence []string              `json:"traversal_sequence"`
}

type treeNodeResponse struct {
	UID       string `json:"uid"`
	Index     int    `json:"node_index"`
	ParentUID string `json:"parent_uid,omitempty"`
	Tag       string `json:"tag"`
	ID        string `json:"id,omitempty"`
	Class     string `json:"class,omitempty"`
	Depth     int    `json:"depth"`
	Children  []int  `json:"children"`
}

type errorResponse struct {
	Error string `json:"error"`
}

type lcaRequest struct {
	URL       string `json:"url"`
	HTML      string `json:"html"`
	SelectorA string `json:"selector_a"`
	SelectorB string `json:"selector_b"`
}

type lcaResponse struct {
	NodeA   matchedNodeResponse `json:"node_a"`
	NodeB   matchedNodeResponse `json:"node_b"`
	LCANode matchedNodeResponse `json:"lca_node"`
}

func main() {
	addr := flag.String("addr", ":8080", "alamat server HTTP, contoh :8080")
	flag.Parse()

	app := &application{
		fetchHTML: scraper.FetchHTML,
	}

	server := &http.Server{
		Addr:              *addr,
		Handler:           app.routes(),
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("Server berjalan di %s", *addr)
	log.Fatal(server.ListenAndServe())
}

func (app *application) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/", app.handleRoot)
	mux.HandleFunc("/health", app.handleHealth)
	mux.HandleFunc("/search", app.handleSearch)
	mux.HandleFunc("/lca", app.handleLca)
	return withCORS(mux)
}

func (app *application) handleRoot(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, errorResponse{Error: "method tidak didukung"})
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	_, _ = w.Write([]byte("SehatSehatKuatKuat API is running"))
}

func (app *application) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, errorResponse{Error: "method tidak didukung"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (app *application) handleSearch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, errorResponse{Error: "gunakan method POST"})
		return
	}

	var req searchRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: "body JSON tidak valid"})
		return
	}

	htmlContent, err := resolveHTMLInput(req.URL, req.HTML, app.fetchHTML)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: err.Error()})
		return
	}

	root, err := parser.ParseHTML(htmlContent)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: fmt.Sprintf("gagal parse HTML: %v", err)})
		return
	}

	searchResult, err := service.Search(service.SearchParams{
		Root:      root,
		Algorithm: req.Algorithm,
		Selector:  req.Selector,
		Limit:     req.Limit,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: fmt.Sprintf("gagal search: %v", err)})
		return
	}

	nodeIndices := buildBFSNodeIndex(root)
	tree := buildTreeAdjacency(root, nodeIndices)

	matches := make([]matchedNodeResponse, 0, len(searchResult.Matches))
	for _, n := range searchResult.Matches {
		matches = append(matches, matchedNodeResponse{
			UID:     computeNodeUID(n),
			Index:   nodeIndices[n],
			Tag:     n.Tag,
			ID:      n.Attributes["id"],
			Class:   n.Attributes["class"],
			Content: extractInnerText(n),
			Depth:   computeNodeDepth(n),
			Path:    computeNodePath(n),
			Attrs:   n.Attributes,
		})
	}

	resp := searchResponse{
		Matches:           matches,
		Tree:              tree,
		MatchCount:        len(matches),
		VisitedCount:      searchResult.VisitedCount,
		DurationMS:        searchResult.Duration.Milliseconds(),
		MaxDepth:          computeMaxDepth(root),
		TraversalLog:      searchResult.TraversalLog,
		TraversalSequence: buildTraversalSequence(searchResult.TraversalNodes),
	}
	writeJSON(w, http.StatusOK, resp)
}

func (app *application) handleLca(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, errorResponse{Error: "gunakan method POST"})
		return
	}

	var req lcaRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: "body JSON tidak valid"})
		return
	}

	htmlContent, err := resolveHTMLInput(req.URL, req.HTML, app.fetchHTML)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: err.Error()})
		return
	}

	root, err := parser.ParseHTML(htmlContent)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: fmt.Sprintf("gagal parse HTML: %v", err)})
		return
	}

	searchA, err := service.Search(service.SearchParams{
		Root:      root,
		Algorithm: "bfs",
		Selector:  req.SelectorA,
		Limit:     1,
	})
	if err != nil || len(searchA.Matches) == 0 {
		writeJSON(w, http.StatusNotFound, errorResponse{Error: "Selector A tidak ditemukan"})
		return
	}

	searchB, err := service.Search(service.SearchParams{
		Root:      root,
		Algorithm: "bfs",
		Selector:  req.SelectorB,
		Limit:     1,
	})
	if err != nil || len(searchB.Matches) == 0 {
		writeJSON(w, http.StatusNotFound, errorResponse{Error: "Selector B tidak ditemukan"})
		return
	}

	engine, err := lca.Build(root)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, errorResponse{Error: fmt.Sprintf("gagal build lca engine: %v", err)})
		return
	}

	nodeA := searchA.Matches[0]
	nodeB := searchB.Matches[0]
	uidA := computeNodeUID(nodeA)
	uidB := computeNodeUID(nodeB)

	lcaNodeRaw, err := engine.FindLCA(uidA, uidB)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, errorResponse{Error: fmt.Sprintf("gagal mencari LCA: %v", err)})
		return
	}

	nodeIndices := buildBFSNodeIndex(root)

	respA := matchedNodeResponse{
		UID:     uidA,
		Index:   nodeIndices[nodeA],
		Tag:     nodeA.Tag,
		ID:      nodeA.Attributes["id"],
		Class:   nodeA.Attributes["class"],
		Content: extractInnerText(nodeA),
		Depth:   computeNodeDepth(nodeA),
		Path:    computeNodePath(nodeA),
		Attrs:   nodeA.Attributes,
	}

	respB := matchedNodeResponse{
		UID:     uidB,
		Index:   nodeIndices[nodeB],
		Tag:     nodeB.Tag,
		ID:      nodeB.Attributes["id"],
		Class:   nodeB.Attributes["class"],
		Content: extractInnerText(nodeB),
		Depth:   computeNodeDepth(nodeB),
		Path:    computeNodePath(nodeB),
		Attrs:   nodeB.Attributes,
	}

	respLca := matchedNodeResponse{
		UID:     lcaNodeRaw.UID,
		Index:   nodeIndices[lcaNodeRaw.Node],
		Tag:     lcaNodeRaw.Node.Tag,
		ID:      lcaNodeRaw.Node.Attributes["id"],
		Class:   lcaNodeRaw.Node.Attributes["class"],
		Content: extractInnerText(lcaNodeRaw.Node),
		Depth:   computeNodeDepth(lcaNodeRaw.Node),
		Path:    computeNodePath(lcaNodeRaw.Node),
		Attrs:   lcaNodeRaw.Node.Attributes,
	}

	resp := lcaResponse{
		NodeA:   respA,
		NodeB:   respB,
		LCANode: respLca,
	}

	writeJSON(w, http.StatusOK, resp)
}

func resolveHTMLInput(urlInput, htmlInput string, fetchHTML func(string) (string, error)) (htmlContent string, err error) {
	urlInput = strings.TrimSpace(urlInput)
	htmlInput = strings.TrimSpace(htmlInput)
	if htmlInput != "" && urlInput != "" {
		return "", fmt.Errorf("gunakan salah satu input saja: url atau html")
	}
	if htmlInput == "" && urlInput == "" {
		return "", fmt.Errorf("isi salah satu input: url atau html")
	}

	if htmlInput != "" {
		return htmlInput, nil
	}

	htmlContent, fetchErr := fetchHTML(urlInput)
	if fetchErr != nil {
		return "", fmt.Errorf("gagal scraping URL: %w", fetchErr)
	}

	return htmlContent, nil
}

func computeMaxDepth(root *dom.Node) int {
	if root == nil {
		return 0
	}

	maxChildDepth := 0
	for _, child := range root.Children {
		d := computeMaxDepth(child)
		if d > maxChildDepth {
			maxChildDepth = d
		}
	}
	return 1 + maxChildDepth
}

func computeNodeDepth(node *dom.Node) int {
	if node == nil {
		return 0
	}

	depth := 0
	for current := node.Parent; current != nil; current = current.Parent {
		depth++
	}
	return depth
}

func computeNodePath(node *dom.Node) string {
	if node == nil {
		return ""
	}

	segments := make([]string, 0)
	for current := node; current != nil; current = current.Parent {
		segment := current.Tag
		if id := current.Attributes["id"]; id != "" {
			segment += "#" + id
		} else if class := firstClass(current.Attributes["class"]); class != "" {
			segment += "." + class
		}
		segments = append(segments, segment)
	}

	reverseStrings(segments)
	return strings.Join(segments, " > ")
}

func firstClass(raw string) string {
	classTokens := strings.Fields(raw)
	if len(classTokens) == 0 {
		return ""
	}
	return classTokens[0]
}

func reverseStrings(items []string) {
	for left, right := 0, len(items)-1; left < right; left, right = left+1, right-1 {
		items[left], items[right] = items[right], items[left]
	}
}

func buildBFSNodeIndex(root *dom.Node) map[*dom.Node]int {
	indices := make(map[*dom.Node]int)
	nodes := flattenBFS(root)
	for idx, current := range nodes {
		indices[current] = idx
	}
	return indices
}

func flattenBFS(root *dom.Node) []*dom.Node {
	if root == nil {
		return nil
	}

	nodes := make([]*dom.Node, 0)
	queue := []*dom.Node{root}
	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]
		nodes = append(nodes, current)
		queue = append(queue, current.Children...)
	}
	return nodes
}

func buildTreeAdjacency(root *dom.Node, nodeIndices map[*dom.Node]int) []treeNodeResponse {
	nodes := flattenBFS(root)
	tree := make([]treeNodeResponse, 0, len(nodes))
	for _, n := range nodes {
		childIndices := make([]int, 0, len(n.Children))
		for _, child := range n.Children {
			childIndices = append(childIndices, nodeIndices[child])
		}

		parentUID := ""
		if n.Parent != nil {
			parentUID = computeNodeUID(n.Parent)
		}

		tree = append(tree, treeNodeResponse{
			UID:       computeNodeUID(n),
			Index:     nodeIndices[n],
			ParentUID: parentUID,
			Tag:       n.Tag,
			ID:        n.Attributes["id"],
			Class:     n.Attributes["class"],
			Depth:     computeNodeDepth(n),
			Children:  childIndices,
		})
	}

	return tree
}

func computeNodeUID(node *dom.Node) string {
	if node == nil {
		return ""
	}

	segments := make([]string, 0)
	current := node
	for current.Parent != nil {
		segments = append(segments, fmt.Sprintf("%d", childIndex(current.Parent, current)))
		current = current.Parent
	}
	segments = append(segments, "root")

	reverseStrings(segments)
	return strings.Join(segments, ".")
}

func childIndex(parent, child *dom.Node) int {
	for i, c := range parent.Children {
		if c == child {
			return i
		}
	}
	return -1
}

func buildTraversalSequence(nodes []*dom.Node) []string {
	sequence := make([]string, 0, len(nodes))
	for _, n := range nodes {
		sequence = append(sequence, computeNodeUID(n))
	}
	return sequence
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func extractInnerText(n *dom.Node) string {
	if n == nil {
		return ""
	}
	if n.Tag == "#text" {
		return n.Content
	}
	var sb strings.Builder
	for _, child := range n.Children {
		text := extractInnerText(child)
		if text != "" {
			if sb.Len() > 0 {
				sb.WriteString(" ")
			}
			sb.WriteString(text)
		}
	}
	return sb.String()
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
