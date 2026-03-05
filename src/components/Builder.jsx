export default function Builder({ tree }) {
  return <div style={{ color: 'rgba(220,210,240,0.4)', fontFamily: 'monospace', fontSize: '0.75rem' }}>Builder — {tree.children.length} children</div>
}
