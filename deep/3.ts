import { Compare, defaultCompare, ICompareFunction } from '../util';
import { Node } from './models/node';

export default class BinarySearchTree<T> {
  protected root: Node<T> | null = null;

  constructor(protected compareFn: ICompareFunction<T> = defaultCompare) {}

  // Public Methods
  insert(key: T): void {
    if (this.root === null) {
      this.root = new Node(key);
    } else {
      this.insertNode(this.root, key);
    }
  }

  getRoot(): Node<T> | null {
    return this.root;
  }

  search(key: T): boolean {
    return this.searchNode(this.root, key);
  }

  inOrderTraverse(callback: (key: T) => void): void {
    this.inOrderTraverseNode(this.root, callback);
  }

  preOrderTraverse(callback: (key: T) => void): void {
    this.preOrderTraverseNode(this.root, callback);
  }

  postOrderTraverse(callback: (key: T) => void): void {
    this.postOrderTraverseNode(this.root, callback);
  }

  min(): Node<T> | null {
    return this.findMinNode(this.root);
  }

  max(): Node<T> | null {
    return this.findMaxNode(this.root);
  }

  remove(key: T): void {
    this.root = this.removeNode(this.root, key);
  }

  // Protected Helper Methods
  protected insertNode(node: Node<T>, key: T): void {
    if (this.compareFn(key, node.key) === Compare.LESS_THAN) {
      if (node.left === null) {
        node.left = new Node(key);
      } else {
        this.insertNode(node.left, key);
      }
    } else {
      if (node.right === null) {
        node.right = new Node(key);
      } else {
        this.insertNode(node.right, key);
      }
    }
  }

  protected findMinNode(node: Node<T> | null): Node<T> | null {
    if (node === null) {
      return null;
    }
    
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  protected findMaxNode(node: Node<T> | null): Node<T> | null {
    if (node === null) {
      return null;
    }
    
    let current = node;
    while (current.right !== null) {
      current = current.right;
    }
    return current;
  }

  // Private Helper Methods
  private searchNode(node: Node<T> | null, key: T): boolean {
    if (node === null) {
      return false;
    }

    const comparison = this.compareFn(key, node.key);
    
    if (comparison === Compare.LESS_THAN) {
      return this.searchNode(node.left, key);
    }
    
    if (comparison === Compare.BIGGER_THAN) {
      return this.searchNode(node.right, key);
    }
    
    return true; // Key is equal to node's key
  }

  private inOrderTraverseNode(node: Node<T> | null, callback: (key: T) => void): void {
    if (node !== null) {
      this.inOrderTraverseNode(node.left, callback);
      callback(node.key);
      this.inOrderTraverseNode(node.right, callback);
    }
  }

  private preOrderTraverseNode(node: Node<T> | null, callback: (key: T) => void): void {
    if (node !== null) {
      callback(node.key);
      this.preOrderTraverseNode(node.left, callback);
      this.preOrderTraverseNode(node.right, callback);
    }
  }

  private postOrderTraverseNode(node: Node<T> | null, callback: (key: T) => void): void {
    if (node !== null) {
      this.postOrderTraverseNode(node.left, callback);
      this.postOrderTraverseNode(node.right, callback);
      callback(node.key);
    }
  }

  private removeNode(node: Node<T> | null, key: T): Node<T> | null {
    if (node === null) {
      return null;
    }

    const comparison = this.compareFn(key, node.key);
    
    if (comparison === Compare.LESS_THAN) {
      node.left = this.removeNode(node.left, key);
      return node;
    }
    
    if (comparison === Compare.BIGGER_THAN) {
      node.right = this.removeNode(node.right, key);
      return node;
    }
    
    // Key matches current node
    return this.handleNodeRemoval(node);
  }

  private handleNodeRemoval(node: Node<T>): Node<T> | null {
    // Case 1: Leaf node
    if (node.left === null && node.right === null) {
      return null;
    }

    // Case 2: Node with one child
    if (node.left === null) {
      return node.right;
    }
    
    if (node.right === null) {
      return node.left;
    }

    // Case 3: Node with two children
    const successor = this.findMinNode(node.right)!;
    node.key = successor.key;
    node.right = this.removeNode(node.right, successor.key);
    return node;
  }
}