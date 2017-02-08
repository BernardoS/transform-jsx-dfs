import * as List from './List'
import h from '../src/h'
import render from '../src/render'

const staticEl = () => {
  <List.Container>
    <List.Item teste={20} style={{backgroundColor: 'black'}} onclick={() => console.log('oi')}>item1</List.Item>
    <List.Item>item 2</List.Item>
    <List.Item>item 3</List.Item>
    <List.Item>item 4</List.Item>
  </List.Container>
}
