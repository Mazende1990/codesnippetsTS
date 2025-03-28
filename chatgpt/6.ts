export interface Node {
    key: number;
    parent?: Node | null;
    left?: Node | null;
    right?: Node | null;
  }
  
  export interface Tree {
    root: Node | null;
  }
  
  /**
   * Create a tree node with optional children.
   */
  export function createNode(key: number, left: Node | null = null, right: Node | null = null): Node {
    const node: Node = { key, left, right, parent: null };
  
    if (left) left.parent = node;
    if (right) right.parent = node;
  
    return node;
  }
  
  /**
   * In-order traversal of the BST (left -> root -> right).
   * Time complexity: O(n)
   */
  export function inOrderWalk(node: Node | null): void {
    if (!node) return;
  
    inOrderWalk(node.left);
    console.log(node);
    inOrderWalk(node.right);
  }
  
  /**
   * Search for a key in the BST.
   * Time complexity: O(log n)
   */
  export function search(node: Node | null, key: number): Node | null {
    if (!node || node.key === key) return node;
  
    return key < node.key
      ? search(node.left, key)
      : search(node.right, key);
  }
  
  /**
   * Find the node with the minimum key in a subtree.
   * Time complexity: O(log n)
   */
  export function minimum(node: Node): Node {
    let current = node;
    while (current.left) {
      current = current.left;
    }
    return current;
  }
  
  /**
   * Find the node with the maximum key in a subtree.
   * Time complexity: O(log n)
   */
  export function maximum(node: Node): Node {
    let current = node;
    while (current.right) {
      current = current.right;
    }
    return current;
  }
  
  /**
   * Find the in-order successor of a node.
   * Time complexity: O(log n)
   */
  export function successor(node: Node): Node | null {
    if (node.right) {
      return minimum(node.right);
    }
  
    let current = node;
    let parent = node.parent;
    while (parent && parent.right === current) {
      current = parent;
      parent = parent.parent;
    }
  
    return parent || null;
  }
  
  /**
   * Find the in-order predecessor of a node.
   * Time complexity: O(log n)
   */
  export function predecessor(node: Node): Node | null {
    if (node.left) {
      return maximum(node.left);
    }
  
    let current = node;
    let parent = node.parent;
    while (parent && parent.left === current) {
      current = parent;
      parent = parent.parent;
    }
  
    return parent || null;
  }
  
  /**
   * Insert a new node into the BST.
   * Time complexity: O(log n)
   */
  export function insert(tree: Tree, leaf: Node): void {
    let parent: Node | null = null;
    let current = tree.root;
  
    while (current) {
      parent = current;
      current = leaf.key < current.key ? current.left : current.right;
    }
  
    leaf.parent = parent;
  
    if (!parent) {
      tree.root = leaf;
    } else if (leaf.key < parent.key) {
      parent.left = leaf;
    } else {
      parent.right = leaf;
    }
  }
  
  /**
   * Replace a node with another in the BST.
   * Time complexity: O(1)
   */
  export function transplant(tree: Tree, oldNode: Node, newNode: Node | null): void {
    if (!oldNode.parent) {
      tree.root = newNode;
    } else if (oldNode.parent.left === oldNode) {
      oldNode.parent.left = newNode;
    } else {
      oldNode.parent.right = newNode;
    }
  
    if (newNode) {
      newNode.parent = oldNode.parent;
    }
  }
  
  /**
   * Remove a node from the BST.
   * Time complexity: O(log n)
   */
  export function remove(tree: Tree, target: Node): void {
    if (!target.left) {
      transplant(tree, target, target.right || null);
    } else if (!target.right) {
      transplant(tree, target, target.left || null);
    } else {
      const successorNode = minimum(target.right);
  
      if (successorNode.parent !== target) {
        transplant(tree, successorNode, successorNode.right || null);
        successorNode.right = target.right;
        if (successorNode.right) {
          successorNode.right.parent = successorNode;
        }
      }
  
      transplant(tree, target, successorNode);
      successorNode.left = target.left;
      if (successorNode.left) {
        successorNode.left.parent = successorNode;
      }
    }
  }
  