export interface Node {
    parent?: Node;
    key: number;
    left?: Node;
    right?: Node;
  }
  
  export interface Tree {
    root: Node;
  }
  
  export function createNode(key: number, left: Node = null, right: Node = null): Node {
    const node = { key, left, right, parent: null };
    if (left) left.parent = node;
    if (right) right.parent = node;
    return node;
  }
  
  export function inOrderWalk(node: Node) {
    if (!node) return;
    inOrderWalk(node.left);
    console.log(node);
    inOrderWalk(node.right);
  }
  
  export function search(node: Node, key: number): Node {
    if (!node || node.key === key) return node;
    return key < node.key ? search(node.left, key) : search(node.right, key);
  }
  
  export function minimum(node: Node): Node {
    while (node?.left) node = node.left;
    return node;
  }
  
  export function maximum(node: Node): Node {
    while (node?.right) node = node.right;
    return node;
  }
  
  export function successor(node: Node): Node {
    if (node.right) return minimum(node.right);
    let parent = node.parent;
    while (parent && node === parent.right) {
      node = parent;
      parent = parent.parent;
    }
    return parent;
  }
  
  export function predecessor(node: Node): Node {
    if (node.left) return maximum(node.left);
    let parent = node.parent;
    while (parent && node === parent.left) {
      node = parent;
      parent = parent.parent;
    }
    return parent;
  }
  
  export function insert(tree: Tree, leaf: Node) {
    let parent: Node = null;
    let current = tree.root;
    while (current) {
      parent = current;
      current = leaf.key < current.key ? current.left : current.right;
    }
    leaf.parent = parent;
    if (!parent) tree.root = leaf;
    else if (leaf.key < parent.key) parent.left = leaf;
    else parent.right = leaf;
  }
  
  export function transplant(tree: Tree, oldNode: Node, newNode: Node) {
    if (!oldNode.parent) tree.root = newNode;
    else if (oldNode === oldNode.parent.left) oldNode.parent.left = newNode;
    else oldNode.parent.right = newNode;
    if (newNode) newNode.parent = oldNode.parent;
  }
  
  export function remove(tree: Tree, removed: Node) {
    if (!removed.left) transplant(tree, removed, removed.right);
    else if (!removed.right) transplant(tree, removed, removed.left);
    else {
      const minRight = minimum(removed.right);
      if (minRight.parent !== removed) {
        transplant(tree, minRight, minRight.right);
        minRight.right = removed.right;
        minRight.right.parent = minRight;
      }
      transplant(tree, removed, minRight);
      minRight.left = removed.left;
      minRight.left.parent = minRight;
    }
  }