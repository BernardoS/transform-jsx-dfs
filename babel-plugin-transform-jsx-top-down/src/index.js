const jsx = require('babel-plugin-syntax-jsx')

Object.defineProperty(exports, "__esModule", {value: true})

const OPENING_ELEMENT = 'openElement'
const CLOSING_ELEMENT = 'closeElement'
const APPEND = 'appendChild'

exports.default = function({types: t}) {
  return {
    inherits: jsx,
    visitor: {
      JSXElement: {
        exit (path, {opts}){
          const openingElement = path.get('openingElement')
          const selfClosing = path.node.openingElement.selfClosing
          const attributes = t.objectExpression(openingElement.get('attributes').map(attr => {
            let name = attr.get('elements')[0].node
            const value = attr.get('elements')[1].node
            if (t.isJSXIdentifier(name)) name = t.identifier(name.name)
            return t.objectProperty(name, value)
          }))
          let identifier = openingElement.get('name')
          identifier = identifier.isReferencedIdentifier() || identifier.node.name === 'this' ? identifier.node : t.stringLiteral(identifier.node.name)
          const expr = [t.callExpression(t.Identifier(opts.openingElement || OPENING_ELEMENT), [identifier, attributes, t.booleanLiteral(selfClosing)])]
          .concat(path.get('children').map(child => child.node))
          .concat(!selfClosing ? t.callExpression(t.Identifier(opts.closingElement ||  CLOSING_ELEMENT), [identifier]) : [])
          path.replaceWithMultiple(expr)
        }
      },
      JSXText (path, {opts}) {
        const text = path.node.value.trim().replace(/\n/, '')
        if (text) path.replaceWith(t.callExpression(t.Identifier(opts.pragma_append || APPEND), [t.stringLiteral(text)]))
        else path.remove()
      },
      JSXExpressionContainer (path, {opts}) {
        const expression = path.get('expression')
        path.replaceWith(t.callExpression(t.Identifier(opts.pragma_append || APPEND), [expression.node]))
      },
      JSXEmptyExpression (path) {
        path.replaceWith(t.emptyStatement())
      },
      JSXAttribute (path) {
        const value = path.get('value')
        const name = path.get('name')
        if (t.isJSXExpressionContainer(value)) {
          const expression = value.get('expression')
          if (t.isJSXElement(expression)) throw expression.buildCodeFrameError(`Element directly being invoked in attribute`)
          if (t.isTemplateLiteral(expression)) return path.replaceWith(t.arrayExpression([name.node, expression.node]))
          return path.replaceWith(t.arrayExpression([name.node, expression.node]))
        }
        path.replaceWith(t.arrayExpression([name.node, value.node || t.booleanLiteral(true)]))
      }
    }
  }
}
