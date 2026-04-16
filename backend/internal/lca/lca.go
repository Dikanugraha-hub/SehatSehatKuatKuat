package lca

import (
	"fmt"
	"math/bits"

	"tubes-stima-backend/internal/dom"
)

type Engine struct {
	index     *dom.Index
	jumpTable [][]int
	depths    []int
	nodeMap   []*dom.IndexedNode
}

func Build(root *dom.Node) (*Engine, error) {
	idx := dom.BuildIndex(root)
	if len(idx.Ordered) == 0 {
		return nil, fmt.Errorf("pohon dom kosong")
	}

	totalNodes := len(idx.Ordered)
	maxJumps := bits.Len(uint(totalNodes))

	engine := &Engine{
		index:     idx,
		jumpTable: make([][]int, totalNodes),
		depths:    make([]int, totalNodes),
		nodeMap:   make([]*dom.IndexedNode, totalNodes),
	}

	for i, ref := range idx.Ordered {
		engine.jumpTable[i] = make([]int, maxJumps)
		for j := range engine.jumpTable[i] {
			engine.jumpTable[i][j] = -1
		}

		engine.depths[i] = ref.Depth
		engine.nodeMap[i] = ref

		if ref.ParentUID != "" {
			parent := idx.ByUID[ref.ParentUID]
			engine.jumpTable[i][0] = parent.Index
		}
	}

	for j := 1; j < maxJumps; j++ {
		for i := 0; i < totalNodes; i++ {
			midpoint := engine.jumpTable[i][j-1]

			if midpoint != -1 {
				engine.jumpTable[i][j] = engine.jumpTable[midpoint][j-1]
			}
		}
	}

	return engine, nil
}

func (e *Engine) FindLCA(uidA, uidB string) (*dom.IndexedNode, error) {
	if e == nil {
		return nil, fmt.Errorf("mesin LCA belum diinisialisasi")
	}

	nodeA, okA := e.index.ByUID[uidA]
	nodeB, okB := e.index.ByUID[uidB]

	if !okA || !okB {
		return nil, fmt.Errorf("salah satu atau kedua UID tidak ditemukan dalam pohon")
	}

	lcaIndex := e.calculateLCA(nodeA.Index, nodeB.Index)
	if lcaIndex == -1 {
		return nil, fmt.Errorf("LCA tidak ditemukan (struktur tidak valid)")
	}

	return e.nodeMap[lcaIndex], nil
}

func (e *Engine) calculateLCA(a, b int) int {
	if e.depths[a] < e.depths[b] {
		a, b = b, a
	}

	depthDiff := e.depths[a] - e.depths[b]
	for j := 0; depthDiff > 0; j++ {
		if depthDiff&1 == 1 {
			a = e.jumpTable[a][j]
		}
	}

	if a == b {
		return a
	}

	for j := len(e.jumpTable[a]) - 1; j >= 0; j-- {
		if e.jumpTable[a][j] != -1 && e.jumpTable[a][j] != e.jumpTable[b][j] {
			a = e.jumpTable[a][j]
			b = e.jumpTable[b][j]
		}
	}

	return e.jumpTable[a][0]
}
