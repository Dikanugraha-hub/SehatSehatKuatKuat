package selector

import (
	"testing"

	"tubes-stima-backend/internal/dom"
)

func TestMatchBasicSelectors(t *testing.T) {
	nodes := buildTree()

	assertMatch(t, nodes["div"], "div", true)
	assertMatch(t, nodes["div"], ".card", true)
	assertMatch(t, nodes["div"], ".card.highlight", true)
	assertMatch(t, nodes["body"], "#main-body", true)
	assertMatch(t, nodes["span"], ".card", false)
	assertMatch(t, nodes["span"], "*", true)
}

func TestMatchCombinators(t *testing.T) {
	nodes := buildTree()

	assertMatch(t, nodes["span"], "body span", true)
	assertMatch(t, nodes["span"], "body > span", false)
	assertMatch(t, nodes["div"], "body > div", true)
	assertMatch(t, nodes["span"], "body > div > span", true)
	assertMatch(t, nodes["p"], "html body > p.note", true)

	// test combinator sibling
	assertMatch(t, nodes["p"], "div + p", true)
	assertMatch(t, nodes["p"], "div ~ p", true)
	assertMatch(t, nodes["span"], "div + span", false)
	assertMatch(t, nodes["span"], "div ~ span", false)
}

func TestBuildMatcherErrors(t *testing.T) {
	invalid := []string{
		"",
		"> div",
		"div >",
		"div##a",
		"div..class",
	}

	for _, raw := range invalid {
		if _, err := BuildMatcher(raw); err == nil {
			t.Fatalf("selector %q harus error", raw)
		}
	}
}

func assertMatch(t *testing.T, node *dom.Node, selector string, want bool) {
	t.Helper()

	got, err := Match(node, selector)
	if err != nil {
		t.Fatalf("selector %q tidak boleh error: %v", selector, err)
	}

	if got != want {
		t.Fatalf("selector %q pada node %q: dapat %v, ingin %v", selector, node.Tag, got, want)
	}
}

func buildTree() map[string]*dom.Node {
	html := dom.NewNode("html", nil, "")
	body := dom.NewNode("body", map[string]string{"id": "main-body", "class": "container"}, "")
	div := dom.NewNode("div", map[string]string{"class": "card highlight"}, "")
	span := dom.NewNode("span", map[string]string{"class": "label"}, "judul")
	p := dom.NewNode("p", map[string]string{"class": "note"}, "isi")

	html.AddChild(body)
	body.AddChild(div)
	div.AddChild(span)
	body.AddChild(p)

	return map[string]*dom.Node{
		"html": html,
		"body": body,
		"div":  div,
		"span": span,
		"p":    p,
	}
}
