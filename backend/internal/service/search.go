package service

import (
	"fmt"
	"strings"

	"tubes-stima-backend/internal/dom"
	"tubes-stima-backend/internal/selector"
	"tubes-stima-backend/internal/traversal"
)

type SearchParams struct {
	Root      *dom.Node
	Algorithm string
	Selector  string
	Limit     int
}

func Search(params SearchParams) (traversal.Result, error) {
	if params.Root == nil {
		return traversal.Result{}, fmt.Errorf("root DOM tidak boleh nil")
	}

	matcher, err := selector.BuildMatcher(params.Selector)
	if err != nil {
		return traversal.Result{}, fmt.Errorf("selector tidak valid: %w", err)
	}

	switch strings.ToLower(strings.TrimSpace(params.Algorithm)) {
	case "", "bfs":
		return traversal.ParallelBFS(params.Root, matcher, params.Limit, 4), nil
	case "dfs":
		return traversal.DFS(params.Root, matcher, params.Limit), nil
	default:
		return traversal.Result{}, fmt.Errorf("algoritma %q tidak didukung, gunakan bfs atau dfs", params.Algorithm)
	}
}
