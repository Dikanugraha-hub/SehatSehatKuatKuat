package dom

type Node struct {
	Tag        string
	Attributes map[string]string
	Content    string
	Children   []*Node
	Parent     *Node
}

func NewNode(tag string, attributes map[string]string, content string) *Node {
	return &Node{
		Tag:        tag,
		Attributes: attributes,
		Content:    content,
		Children:   make([]*Node, 0),
	}
}

func (n *Node) AddChild(child *Node) {
	if child == nil {
		return
	}

	child.Parent = n
	n.Children = append(n.Children, child)
}