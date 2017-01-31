const TEXT_NODE = 'text'
const OPEN_ELEMENT =  'open'
const CLOSE_ELEMENT = 'close'

export default function({ types: t }) {
  console.log(t)
  const parser = childrenParser(t)
  return {
    visitor: {
      JSXElement(path) {
        path.get('children').forEach(parser)
      }
    }
  };
}



function childrenParser (t) {
  return function parser (child) {
    if (t.isJSXText(child)) {
      const text = child.node.value.trim()
      if (text) return child.replaceWith(t.callExpression(t.Identifier(TEXT_NODE), [t.stringLiteral(text)]))
      return child.remove()
    }
    if (t.isJSXElement(child)) {
      child.get('children').forEach(parser)
      // const openElement = child.get('openingElement')
      // const closingElement = child.get('closingElement')
      // const openName = openElement.node.name.name
      // console.log(openName)
    }
  }
}
