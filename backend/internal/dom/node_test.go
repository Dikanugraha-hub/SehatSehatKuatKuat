package dom

import "testing"

func TestNewNode(t *testing.T) {
	attrs := map[string]string{"class": "container"}
	node := NewNode("div", attrs, "hello")

	if node.Tag != "div" {
		t.Errorf("Tag tidak sesuai: diharapkan 'div', mendapatkan '%s'", node.Tag)
	}

	if node.Attributes["class"] != "container" {
		t.Errorf("Atribut salah: diharapkan 'container', mendapatkan '%s'", node.Attributes["class"])
	}

	if node.Content != "hello" {
		t.Errorf("Konten salah: diharapkan 'hello', mendapatkan '%s'", node.Content)
	}

	if len(node.Children) != 0 {
		t.Errorf("Node baru seharusnya tidak punya anak, tapi terdeteksi %d anak", len(node.Children))
	}

	if node.Parent != nil {
		t.Error("Node baru yang berdiri sendiri seharusnya tidak memiliki Parent")
	}
}

func TestAddChild(t *testing.T) {
	parent := NewNode("body", nil, "")
	child := NewNode("h1", nil, "Judul Halaman")

	parent.AddChild(child)

	if len(parent.Children) != 1 {
		t.Fatalf("Gagal menambah anak: Parent seharusnya punya 1 anak, tapi tercatat %d", len(parent.Children))
	}

	if parent.Children[0] != child {
		t.Error("Anak yang tercatat di Parent bukanlah objek Node yang dimasukkan")
	}

	if child.Parent != parent {
		t.Error("Parent pada objek Child tidak diperbarui dengan benar")
	}
}

func TestAddChildNil(t *testing.T) {
	parent := NewNode("div", nil, "")
	parent.AddChild(nil)

	if len(parent.Children) != 0 {
		t.Fatalf("child nil tidak boleh ditambahkan")
	}
}