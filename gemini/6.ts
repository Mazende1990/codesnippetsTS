/**
 * Binary Search Tree (BST) implementation
 */
export interface Node {
    parent?: Node;
    key: number;
    left?: Node;
    right?: Node;
  }
  
  export interface Tree {
    root: Node;
  }
  
  /**
   * Create a tree node. Used to build a tree in tests.
   */
  export function createNode(key: number, left: Node = null, right: Node = null): Node {
    const node: Node = {
      key,
      left,
      right,
      parent: null,
    };
  
    if (left) {
      left.parent = node;
    }
    if (right) {
      right.parent = node;
    }
  
    return node;
  }
  
  /**
   * Print a BST in order.
   * Time complexity: O(n)
   */
  export function inOrderWalk(node: Node | undefined) {
    if (!node) {
      return;
    }
    inOrderWalk(node.left);
    console.log(node);
    inOrderWalk(node.right);
  }
  
  /**
   * Search for a key in the BST.
   * Time complexity: O(lg(n))
   * @param node The root node of the BST.
   * @param key The key to search for.
   * @returns The node with the matching key, or null if not found.
   */
  export function search(node: Node | undefined, key: number): Node | null {
    if (!node) {
      return null;
    }
  
    if (node.key === key) {
      return node;
    } else if (node.key < key) {
      return search(node.right, key);
    } else {
      return search(node.left, key);
    }
  }
  
  /**
   * Find the node with the minimum key in the BST.
   * Time complexity: O(lg(n))
   * @param node The root node of the BST.
   * @returns The node with the minimum key.
   */
  export function minimum(node: Node): Node {
    let current: Node = node;
    while (current.left !== undefined) {
      current = current.left;
    }
    return current;
  }
  
  /**
   * Find the node with the maximum key in the BST.
   * Time complexity: O(lg(n))
   * @param node The root node of the BST.
   * @returns The node with the maximum key.
   */
  export function maximum(node: Node): Node {
    let current: Node = node;
    while (current.right !== undefined) {
      current = current.right;
    }
    return current;
  }
  
  /**
   * Find the in-order successor of a node in the BST.
   * Time complexity: O(lg(n))
   * @param node The node to find the successor of.
   * @returns The in-order successor node, or null if it doesn't exist.
   */
  export function successor(node: Node): Node | null {
    if (node.right !== undefined) {
      return minimum(node.right);
    }
  
    let parent: Node | undefined = node.parent;
    let current: Node = node;
    while (parent !== undefined && parent.right === current) {
      current = parent;
      parent = parent.parent;
    }
    return parent;
  }
  
  /**
   * Find the in-order predecessor of a node in the BST.
   * Time complexity: O(lg(n))
   * @param node The node to find the predecessor of.
   * @returns The in-order predecessor node, or null if it doesn't exist.
   */
  export function predecessor(node: Node): Node | null {
    if (node.left !== undefined) {
      return node.left;
    }
  
    let parent: Node | undefined = node.parent;
    let current: Node = node;
    while (parent !== undefined && parent.left === current) {
      current = parent;
      parent = parent.parent;
    }
    return parent;
  }
  
  /**
   * Insert a new node into the BST.
   * Time complexity: O(lg(n))
   * @param tree The BST to insert into.
   * @param newNode The node to insert.
   */
  export function insert(tree: Tree, newNode: Node) {
    let parent: Node | undefined = undefined;
    let current: Node | undefined = tree.root;
  
    while (current !== undefined) {
      parent = current;
      if (newNode.key >= current.key) {
        current = current.right;
      } else {
        current = current.left;
      }
    }
  
    newNode.parent = parent;
    if (parent === undefined) {
      tree.root = newNode;
    } else if (newNode.key >= parent.key) {
      parent.right = newNode;
    } else {
      parent.left = newNode;
    }
  }
  
  /**
   * Replaces one subtree as a child of its parent with another subtree.
   *
   * @NOTE: This function does not update the children of `newNode` nor does it
   * check if the BST is still valid after the replacement.
   *
   * Time complexity: O(1)
   * @param tree The BST where the replacement occurs.
   * @param oldNode The node to be replaced. It cannot be null.
   * @param newNode The replacement node.
   */
  export function transplant(tree: Tree, oldNode: Node, newNode: Node | undefined) {
    if (oldNode.parent === undefined) {
      tree.root = newNode;
    } else if (oldNode === oldNode.parent.left) {
      oldNode.parent.left = newNode;
    } else {
      oldNode.parent.right = newNode;
    }
    if (newNode !== undefined) {
      newNode.parent = oldNode.parent;
    }
  }
  
  /**
   * Remove a node from the BST.
   * Time complexity: O(lg(n))
   * @param tree The BST to remove from.
   * @param nodeToRemove The node to be removed.
   */
  export function remove(tree: Tree, nodeToRemove: Node) {
    if (nodeToRemove.left === undefined) {
      transplant(tree, nodeToRemove, nodeToRemove.right);
    } else if (nodeToRemove.right === undefined) {
      transplant(tree, nodeToRemove, nodeToRemove.left);
    } else {
      const successorNode = minimum(nodeToRemove.right);
      if (successorNode.parent !== nodeToRemove) {
        transplant(tree, successorNode, successorNode.right);
        successorNode.right = nodeToRemove.right;
        if (successorNode.right) {
          successorNode.right.parent = successorNode;
        }
      }
      transplant(tree, nodeToRemove, successorNode);
      successorNode.left = nodeToRemove.left;
      if (successorNode.left) {
        successorNode.left.parent = successorNode;
      }
    }
  }