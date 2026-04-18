package selector

import (
	"fmt"
	"strings"
	"unicode"

	"tubes-stima-backend/internal/dom"
)

type combinator int

const (
	combinatorNone combinator = iota
	combinatorDescendant
	combinatorChild
	combinatorAdjacentSibling
	combinatorGeneralSibling
)

type simpleSelector struct {
	Tag     string
	ID      string
	Classes []string
}

type selectorStep struct {
	Combinator combinator
	Simple     simpleSelector
}

func BuildMatcher(selector string) (func(*dom.Node) bool, error) {
	steps, err := parseSelector(selector)
	if err != nil {
		return nil, err
	}

	return func(n *dom.Node) bool {
		return matchSteps(n, steps)
	}, nil
}

func Match(node *dom.Node, selector string) (bool, error) {
	matcher, err := BuildMatcher(selector)
	if err != nil {
		return false, err
	}
	return matcher(node), nil
}

func parseSelector(selector string) ([]selectorStep, error) {
	selector = strings.TrimSpace(selector)
	if selector == "" {
		return nil, fmt.Errorf("selector tidak boleh kosong")
	}

	normalized := strings.ReplaceAll(selector, ">", " > ")
	normalized = strings.ReplaceAll(normalized, "+", " + ")
	normalized = strings.ReplaceAll(normalized, "~", " ~ ")
	tokens := strings.Fields(normalized)
	if len(tokens) == 0 {
		return nil, fmt.Errorf("selector tidak valid")
	}

	steps := make([]selectorStep, 0, len(tokens))
	pending := combinatorDescendant

	for i, tok := range tokens {
		if tok == ">" || tok == "+" || tok == "~" {
			if i == 0 {
				return nil, fmt.Errorf("selector tidak boleh diawali kombinator %q", tok)
			}
			if pending != combinatorDescendant {
				return nil, fmt.Errorf("kombinator beruntun %q tidak valid", tok)
			}
			if tok == ">" {
				pending = combinatorChild
			} else if tok == "+" {
				pending = combinatorAdjacentSibling
			} else {
				pending = combinatorGeneralSibling
			}
			continue
		}

		parsed, err := parseSimpleSelector(tok)
		if err != nil {
			return nil, err
		}

		step := selectorStep{
			Combinator: pending,
			Simple:     parsed,
		}
		if len(steps) == 0 {
			step.Combinator = combinatorNone
		}
		steps = append(steps, step)
		pending = combinatorDescendant
	}

	lastTok := tokens[len(tokens)-1]
	if lastTok == ">" || lastTok == "+" || lastTok == "~" {
		return nil, fmt.Errorf("selector tidak boleh diakhiri kombinator %q", lastTok)
	}

	return steps, nil
}

func parseSimpleSelector(token string) (simpleSelector, error) {
	if token == "" {
		return simpleSelector{}, fmt.Errorf("selector sederhana kosong")
	}

	sel := simpleSelector{
		Classes: make([]string, 0),
	}

	i := 0
	if token[0] == '*' {
		sel.Tag = "*"
		i++
	} else if isTagStart(rune(token[0])) {
		start := i
		i++
		for i < len(token) && isTagPart(rune(token[i])) {
			i++
		}
		sel.Tag = token[start:i]
	}

	for i < len(token) {
		switch token[i] {
		case '#':
			i++
			start := i
			for i < len(token) && isIdentPart(rune(token[i])) {
				i++
			}
			if start == i {
				return simpleSelector{}, fmt.Errorf("id selector tidak valid di %q", token)
			}
			if sel.ID != "" {
				return simpleSelector{}, fmt.Errorf("id selector ganda tidak didukung di %q", token)
			}
			sel.ID = token[start:i]
		case '.':
			i++
			start := i
			for i < len(token) && isIdentPart(rune(token[i])) {
				i++
			}
			if start == i {
				return simpleSelector{}, fmt.Errorf("class selector tidak valid di %q", token)
			}
			sel.Classes = append(sel.Classes, token[start:i])
		default:
			return simpleSelector{}, fmt.Errorf("format selector tidak dikenali di %q", token)
		}
	}

	if sel.Tag == "" && sel.ID == "" && len(sel.Classes) == 0 {
		return simpleSelector{}, fmt.Errorf("selector %q tidak valid", token)
	}

	return sel, nil
}

func matchSteps(node *dom.Node, steps []selectorStep) bool {
	if node == nil || len(steps) == 0 {
		return false
	}

	if !matchesSimple(node, steps[len(steps)-1].Simple) {
		return false
	}

	current := node
	for i := len(steps) - 1; i > 0; i-- {
		comb := steps[i].Combinator
		target := steps[i-1].Simple

		switch comb {
		case combinatorChild:
			current = current.Parent
			if current == nil || !matchesSimple(current, target) {
				return false
			}
		case combinatorDescendant:
			ancestor := current.Parent
			found := false
			for ancestor != nil {
				if matchesSimple(ancestor, target) {
					current = ancestor
					found = true
					break
				}
				ancestor = ancestor.Parent
			}
			if !found {
				return false
			}
		case combinatorAdjacentSibling:
			parent := current.Parent
			if parent == nil {
				return false
			}
			var prevSibling *dom.Node
			for idx, child := range parent.Children {
				if child == current {
					if idx > 0 {
						prevSibling = parent.Children[idx-1]
					}
					break
				}
			}
			if prevSibling == nil || !matchesSimple(prevSibling, target) {
				return false
			}
			current = prevSibling
		case combinatorGeneralSibling:
			parent := current.Parent
			if parent == nil {
				return false
			}
			foundIndex := -1
			for idx, child := range parent.Children {
				if child == current {
					foundIndex = idx
					break
				}
			}
			if foundIndex == -1 {
				return false
			}
			found := false
			for idx := foundIndex - 1; idx >= 0; idx-- {
				if matchesSimple(parent.Children[idx], target) {
					current = parent.Children[idx]
					found = true
					break
				}
			}
			if !found {
				return false
			}
		default:
			return false
		}
	}

	return true
}

func matchesSimple(node *dom.Node, sel simpleSelector) bool {
	if node == nil {
		return false
	}

	if sel.Tag != "" && sel.Tag != "*" && node.Tag != sel.Tag {
		return false
	}

	if sel.ID != "" {
		if node.Attributes == nil {
			return false
		}
		if node.Attributes["id"] != sel.ID {
			return false
		}
	}

	if len(sel.Classes) > 0 {
		if node.Attributes == nil {
			return false
		}

		classValue := node.Attributes["class"]
		classTokens := strings.Fields(classValue)

		classSet := make(map[string]struct{})
		for _, c := range classTokens {
			classSet[c] = struct{}{}
		}

		for _, expected := range sel.Classes {
			if _, ok := classSet[expected]; !ok {
				return false
			}
		}
	}

	return true
}

func isTagStart(r rune) bool {
	return unicode.IsLetter(r)
}

func isTagPart(r rune) bool {
	return unicode.IsLetter(r) || unicode.IsDigit(r) || r == '-'
}

func isIdentPart(r rune) bool {
	return unicode.IsLetter(r) || unicode.IsDigit(r) || r == '-' || r == '_'
}
