export function algoritmaDFS(rootNode: Element | null, cssSelector: string): Element[] {

    if (!rootNode) return [];
    
    const results: Element[] = [];
    
    const stack: Element[] = [rootNode];

    while (stack.length > 0) {
        const currentNode = stack.pop();
        if (!currentNode) continue;

        if (currentNode.matches(cssSelector)) {
            results.push(currentNode);
        }

        const children = currentNode.children;
        for (let i = children.length - 1; i >= 0; i--) {
            stack.push(children[i]);
        }
    }

    return results;
}