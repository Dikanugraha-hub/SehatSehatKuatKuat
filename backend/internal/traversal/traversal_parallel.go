package traversal

import (
	"time"
	"tubes-stima-backend/internal/dom"
)

func ParallelBFS(root *dom.Node, isMatch MatchFunc, limit int, workers int) Result {
	start := time.Now()
	result := initResult()

	if root == nil {
		return result
	}

	currentLevel := []*dom.Node{root}
	stopSearching := false

	for len(currentLevel) > 0 && !stopSearching {
		matchFlags := make([]bool, len(currentLevel))

		parallelFor(len(currentLevel), workers, func(i int) {
			node := currentLevel[i]
			if isMatch == nil || isMatch(node) {
				matchFlags[i] = true
			}
		})

		for i, node := range currentLevel {
			recordVisit(&result, node)

			if matchFlags[i] {
				result.Matches = append(result.Matches, node)
				if limit > 0 && len(result.Matches) >= limit {
					stopSearching = true
					break
				}
			}
		}

		if stopSearching {
			break
		}

		nextLevel := make([]*dom.Node, 0)
		for _, node := range currentLevel {
			nextLevel = append(nextLevel, node.Children...)
		}

		currentLevel = nextLevel
	}

	result.Duration = time.Since(start)
	return result
}
