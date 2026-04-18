package parser

import (
	"testing"

	"tubes-stima-backend/internal/dom"
)

func TestParseHTMLBuildsDOMTree(t *testing.T) {
	input := `
<!doctype html>
<html>
  <head>
    <title>Contoh</title>
  </head>
  <body id="main-body">
    <h1 class="title">Halo Dunia</h1>
    <p>Paragraf <span>uji</span> parser.</p>
  </body>
</html>`

	root, err := ParseHTML(input)
	if err != nil {
		t.Fatalf("ParseHTML harusnya sukses, error: %v", err)
	}

	if root.Tag != "html" {
		t.Fatalf("root harus html, dapat: %q", root.Tag)
	}

	head := findChildByTag(root, "head")
	if head == nil {
		t.Fatalf("elemen head tidak ditemukan")
	}

	body := findChildByTag(root, "body")
	if body == nil {
		t.Fatalf("elemen body tidak ditemukan")
	}
	if body.Attributes["id"] != "main-body" {
		t.Fatalf("atribut id body salah, dapat: %q", body.Attributes["id"])
	}

	h1 := findChildByTag(body, "h1")
	if h1 == nil {
		t.Fatalf("elemen h1 tidak ditemukan")
	}
	if len(h1.Children) != 1 {
		t.Fatalf("h1 harus punya 1 child")
	}
	if h1.Children[0].Content != "Halo Dunia" {
		t.Fatalf("konten h1 salah")
	}
	if h1.Attributes["class"] != "title" {
		t.Fatalf("atribut class h1 salah, dapat: %q", h1.Attributes["class"])
	}

	p := findChildByTag(body, "p")
	if p == nil {
		t.Fatalf("elemen p tidak ditemukan")
	}
	if len(p.Children) != 3 {
		t.Fatalf("p harus punya 3 child (#text, span, #text)")
	}

	if p.Children[0].Content != "Paragraf" {
		t.Fatalf("text pertama salah")
	}
	if p.Children[1].Tag != "span" {
		t.Fatalf("child kedua harus span")
	}
	if p.Children[2].Content != "parser." {
		t.Fatalf("text terakhir salah")
	}
	if p.Children[0].Tag != "#text" {
		t.Fatalf("child pertama harus text node")
	}
	if p.Children[2].Tag != "#text" {
		t.Fatalf("child terakhir harus text node")
	}
}

func TestParseHTMLEmptyInput(t *testing.T) {
	_, err := ParseHTML("   ")
	if err == nil {
		t.Fatalf("input kosong harus menghasilkan error")
	}
}

func findChildByTag(parent *dom.Node, tag string) *dom.Node {
	for _, child := range parent.Children {
		if child.Tag == tag {
			return child
		}
	}
	return nil
}

func TestParseHTMLScript(t *testing.T) {
	input := `<html><body><script>if (a < b) {}</script></body></html>`

	root, err := ParseHTML(input)
	if err != nil {
		t.Fatalf("error: %v", err)
	}

	body := findChildByTag(root, "body")
	if body == nil {
		t.Fatalf("body tidak ditemukan")
	}

	script := findChildByTag(body, "script")
	if script == nil {
		t.Fatalf("script tidak ditemukan")
	}

	if len(script.Children) != 1 {
		t.Fatalf("script harus punya 1 text node")
	}
	if script.Children[0].Tag != "#text" {
		t.Fatalf("script child harus text node")
	}
	if script.Children[0].Content == "" {
		t.Fatalf("script content tidak boleh kosong")
	}
}
