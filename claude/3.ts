import { Compare, defaultCompare, ICompareFunction } from '../util';
import { Node } from './models/node';

export default class BinarySearchTree<T> {
  private root: Node<T> | null = null;

  constructor(private compareFn: ICompareFunction<T> = defaultCompare) {}

  // Insert a new key into the tree
  insert(key: T): void {
    if (this.root === null) {
      this.root = new Node(key);
    } else {
      this.insertRecursively(this.root, key);
    }
  }

  // Recursive helper method for insertion
  private insertRecursively(node: Node<T>, key: T): void {
    const comparisonResult = this.compareFn(key, node.key);

    if (comparisonResult === Compare.LESS_THAN) {
      // Insert into left subtree
      if (node.left === null) {
        node.left = new Node(key);
      } else {
        this.insertRecursively(node.left, key);
      }
    } else {
      // Insert into right subtree
      if (node.right === null) {
        node.right = new Node(key);
      } else {
        this.insertRecursively(node.right, key);
      }
    }
  }

  // Get the root of the tree
  getRoot(): Node<T> | null {
    return this.root;
  }

  // Search for a key in the tree
  search(key: T): boolean {
    return this.searchRecursively(this.root, key);
  }

  // Recursive helper method for searching
  private searchRecursively(node: Node<T> | null, key: T): boolean {
    if (node === null) {
      return false;
    }

    const comparisonResult = this.compareFn(key, node.key);

    if (comparisonResult === Compare.LESS_THAN) {
      return this.searchRecursively(node.left, key);
    } 
    
    if (comparisonResult === Compare.BIGGER_THAN) {
      return this.searchRecursively(node.right, key);
    }

    // Key is equal to node's key
    return true;
  }

  // In-order traversal (left-root-right)
  inOrderTraverse(callback: (key: T) => void): void {
    this.inOrderTraverseRecursively(this.root, callback);
  }

  // Recursive helper method for in-order traversal
  private inOrderTraverseRecursively(
    node: Node<T> | null, 
    callback: (key: T) => void
  ): void {
    if (node !== null) {
      this.inOrderTraverseRecursively(node.left, callback);
      callback(node.key);
      this.inOrderTraverseRecursively(node.right, callback);
    }
  }

  // Pre-order traversal (root-left-right)
  preOrderTraverse(callback: (key: T) => void): void {
    this.preOrderTraverseRecursively(this.root, callback);
  }

  // Recursive helper method for pre-order traversal
  private preOrderTraverseRecursively(
    node: Node<T> | null, 
    callback: (key: T) => void
  ): void {
    if (node !== null) {
      callback(node.key);
      this.preOrderTraverseRecursively(node.left, callback);
      this.preOrderTraverseRecursively(node.right, callback);
    }
  }

  // Post-order traversal (left-right-root)
  postOrderTraverse(callback: (key: T) => void): void {
    this.postOrderTraverseRecursively(this.root, callback);
  }

  // Recursive helper method for post-order traversal
  private postOrderTraverseRecursively(
    node: Node<T> | null, 
    callback: (key: T) => void
  ): void {
    if (node !== null) {
      this.postOrderTraverseRecursively(node.left, callback);
      this.postOrderTraverseRecursively(node.right, callback);
      callback(node.key);
    }
  }

  // Find the minimum value in the tree
  min(): Node<T> | null {
    return this.findMinNode(this.root);
  }

  // Find the minimum node starting from a given node
  private findMinNode(node: Node<T> | null): Node<T> | null {
    if (node === null) {
      return null;
    }

    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }

  // Find the maximum value in the tree
  max(): Node<T> | null {
    return this.findMaxNode(this.root);
  }

  // Find the maximum node starting from a given node
  private findMaxNode(node: Node<T> | null): Node<T> | null {
    if (node === null) {
      return null;
    }

    while (node.right !== null) {
      node = node.right;
    }
    return node;
  }

  // Remove a key from the tree
  remove(key: T): void {
    this.root = this.removeNode(this.root, key);
  }

  // Recursive helper method for removal
  private removeNode(node: Node<T> | null, key: T): Node<T> | null {
    if (node === null) {
      return null;
    }

    const comparisonResult = this.compareFn(key, node.key);

    // Navigate to the node to be removed
    if (comparisonResult === Compare.LESS_THAN) {
      node.left = this.removeNode(node.left, key);
      return node;
    }
    
    if (comparisonResult === Compare.BIGGER_THAN) {
      node.right = this.removeNode(node.right, key);
      return node;
    }

    // Node to remove found - handle different scenarios
    return this.removeFoundNode(node);
  }

  // Handle removal of a found node with different child configurations
  private removeFoundNode(node: Node<T>): Node<T> | null {
    // Case 1: Leaf node (no children)
    if (node.left === null && node.right === null) {
      return null;
    }

    // Case 2: Node with only one child
    if (node.left === null) {
      return node.right;
    }
    
    if (node.right === null) {
      return node.left;
    }

    // Case 3: Node with two children
    // Replace with the minimum value from the right subtree
    const minRightSubtreeNode = this.findMinNode(node.right);
    node.key = minRightSubtreeNode!.key;
    node.right = this.removeNode(node.right, minRightSubtreeNode!.key);
    return node;
  }
}