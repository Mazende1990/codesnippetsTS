import { Compare, defaultCompare, ICompareFunction } from '../util';
import { Node } from './models/node';

export default class BinarySearchTree<T> {
  protected root: Node<T>;

  constructor(protected compareFn: ICompareFunction<T> = defaultCompare) {}

  // Insert a key into the BST
  insert(key: T): void {
    if (this.root == null) {
      this.root = new Node(key);
    } else {
      this.insertNode(this.root, key);
    }
  }

  protected insertNode(node: Node<T>, key: T): void {
    const comparison = this.compareFn(key, node.key);

    if (comparison === Compare.LESS_THAN) {
      if (node.left == null) {
        node.left = new Node(key);
      } else {
        this.insertNode(node.left, key);
      }
    } else {
      if (node.right == null) {
        node.right = new Node(key);
      } else {
        this.insertNode(node.right, key);
      }
    }
  }

  // Retrieve the root node
  getRoot(): Node<T> {
    return this.root;
  }

  // Search for a key in the BST
  search(key: T): boolean {
    return this.searchNode(this.root, key);
  }

  private searchNode(node: Node<T>, key: T): boolean {
    if (node == null) return false;

    const comparison = this.compareFn(key, node.key);

    if (comparison === Compare.LESS_THAN) {
      return this.searchNode(node.left, key);
    } else if (comparison === Compare.BIGGER_THAN) {
      return this.searchNode(node.right, key);
    }

    return true;
  }

  // In-order traversal (Left -> Root -> Right)
  inOrderTraverse(callback: (key: T) => void): void {
    this.inOrderTraverseNode(this.root, callback);
  }

  private inOrderTraverseNode(node: Node<T>, callback: (key: T) => void): void {
    if (node != null) {
      this.inOrderTraverseNode(node.left, callback);
      callback(node.key);
      this.inOrderTraverseNode(node.right, callback);
    }
  }

  // Pre-order traversal (Root -> Left -> Right)
  preOrderTraverse(callback: (key: T) => void): void {
    this.preOrderTraverseNode(this.root, callback);
  }

  private preOrderTraverseNode(node: Node<T>, callback: (key: T) => void): void {
    if (node != null) {
      callback(node.key);
      this.preOrderTraverseNode(node.left, callback);
      this.preOrderTraverseNode(node.right, callback);
    }
  }

  // Post-order traversal (Left -> Right -> Root)
  postOrderTraverse(callback: (key: T) => void): void {
    this.postOrderTraverseNode(this.root, callback);
  }

  private postOrderTraverseNode(node: Node<T>, callback: (key: T) => void): void {
    if (node != null) {
      this.postOrderTraverseNode(node.left, callback);
      this.postOrderTraverseNode(node.right, callback);
      callback(node.key);
    }
  }

  // Find the minimum node
  min(): Node<T> {
    return this.minNode(this.root);
  }

  protected minNode(node: Node<T>): Node<T> {
    let current = node;
    while (current?.left != null) {
      current = current.left;
    }
    return current;
  }

  // Find the maximum node
  max(): Node<T> {
    return this.maxNode(this.root);
  }

  protected maxNode(node: Node<T>): Node<T> {
    let current = node;
    while (current?.right != null) {
      current = current.right;
    }
    return current;
  }

  // Remove a key from the BST
  remove(key: T): void {
    this.root = this.removeNode(this.root, key);
  }

  protected removeNode(node: Node<T>, key: T): Node<T> {
    if (node == null) return null;

    const comparison = this.compareFn(key, node.key);

    if (comparison === Compare.LESS_THAN) {
      node.left = this.removeNode(node.left, key);
    } else if (comparison === Compare.BIGGER_THAN) {
      node.right = this.removeNode(node.right, key);
    } else {
      // Node with only one child or no child
      if (node.left == null) return node.right;
      if (node.right == null) return node.left;

      // Node with two children: get the in-order successor
      const successor = this.minNode(node.right);
      node.key = successor.key;
      node.right = this.removeNode(node.right, successor.key);
    }

    return node;
  }
}
