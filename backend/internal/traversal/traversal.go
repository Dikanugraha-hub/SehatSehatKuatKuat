package traversal

import (
	"time"
	"tubes-stima-backend/internal/dom"
)

type MatchFunc func(*dom.Node) bool

type Result struct {
	Matches        []*dom.Node
	VisitedCount   int
	Duration       time.Duration
	TraversalLog   []string
	TraversalNodes []*dom.Node
}

func BFS(root *dom.Node, isMatch MatchFunc, limit int) Result {
	start := time.Now()
	result := initResult()

	if root == nil {
		return result
	}

	queue := []*dom.Node{root}
	foundEnough := false

	for len(queue) > 0 && !foundEnough {
		current := queue[0]
		queue = queue[1:]

		recordVisit(&result, current)

		if isMatch == nil || isMatch(current) {
			result.Matches = append(result.Matches, current)
			if limit > 0 && len(result.Matches) >= limit {
				foundEnough = true
				break
			}
		}

		queue = append(queue, current.Children...)
	}

	result.Duration = time.Since(start)
	return result
}

func DFS(root *dom.Node, isMatch MatchFunc, limit int) Result {
	start := time.Now()
	result := initResult()

	if root == nil {
		return result
	}

	stack := []*dom.Node{root}
	foundEnough := false

	for len(stack) > 0 && !foundEnough {
		lastIdx := len(stack) - 1
		current := stack[lastIdx]
		stack = stack[:lastIdx]

		recordVisit(&result, current)

		if isMatch == nil || isMatch(current) {
			result.Matches = append(result.Matches, current)
			if limit > 0 && len(result.Matches) >= limit {
				foundEnough = true
				break
			}
		}

		for i := len(current.Children) - 1; i >= 0; i-- {
			stack = append(stack, current.Children[i])
		}
	}

	result.Duration = time.Since(start)
	return result
}

func initResult() Result {
	return Result{
		Matches:        make([]*dom.Node, 0),
		TraversalLog:   make([]string, 0),
		TraversalNodes: make([]*dom.Node, 0),
	}
}

func recordVisit(res *Result, n *dom.Node) {
	res.VisitedCount++
	res.TraversalNodes = append(res.TraversalNodes, n)

	label := n.Tag
	if n.Attributes != nil {
		if id := n.Attributes["id"]; id != "" {
			label += "#" + id
		}
	}
	res.TraversalLog = append(res.TraversalLog, label)
}