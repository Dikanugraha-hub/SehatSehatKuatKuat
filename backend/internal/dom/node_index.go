package dom

import (
	"fmt"
	"strings"
)

type IndexedNode struct {
	Node      *Node
	UID       string
	Index     int
	Depth     int
	ParentUID string
	Path      string
}

type Index struct {
	Ordered []*IndexedNode
	ByUID   map[string]*IndexedNode
	ByNode  map[*Node]*IndexedNode
}

func BuildIndex(root *Node) *Index {
	idx := &Index{
		ByUID:  make(map[string]*IndexedNode),
		ByNode: make(map[*Node]*IndexedNode),
	}

	if root == nil {
		return idx
	}

	queue := []*IndexedNode{{
		Node: root,
		UID:  "root",
		Path: nodeSegment(root),
	}}

	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]

		cur.Index = len(idx.Ordered)
		idx.Ordered = append(idx.Ordered, cur)
		idx.ByUID[cur.UID] = cur
		idx.ByNode[cur.Node] = cur

		for i, child := range cur.Node.Children {
			queue = append(queue, &IndexedNode{
				Node:      child,
				UID:       fmt.Sprintf("%s.%d", cur.UID, i),
				Depth:     cur.Depth + 1,
				ParentUID: cur.UID,
				Path:      fmt.Sprintf("%s > %s", cur.Path, nodeSegment(child)),
			})
		}
	}

	return idx
}

func nodeSegment(n *Node) string {
	if n == nil {
		return ""
	}

	if n.Attributes != nil {
		if id := n.Attributes["id"]; id != "" {
			return n.Tag + "#" + id
		}

		if class := n.Attributes["class"]; class != "" {
			firstClass := strings.Fields(class)[0]
			return n.Tag + "." + firstClass
		}
	}

	return n.Tag
}