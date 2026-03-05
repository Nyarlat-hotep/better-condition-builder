export function treeToString(node) {
  if (node.type === 'condition') {
    const field = node.field ?? '?'
    const value = node.value ?? '?'
    return `${field} ${node.operator} ${value}`
  }
  // group
  if (!node.children || node.children.length === 0) return '()'
  const parts = node.children.map(treeToString)
  return `(${parts.join(` ${node.connector} `)})`
}

export function rootToString(root) {
  if (!root.children || root.children.length === 0) return ''
  return root.children.map(treeToString).join(` ${root.connector} `)
}
