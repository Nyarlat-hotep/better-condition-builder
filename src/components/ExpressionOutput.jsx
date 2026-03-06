import './ExpressionOutput.css'

function renderNode(node, isRoot = false) {
  if (node.type === 'condition') {
    const field = node.field
      ? <span>{node.field}</span>
      : <span className="expr-incomplete">?</span>
    const value = node.value
      ? <span>{node.value}</span>
      : <span className="expr-incomplete">?</span>
    return (
      <>
        {field}
        {' '}
        <span className="expr-connector">{node.operator}</span>
        {' '}
        {value}
      </>
    )
  }

  // group
  if (!node.children || node.children.length === 0) {
    return isRoot ? null : (
      <>
        <span className="expr-paren">(</span>
        <span className="expr-paren">)</span>
      </>
    )
  }

  const parts = node.children.map((child, i) => (
    <span key={child.id}>
      {renderNode(child)}
      {i < node.children.length - 1 && (
        <span className="expr-connector"> {node.children[i + 1].connector ?? 'AND'} </span>
      )}
    </span>
  ))

  if (isRoot) return <>{parts}</>

  return (
    <>
      <span className="expr-paren">(</span>
      <span className="expr-group" style={{ '--group-color': node.color }}>{parts}</span>
      <span className="expr-paren">)</span>
    </>
  )
}

export default function ExpressionOutput({ tree }) {
  const isEmpty = !tree.children || tree.children.length === 0

  return (
    <div className="expression-output">
      <div className="expression-label">Expression output</div>
      <div className="expression-block">
        {isEmpty
          ? <span className="expression-empty">Add conditions to build an expression...</span>
          : renderNode(tree, true)
        }
      </div>
    </div>
  )
}
