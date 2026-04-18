package lca

import (
	"fmt"
	"tubes-stima-backend/internal/dom"
)

func ExampleUsage(root *dom.Node) {
	engine, err := Build(root)
	if err != nil {
		fmt.Println("Gagal membangun sistem LCA:", err)
		return
	}

	lca1, _ := engine.FindLCA("root.0.1", "root.2")
	lca2, _ := engine.FindLCA("root.1.1.0", "root.1.1.2")

	fmt.Printf("LCA pertama ada di: %s\n", lca1.UID)
	fmt.Printf("LCA kedua ada di: %s\n", lca2.UID)
}