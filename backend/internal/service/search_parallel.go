package service

import (
	"fmt"
	"strings"

	"tubes-stima-backend/internal/dom"
	"tubes-stima-backend/internal/selector"
	"tubes-stima-backend/internal/traversal"
)

type ParallelSearchParams struct {
	Root      *dom.Node
	Algorithm string
	Selector  string
	Limit     int
	Workers   int
}

func SearchParallel(params ParallelSearchParams) (traversal.Result, error) {
	if params.Root == nil {
		return traversal.Result{}, fmt.Errorf("root DOM tidak boleh nil")
	}

	matcher, err := selector.BuildMatcher(params.Selector)
	if err != nil {
		return traversal.Result{}, fmt.Errorf("selector tidak valid: %w", err)
	}

	switch strings.ToLower(strings.TrimSpace(params.Algorithm)) {
	case "", "bfs":
		return traversal.ParallelBFS(params.Root, matcher, params.Limit, params.Workers), nil
	case "dfs":
		// DFS paralel bisa ditambahkan bertahap; sementara fallback ke DFS sekuensial.
		return traversal.DFS(params.Root, matcher, params.Limit), nil
	default:
		return traversal.Result{}, fmt.Errorf("algoritma %q tidak didukung, gunakan bfs atau dfs", params.Algorithm)
	}
}
