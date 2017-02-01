    const TEXT_NODE = 'text'
    const H = 'h'

    export default function({ types: t }) {
      // console.log(t)
      return {
        visitor: {
          JSXElement: {
            exit (path){
              const openingElement = path.get('openingElement')
              const selfClosing = path.node.openingElement.selfClosing
              const attributes = t.objectExpression(openingElement.get('attributes').map(attr => {
                let name = attr.get('elements')[0].node
                const value = attr.get('elements')[1].node
                if (t.isJSXIdentifier(name)) name = t.identifier(name.name)
                return t.objectProperty(name, value)
              }))
              const tagState = t.objectExpression([t.objectProperty(t.stringLiteral('open'), t.booleanLiteral(true)), t.objectProperty(t.stringLiteral('close'), t.booleanLiteral(selfClosing))])
              let identifier = openingElement.get('name')
              identifier = identifier.isReferencedIdentifier() || identifier.node.name === 'this' ? identifier.node : t.stringLiteral(identifier.node.name)
              const expr = [t.callExpression(t.Identifier(H), [identifier, attributes, tagState])]
              .concat(path.get('children').map(child => child.node))
              .concat(!selfClosing ? t.callExpression(t.Identifier(H), [identifier, t.objectExpression([t.objectProperty(t.stringLiteral('open'), t.booleanLiteral(false)), t.objectProperty(t.stringLiteral('close'), t.booleanLiteral(true))])]) : [])
              path.replaceWithMultiple(expr)
            }
          },
          JSXText (path) {
            const text = path.node.value.trim().replace(/\n/, '')
            if (text) path.replaceWith(t.callExpression(t.Identifier(TEXT_NODE), [t.stringLiteral(text)]))
            else path.remove()
          },
          JSXExpressionContainer (path) {
            const expression = path.get('expression')
            if (t.isTemplateLiteral(expression)) path.replaceWith(t.callExpression(t.Identifier(TEXT_NODE), [expression.node]))
            else path.replaceWith(expression)
          },
          JSXEmptyExpression (path) {
            path.replaceWith(t.emptyStatement())
          },
          JSXAttribute (path) {
            const value = path.get('value')
            const name = path.get('name')
            if (t.isJSXExpressionContainer(value)) {
              const expression = value.get('expression')
              if (t.isJSXElement(expression)) throw expression.buildCodeFrameError(`Element directly being invoked`)
              if (t.isTemplateLiteral(expression)) return path.replaceWith(t.arrayExpression([name.node, expression.node]))
              return path.replaceWith(t.arrayExpression([name.node, expression.node]))
            }
            path.replaceWith(t.arrayExpression([name.node, value.node || t.booleanLiteral(true)]))
          }
        }
      }
    }
