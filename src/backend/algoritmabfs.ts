export function algoritmaBFS(rootNode: Element | null, cssSelector: string): Element[] {
    if (!rootNode) return [];

    const results: Element[] = [];
    
    const queue: Element[] = [rootNode];

    while (queue.length > 0) {
        const currentNode = queue.shift();
        if (!currentNode) continue;

        if (currentNode.matches(cssSelector)) {
            results.push(currentNode);
        }

        const children = currentNode.children;
        for (let i = 0; i < children.length; i++) {
            queue.push(children[i]);
        }
    }

    return results;
}