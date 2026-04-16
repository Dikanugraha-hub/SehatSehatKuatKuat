package traversal

import (
	"reflect"
	"testing"
	"tubes-stima-backend/internal/dom"
)

// html
// └── body
//     ├── div#first
//     │   └── span
//     ├── p
//     └── a

func buildMiniDOM() *dom.Node {
	html := dom.NewNode("html", nil, "")
	body := dom.NewNode("body", nil, "")
	div := dom.NewNode("div", map[string]string{"id": "first"}, "")
	p := dom.NewNode("p", nil, "teks")
	span := dom.NewNode("span", nil, "inside div")
	a := dom.NewNode("a", nil, "link")

	html.AddChild(body)
	body.AddChild(div)
	body.AddChild(p)
	body.AddChild(a)
	div.AddChild(span)

	return html
}

func TestBFS_MenyapuRataPerLantai(t *testing.T) {
	root := buildMiniDOM()

	kriteria := func(n *dom.Node) bool {
		return n.Tag == "p" || n.Tag == "a" || n.Tag == "span"
	}

	result := BFS(root, kriteria, 2)

	expectedLog := []string{"html", "body", "div#first", "p", "a"}
	if !reflect.DeepEqual(result.TraversalLog, expectedLog) {
		t.Errorf("Jejak BFS melenceng.\nEkspektasi: %v\nRealita: %v", expectedLog, result.TraversalLog)
	}

	if result.VisitedCount != 5 {
		t.Errorf("Jumlah ruangan yang dimasuki salah, diharapkan 5, didapat %d", result.VisitedCount)
	}

	gotMatches := tagsFromNodes(result.Matches)
	expectedMatches := []string{"p", "a"}
	if !reflect.DeepEqual(gotMatches, expectedMatches) {
		t.Errorf("Hasil temuan BFS salah.\nEkspektasi: %v\nRealita: %v", expectedMatches, gotMatches)
	}
}

func TestDFS_MasukTerdalamDulu(t *testing.T) {
	root := buildMiniDOM()

	kriteria := func(n *dom.Node) bool {
		return n.Tag == "p" || n.Tag == "a" || n.Tag == "span"
	}

	result := DFS(root, kriteria, 0)

	expectedLog := []string{"html", "body", "div#first", "span", "p", "a"}
	if !reflect.DeepEqual(result.TraversalLog, expectedLog) {
		t.Errorf("Jejak DFS melenceng.\nEkspektasi: %v\nRealita: %v", expectedLog, result.TraversalLog)
	}

	gotMatches := tagsFromNodes(result.Matches)
	expectedMatches := []string{"span", "p", "a"}
	if !reflect.DeepEqual(gotMatches, expectedMatches) {
		t.Errorf("Hasil temuan DFS salah.\nEkspektasi: %v\nRealita: %v", expectedMatches, gotMatches)
	}
}

func tagsFromNodes(nodes []*dom.Node) []string {
	tags := make([]string, len(nodes))
	for i, n := range nodes {
		tags[i] = n.Tag
	}
	return tags
}
