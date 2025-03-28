/**
 * Binary Search Tree (BST) Implementation
 * 
 * Provides core BST operations including insert, search, delete, and traversal
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
   * Creates a tree node with optional left and right children
   * @param key - The node's key value
   * @param left - Optional left child node
   * @param right - Optional right child node
   * @returns The created node with parent references set
   */
  export function createNode(key: number, left: Node = null, right: Node = null): Node {
    const node = {
      key,
      left,
      right,
      parent: null,
    };
  
    if (left) left.parent = node;
    if (right) right.parent = node;
  
    return node;
  }
  
  /**
   * Performs an in-order traversal of the BST, logging each node
   * @param node - The root node to start traversal from
   */
  export function inOrderTraversal(node: Node): void {
    if (!node) return;
  
    inOrderTraversal(node.left);
    console.log(node);
    inOrderTraversal(node.right);
  }
  
  /**
   * Searches for a key in the BST
   * @param node - The root node to start searching from
   * @param key - The key to search for
   * @returns The node containing the key, or null if not found
   */
  export function search(node: Node, key: number): Node {
    if (!node) return null;
  
    if (node.key === key) return node;
    return node.key < key 
      ? search(node.right, key) 
      : search(node.left, key);
  }
  
  /**
   * Finds the node with the minimum key in the BST
   * @param node - The root node to start searching from
   * @returns The node with the minimum key
   */
  export function findMinimum(node: Node): Node {
    let current = node;
    while (current?.left) {
      current = current.left;
    }
    return current;
  }
  
  /**
   * Finds the node with the maximum key in the BST
   * @param node - The root node to start searching from
   * @returns The node with the maximum key
   */
  export function findMaximum(node: Node): Node {
    let current = node;
    while (current?.right) {
      current = current.right;
    }
    return current;
  }
  
  /**
   * Finds the in-order successor of a node
   * @param node - The node to find the successor for
   * @returns The successor node, or null if none exists
   */
  export function findSuccessor(node: Node): Node {
    if (node.right) return findMinimum(node.right);
  
    let current = node;
    let parent = node.parent;
    while (parent && parent.right === current) {
      current = parent;
      parent = parent.parent;
    }
    return parent;
  }
  
  /**
   * Finds the in-order predecessor of a node
   * @param node - The node to find the predecessor for
   * @returns The predecessor node, or null if none exists
   */
  export function findPredecessor(node: Node): Node {
    if (node.left) return findMaximum(node.left);
  
    let current = node;
    let parent = node.parent;
    while (parent && parent.left === current) {
      current = parent;
      parent = parent.parent;
    }
    return parent;
  }
  
  /**
   * Inserts a new node into the BST
   * @param tree - The BST to insert into
   * @param newNode - The new node to insert
   */
  export function insert(tree: Tree, newNode: Node): void {
    let parent: Node = null;
    let current = tree.root;
  
    // Find the appropriate parent for the new node
    while (current) {
      parent = current;
      current = newNode.key >= current.key 
        ? current.right 
        : current.left;
    }
  
    // Insert the new node
    if (!parent) {
      tree.root = newNode;
    } else if (newNode.key >= parent.key) {
      parent.right = newNode;
    } else {
      parent.left = newNode;
    }
  
    newNode.parent = parent;
  }
  
  /**
   * Replaces one node with another in the BST
   * @param tree - The BST containing the nodes
   * @param nodeToReplace - The node to be replaced
   * @param replacementNode - The node to replace with
   */
  export function replaceNode(tree: Tree, nodeToReplace: Node, replacementNode: Node): void {
    if (!nodeToReplace.parent) {
      tree.root = replacementNode;
    } else if (nodeToReplace.parent.left === nodeToReplace) {
      nodeToReplace.parent.left = replacementNode;
    } else {
      nodeToReplace.parent.right = replacementNode;
    }
  
    if (replacementNode) {
      replacementNode.parent = nodeToReplace.parent;
    }
  }
  
  /**
   * Removes a node from the BST
   * @param tree - The BST to remove from
   * @param nodeToRemove - The node to be removed
   */
  export function remove(tree: Tree, nodeToRemove: Node): void {
    if (!nodeToRemove.left) {
      replaceNode(tree, nodeToRemove, nodeToRemove.right);
    } else if (!nodeToRemove.right) {
      replaceNode(tree, nodeToRemove, nodeToRemove.left);
    } else {
      const successor = findMinimum(nodeToRemove.right);
  
      if (successor.parent !== nodeToRemove) {
        replaceNode(tree, successor, successor.right);
        successor.right = nodeToRemove.right;
        successor.right.parent = successor;
      }
  
      replaceNode(tree, nodeToRemove, successor);
      successor.left = nodeToRemove.left;
      successor.left.parent = successor;
    }
  }