export function treeToString(node) {
  if (node.type === 'condition') {
    const field = node.field ?? '?'
    const value = node.value ?? '?'
    return `${field} ${node.operator} ${value}`
  }
  // group — connector lives on each child (operator between prev sibling and this node)
  if (!node.children || node.children.length === 0) return '()'
  const parts = node.children.map(treeToString)
  let str = parts[0]
  for (let i = 1; i < parts.length; i++) {
    str += ` ${node.children[i].connector} ` + parts[i]
  }
  return `(${str})`
}

export function rootToString(root) {
  if (!root.children || root.children.length === 0) return ''
  const parts = root.children.map(treeToString)
  let str = parts[0]
  for (let i = 1; i < parts.length; i++) {
    str += ` ${root.children[i].connector} ` + parts[i]
  }
  return str
}
