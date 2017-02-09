const jsx = require('babel-plugin-syntax-jsx')

Object.defineProperty(exports, "__esModule", {value: true})

const OPEN_ELEMENT = 'openElement'
const CLOSE_ELEMENT = 'closeElement'
const APPEND = 'appendChild'

exports.default = function({types: t}) {
  return {
    inherits: jsx,
    visitor: {
      JSXElement: {
        exit (path, {opts}){
          const openingElement = path.node.openingElement
          const selfClosing = openingElement.selfClosing
          const attributes = t.objectExpression(openingElement.attributes)
          let identifier = openingElement.name
          if (identifier.name === 'this') identifier = t.thisExpression()
          else if (t.isJSXMemberExpression(identifier)) {
            let current = identifier.object
            while (t.isJSXMemberExpression(current)) current = current.object
            if (current.name !== 'this' && !path.scope.hasBinding(current.name)) {
            	throw path.buildCodeFrameError(`${current.name} is not in the scope`)
            }
          }
          else if (!path.scope.hasBinding(identifier.name) && !identifier.name !== 'this') identifier = t.stringLiteral(identifier.name)

          const openExpression = t.callExpression(t.Identifier(opts.openElement || OPEN_ELEMENT), [identifier, attributes, t.booleanLiteral(selfClosing)])
          const closeExpression = t.callExpression(t.Identifier(opts.closeElement ||  CLOSE_ELEMENT), [identifier])

          const expressions = [t.expressionStatement(openExpression)]
          .concat(path.get('children').map(child => t.expressionStatement(child.node)))
          .concat(!selfClosing ? t.expressionStatement(closeExpression) : [])

          if (!t.isJSXElement(path.parent) && !t.isFunction(path.scope.block)){
            if (t.isSequenceExpression(path.parentPath)) {
              const statements = path.container.map((node, i) => {
                path.getSibling(i).stop()
                return t.expressionStatement(node)
              })
              return path.parentPath.replaceWith(t.functionExpression(null, [], t.blockStatement(statements)))
            }
            return path.replaceWith(t.functionExpression(null, [], t.blockStatement(expressions)))
          }
          return path.replaceWithMultiple(expressions)
        }
      },
      JSXText (path, {opts}) {
        const text = path.node.value.trim().replace(/\n/, '')
        if (text) path.replaceWith(t.callExpression(t.Identifier(opts.appendChild || APPEND), [t.stringLiteral(text)]))
        else path.remove()
      },
      JSXExpressionContainer (path, {opts}) {
        const expression = path.get('expression')
        if (t.isJSXEmptyExpression(expression)) return path.remove()
        path.replaceWith(t.callExpression(t.Identifier(opts.appendChild || APPEND), [expression.node]))
      },
      JSXSpreadChild (path, {opts}) {
        const expression = path.get('expression')
        path.replaceWith(t.callExpression(t.Identifier(opts.appendChild || APPEND), [t.spreadElement(expression.node)]))
      },
      JSXAttribute (path) {
        const value = path.get('value')
        const name = path.get('name')
        if (t.isJSXExpressionContainer(value)) {
          const expression = value.get('expression')
          if (t.isJSXElement(expression)) throw expression.buildCodeFrameError(`Element directly being invoked in attribute`)
          return path.replaceWith(t.objectProperty(t.identifier(name.node.name), expression.node))
        }
        path.replaceWith(t.objectProperty(t.identifier(name.node.name), value.node || t.booleanLiteral(true)))
      },
      JSXSpreadAttribute (path) {
        path.replaceWith(t.spreadProperty(path.get('argument').node))
      }
    }
  }
}
