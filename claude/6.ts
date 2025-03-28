/**
 * Binary Search Tree (BST) Implementation
 * Provides core operations for a binary search tree with parent references
 */
export interface Node {
    key: number;
    left?: Node;
    right?: Node;
    parent?: Node;
  }
  
  export interface Tree {
    root: Node;
  }
  
  /**
   * Create a new tree node with optional left and right children
   * @param key The key value for the node
   * @param left Optional left child node
   * @param right Optional right child node
   * @returns A new node with parent references set
   */
  export function createNode(key: number, left: Node | null = null, right: Node | null = null): Node {
    const node: Node = { key, left, right, parent: null };
  
    if (left) left.parent = node;
    if (right) right.parent = node;
  
    return node;
  }
  
  /**
   * Perform an in-order traversal of the BST
   * Time Complexity: O(n)
   * @param node Root node of the subtree to traverse
   */
  export function inOrderWalk(node: Node | null): void {
    if (!node) return;
  
    inOrderWalk(node.left);
    console.log(node);
    inOrderWalk(node.right);
  }
  
  /**
   * Search for a node with a specific key in the BST
   * Time Complexity: O(log n)
   * @param node Root node to start the search
   * @param key Key to search for
   * @returns The node with the matching key or null
   */
  export function search(node: Node | null, key: number): Node | null {
    if (!node || node.key === key) return node;
  
    return key < node.key 
      ? search(node.left, key) 
      : search(node.right, key);
  }
  
  /**
   * Find the node with the minimum key in a subtree
   * Time Complexity: O(log n)
   * @param node Root node of the subtree
   * @returns The node with the smallest key
   */
  export function minimum(node: Node): Node {
    let current = node;
    while (current.left) {
      current = current.left;
    }
    return current;
  }
  
  /**
   * Find the node with the maximum key in a subtree
   * Time Complexity: O(log n)
   * @param node Root node of the subtree
   * @returns The node with the largest key
   */
  export function maximum(node: Node): Node {
    let current = node;
    while (current.right) {
      current = current.right;
    }
    return current;
  }
  
  /**
   * Find the successor of a node in an in-order traversal
   * Time Complexity: O(log n)
   * @param node Node to find the successor for
   * @returns The next node in the in-order traversal
   */
  export function successor(node: Node): Node | null {
    // If right subtree exists, find its minimum
    if (node.right) return minimum(node.right);
  
    // Otherwise, climb up the tree
    let current = node;
    let parent = current.parent;
  
    while (parent && parent.right === current) {
      current = parent;
      parent = parent.parent;
    }
  
    return parent;
  }
  
  /**
   * Find the predecessor of a node in an in-order traversal
   * Time Complexity: O(log n)
   * @param node Node to find the predecessor for
   * @returns The previous node in the in-order traversal
   */
  export function predecessor(node: Node): Node | null {
    // If left subtree exists, find its maximum
    if (node.left) return maximum(node.left);
  
    // Otherwise, climb up the tree
    let current = node;
    let parent = current.parent;
  
    while (parent && parent.left === current) {
      current = parent;
      parent = parent.parent;
    }
  
    return parent;
  }
  
  /**
   * Insert a new node into the BST
   * Time Complexity: O(log n)
   * @param tree The tree to insert into
   * @param newNode The node to insert
   */
  export function insert(tree: Tree, newNode: Node): void {
    let parent: Node | null = null;
    let current = tree.root;
  
    // Find the insertion point
    while (current) {
      parent = current;
      current = newNode.key >= current.key ? current.right : current.left;
    }
  
    // Set parent and child references
    newNode.parent = parent;
    if (!parent) {
      tree.root = newNode;
    } else if (newNode.key >= parent.key) {
      parent.right = newNode;
    } else {
      parent.left = newNode;
    }
  }
  
  /**
   * Replace one subtree as a child of its parent with another subtree
   * Time Complexity: O(1)
   * @param tree The tree being modified
   * @param oldNode The node to be replaced
   * @param newNode The replacement node
   */
  export function transplant(tree: Tree, oldNode: Node, newNode: Node | null): void {
    // Update parent reference
    if (!oldNode.parent) {
      tree.root = newNode!;
    } else if (oldNode.parent.left === oldNode) {
      oldNode.parent.left = newNode;
    } else {
      oldNode.parent.right = newNode;
    }
  
    // Update child's parent reference
    if (newNode) {
      newNode.parent = oldNode.parent;
    }
  }
  
  /**
   * Remove a node from the BST
   * Time Complexity: O(log n)
   * @param tree The tree to remove the node from
   * @param nodeToRemove The node to be removed
   */
  export function remove(tree: Tree, nodeToRemove: Node): void {
    // Case 1: No left child
    if (!nodeToRemove.left) {
      transplant(tree, nodeToRemove, nodeToRemove.right);
      return;
    }
  
    // Case 2: No right child
    if (!nodeToRemove.right) {
      transplant(tree, nodeToRemove, nodeToRemove.left);
      return;
    }
  
    // Case 3: Two children
    const minRight = minimum(nodeToRemove.right);
  
    // If minimum is not direct child
    if (minRight.parent !== nodeToRemove) {
      transplant(tree, minRight, minRight.right);
      minRight.right = nodeToRemove.right;
      minRight.right.parent = minRight;
    }
  
    // Replace nodeToRemove with minRight
    transplant(tree, nodeToRemove, minRight);
    minRight.left = nodeToRemove.left;
    minRight.left.parent = minRight;
  }