function displayMath(node) {
  // Bare row breaks need a math environment; keep authors' explicit environments intact.
  const value = /\\\\/.test(node.value) && !/\\begin\s*\{/.test(node.value)
    ? `\\begin{gathered}\n${node.value}\n\\end{gathered}`
    : node.value;

  return {
    ...node,
    type: 'math',
    value,
    data: {
      hName: 'pre',
      hChildren: [{
        type: 'element',
        tagName: 'code',
        properties: { className: ['language-math', 'math-display'] },
        children: [{ type: 'text', value }],
      }],
    },
  };
}

function normalize(node) {
  if (node.type === 'math') return displayMath(node);
  if (node.type === 'paragraph') {
    const content = node.children.filter(child => child.type !== 'text' || child.value.trim());
    if (content.length === 1 && content[0].type === 'inlineMath') {
      return displayMath({ ...content[0], position: node.position });
    }
  }
  if (Array.isArray(node.children)) node.children = node.children.map(normalize);
  return node;
}

export default function remarkDisplayMath() {
  return normalize;
}
