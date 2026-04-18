package service

import (
	"reflect"
	"testing"

	"tubes-stima-backend/internal/dom"
)

func TestSearchBFSAndDFSDifferentOrder(t *testing.T) {
	root := buildTree()

	bfsResult, err := Search(SearchParams{
		Root:      root,
		Algorithm: "bfs",
		Selector:  ".target",
		Limit:     0,
	})
	if err != nil {
		t.Fatalf("search BFS tidak boleh error: %v", err)
	}

	dfsResult, err := Search(SearchParams{
		Root:      root,
		Algorithm: "dfs",
		Selector:  ".target",
		Limit:     0,
	})
	if err != nil {
		t.Fatalf("search DFS tidak boleh error: %v", err)
	}

	bfsTags := tagsFromNodes(bfsResult.Matches)
	dfsTags := tagsFromNodes(dfsResult.Matches)

	if !reflect.DeepEqual(bfsTags, []string{"p", "span"}) {
		t.Fatalf("urutan BFS salah, dapat: %v", bfsTags)
	}
	if !reflect.DeepEqual(dfsTags, []string{"span", "p"}) {
		t.Fatalf("urutan DFS salah, dapat: %v", dfsTags)
	}
}

func TestSearchSupportsCombinatorAndLimit(t *testing.T) {
	root := buildTree()

	result, err := Search(SearchParams{
		Root:      root,
		Algorithm: "BFS",
		Selector:  "body > p.target",
		Limit:     1,
	})
	if err != nil {
		t.Fatalf("search tidak boleh error: %v", err)
	}

	got := tagsFromNodes(result.Matches)
	want := []string{"p"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("hasil match salah, dapat: %v, ingin: %v", got, want)
	}
}

func TestSearchInvalidInputs(t *testing.T) {
	root := buildTree()

	_, err := Search(SearchParams{
		Root:      root,
		Algorithm: "random",
		Selector:  "div",
	})
	if err == nil {
		t.Fatalf("algoritma invalid harus menghasilkan error")
	}

	_, err = Search(SearchParams{
		Root:      root,
		Algorithm: "bfs",
		Selector:  "div >",
	})
	if err == nil {
		t.Fatalf("selector invalid harus menghasilkan error")
	}

	_, err = Search(SearchParams{
		Root:      nil,
		Algorithm: "bfs",
		Selector:  "div",
	})
	if err == nil {
		t.Fatalf("root nil harus menghasilkan error")
	}
}

func buildTree() *dom.Node {
	html := dom.NewNode("html", nil, "")
	body := dom.NewNode("body", nil, "")
	div := dom.NewNode("div", map[string]string{"class": "wrapper"}, "")
	span := dom.NewNode("span", map[string]string{"class": "target"}, "dalam div")
	p := dom.NewNode("p", map[string]string{"class": "target"}, "langsung body")

	html.AddChild(body)
	body.AddChild(div)
	div.AddChild(span)
	body.AddChild(p)

	return html
}

func tagsFromNodes(nodes []*dom.Node) []string {
	tags := make([]string, 0, len(nodes))
	for _, n := range nodes {
		tags = append(tags, n.Tag)
	}
	return tags
}
