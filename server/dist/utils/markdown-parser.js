import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { toString } from "mdast-util-to-string";
import { u } from "unist-builder";
/**
 * Splits a `mdast` tree into multiple trees based on
 * a predicate function. Will include the splitting node
 * at the beginning of each tree.
 *
 * Useful to split a markdown file into smaller sections.
 */
export function splitTreeBy(tree, predicate) {
    return tree.children.reduce((trees, node) => {
        const [lastTree] = trees.slice(-1);
        if (!lastTree || predicate(node)) {
            const tree = u("root", [node]);
            return trees.concat(tree);
        }
        lastTree.children.push(node);
        return trees;
    }, []);
}
/**
 * Splits markdown content by heading for embedding indexing.
 * Keeps heading in each chunk.
 *
 * If a section is still greater than `maxSectionLength`, that section
 * is chunked into smaller even-sized sections (by character length).
 */
export function processMarkdown(content, maxSectionLength = 2500) {
    const mdTree = fromMarkdown(content);
    if (!mdTree) {
        return {
            sections: [],
        };
    }
    const sectionTrees = splitTreeBy(mdTree, (node) => node.type === "heading");
    const sections = sectionTrees.flatMap((tree) => {
        const [firstNode] = tree.children;
        const content = toMarkdown(tree);
        const heading = firstNode?.type === "heading" ? toString(firstNode) : "General Context";
        // Chunk sections if they are too large
        if (content.length > maxSectionLength) {
            const chunks = [];
            // Split by lines to find better breakpoint for textbooks
            const lines = content.split("\n");
            let currentChunk = "";
            for (const line of lines) {
                if (currentChunk.length + line.length > maxSectionLength &&
                    currentChunk.length > 0) {
                    chunks.push(currentChunk.trim());
                    currentChunk = "";
                }
                currentChunk += line + "\n";
            }
            if (currentChunk)
                chunks.push(currentChunk.trim());
            return chunks.map((chunk) => ({
                // Prepend heading: This bakes the content into every chunk
                content: `Topic: ${heading}\n\n${chunk}`,
                heading,
            }));
        }
        return {
            content: `Topic: ${heading}\n\n${content}`,
            heading,
        };
    });
    return {
        sections,
    };
}
//# sourceMappingURL=markdown-parser.js.map