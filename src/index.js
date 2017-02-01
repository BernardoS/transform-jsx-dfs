const TEXT_NODE = 'text'
const OPEN_ELEMENT =  'open'
const CLOSE_ELEMENT = 'close'
const FUNCTION = 'func'

export default function({ types: t }) {
  console.log(t)
  return {
    visitor: {
      JSXElement: {
        exit (path){
          const name = path.get('openingElement').get('name').get('name').node
          const expr = [t.callExpression(t.Identifier(OPEN_ELEMENT), [t.stringLiteral(name)])]
          .concat(path.get('children').map(child => child.node))
          .concat(t.callExpression(t.Identifier(CLOSE_ELEMENT), [t.stringLiteral(name)]))
          path.replaceWithMultiple(expr)
        }
      },
      JSXText (path) {
        const text = path.node.value.trim().replace(/\n/, '')
        if (text) path.replaceWith(t.callExpression(t.Identifier(TEXT_NODE), [t.stringLiteral(text)]))
        else path.remove()
      },
      JSXExpressionContainer (path) {
        path.replaceWith(t.callExpression(t.Identifier(FUNCTION), [path.get('expression')]))
        // path.replaceWith(path.get('expression'))
      },
      JSXEmptyExpression (path) {
        path.replaceWith(t.emptyStatement())
      }
    }
  }
}
