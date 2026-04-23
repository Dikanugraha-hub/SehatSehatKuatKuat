package parser

import (
	"fmt"
	"strings"
	"unicode"

	"tubes-stima-backend/internal/dom"
)

func ParseHTML(htmlStr string) (*dom.Node, error) {
	if strings.TrimSpace(htmlStr) == "" {
		return nil, fmt.Errorf("input HTML tidak boleh kosong")
	}

	docRoot, err := buildDocumentTree(htmlStr)
	if err != nil {
		return nil, err
	}

	root := findRootElement(docRoot)
	if root == nil {
		return nil, fmt.Errorf("dokumen harus memiliki elemen <html>")
	}

	if findChildByTagName(root, "body") == nil {
		return nil, fmt.Errorf("dokumen harus memiliki elemen <body>")
	}
	root.Parent = nil

	return root, nil
}

func buildDocumentTree(input string) (*dom.Node, error) {
	docRoot := dom.NewNode("document", nil, "")
	stack := []*dom.Node{docRoot}

	lowerInput := strings.ToLower(input)

	i := 0
	for i < len(input) {
		if input[i] != '<' {
			nextTag := strings.IndexByte(input[i:], '<')
			textEnd := len(input)
			if nextTag >= 0 {
				textEnd = i + nextTag
			}

			appendText(stack[len(stack)-1], input[i:textEnd])
			i = textEnd
			continue
		}

		if strings.HasPrefix(input[i:], "<!--") {
			endComment := strings.Index(input[i+4:], "-->")
			if endComment < 0 {
				return nil, fmt.Errorf("komentar HTML tidak ditutup")
			}
			i += 4 + endComment + 3
			continue
		}

		if strings.HasPrefix(input[i:], "<!") {
			endDecl := strings.IndexByte(input[i:], '>')
			if endDecl < 0 {
				return nil, fmt.Errorf("deklarasi HTML tidak ditutup")
			}
			i += endDecl + 1
			continue
		}

		if strings.HasPrefix(input[i:], "</") {
			closeEnd := strings.IndexByte(input[i:], '>')
			if closeEnd < 0 {
				return nil, fmt.Errorf("tag penutup tidak lengkap")
			}

			tagName := normalizeTagName(input[i+2 : i+closeEnd])
			if tagName == "" {
				return nil, fmt.Errorf("nama tag penutup tidak valid")
			}
			if err := closeCurrentTag(&stack, tagName); err != nil {
				return nil, err
			}

			i += closeEnd + 1
			continue
		}

		tagEnd := findTagEnd(input, i)
		if tagEnd < 0 {
			return nil, fmt.Errorf("tag pembuka tidak ditutup")
		}

		tagContent := strings.TrimSpace(input[i+1 : tagEnd])
		if tagContent == "" {
			i = tagEnd + 1
			continue
		}

		selfClosing := strings.HasSuffix(tagContent, "/")
		if selfClosing {
			tagContent = strings.TrimSpace(strings.TrimSuffix(tagContent, "/"))
		}

		tagName, attrs := parseTag(tagContent)
		if tagName == "" {
			i = tagEnd + 1
			continue
		}

		node := dom.NewNode(tagName, attrs, "")
		parent := stack[len(stack)-1]
		parent.AddChild(node)

		if tagName == "script" || tagName == "style" {
			endTag := "</" + tagName + ">"

			endIdx := strings.Index(lowerInput[i:], strings.ToLower(endTag))
			if endIdx >= 0 {
				contentStart := tagEnd + 1
				contentEnd := i + endIdx

				appendText(node, input[contentStart:contentEnd])

				i = contentEnd + len(endTag)
				continue
			}
		}

		if !selfClosing && !isVoidTag(tagName) {
			stack = append(stack, node)
		}

		i = tagEnd + 1
	}

	if len(stack) > 1 {
		unclosedTag := stack[len(stack)-1].Tag
		return nil, fmt.Errorf("tag <%s> belum ditutup", unclosedTag)
	}

	return docRoot, nil
}

func findRootElement(n *dom.Node) *dom.Node {
	if n == nil {
		return nil
	}

	if n.Tag == "html" {
		return n
	}

	for _, child := range n.Children {
		if found := findRootElement(child); found != nil {
			return found
		}
	}

	return nil
}

func parseTag(content string) (string, map[string]string) {
	content = strings.TrimSpace(content)
	if content == "" {
		return "", nil
	}

	tagName := content
	rest := ""
	for idx, r := range content {
		if unicode.IsSpace(r) {
			tagName = content[:idx]
			rest = strings.TrimSpace(content[idx+1:])
			break
		}
	}

	tagName = normalizeTagName(tagName)
	if tagName == "" {
		return "", nil
	}

	attrs := parseAttributes(rest)
	return tagName, attrs
}

func parseAttributes(raw string) map[string]string {
	attrs := make(map[string]string)
	i := 0
	for i < len(raw) {
		for i < len(raw) && unicode.IsSpace(rune(raw[i])) {
			i++
		}
		if i >= len(raw) {
			break
		}

		start := i
		for i < len(raw) && isAttributeNameChar(raw[i]) {
			i++
		}
		if start == i {
			i++
			continue
		}

		key := strings.ToLower(strings.TrimSpace(raw[start:i]))
		if key == "" {
			continue
		}

		for i < len(raw) && unicode.IsSpace(rune(raw[i])) {
			i++
		}

		value := ""
		if i < len(raw) && raw[i] == '=' {
			i++
			for i < len(raw) && unicode.IsSpace(rune(raw[i])) {
				i++
			}

			if i < len(raw) && (raw[i] == '"' || raw[i] == '\'') {
				quote := raw[i]
				i++
				startVal := i
				for i < len(raw) && raw[i] != quote {
					i++
				}
				value = raw[startVal:i]
				if i < len(raw) {
					i++
				}
			} else {
				startVal := i
				for i < len(raw) && !unicode.IsSpace(rune(raw[i])) {
					i++
				}
				value = raw[startVal:i]
			}
		}

		attrs[key] = strings.TrimSpace(value)
	}

	return attrs
}

func findTagEnd(input string, start int) int {
	inQuote := byte(0)
	for i := start + 1; i < len(input); i++ {
		ch := input[i]
		if inQuote != 0 {
			if ch == inQuote {
				inQuote = 0
			}
			continue
		}

		if ch == '"' || ch == '\'' {
			inQuote = ch
			continue
		}
		if ch == '>' {
			return i
		}
	}
	return -1
}

func appendText(n *dom.Node, rawText string) {
	text := strings.TrimSpace(rawText)
	if text == "" || n == nil {
		return
	}

	textNode := dom.NewNode("#text", nil, text)
	n.AddChild(textNode)
}

func closeCurrentTag(stack *[]*dom.Node, tag string) error {
	if len(*stack) <= 1 {
		return fmt.Errorf("tag penutup </%s> tidak memiliki pasangan pembuka", tag)
	}

	current := (*stack)[len(*stack)-1]
	if current.Tag != tag {
		return fmt.Errorf("tag penutup </%s> tidak cocok dengan <%s>", tag, current.Tag)
	}

	*stack = (*stack)[:len(*stack)-1]
	return nil
}

func findChildByTagName(node *dom.Node, tag string) *dom.Node {
	if node == nil {
		return nil
	}
	for _, child := range node.Children {
		if child.Tag == tag {
			return child
		}
	}
	return nil
}

func normalizeTagName(raw string) string {
	tag := strings.ToLower(strings.TrimSpace(raw))
	if tag == "" {
		return ""
	}
	tag = strings.TrimPrefix(tag, "/")
	for i := 0; i < len(tag); i++ {
		if !isTagNameChar(tag[i]) {
			return ""
		}
	}
	return tag
}

func isTagNameChar(ch byte) bool {
	return (ch >= 'a' && ch <= 'z') ||
		(ch >= '0' && ch <= '9') ||
		ch == '-' || ch == '_' || ch == ':'
}

func isAttributeNameChar(ch byte) bool {
	return isTagNameChar(ch)
}

func isVoidTag(tag string) bool {
	switch tag {
	case "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr":
		return true
	default:
		return false
	}
}
