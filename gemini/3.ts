import { Compare, defaultCompare, ICompareFunction } from '../util';
import { Node } from './models/node';

export default class BinarySearchTree<T> {
  protected root: Node<T> | null = null;

  constructor(protected compareFn: ICompareFunction<T> = defaultCompare) {}

  insert(key: T): void {
    if (!this.root) {
      this.root = this.createNode(key);
    } else {
      this.insertNode(this.root, key);
    }
  }

  private createNode(key: T): Node<T> {
    return new Node(key);
  }

  protected insertNode(node: Node<T>, key: T): void {
    if (this.compareFn(key, node.key) === Compare.LESS_THAN) {
      if (!node.left) {
        node.left = this.createNode(key);
      } else {
        this.insertNode(node.left, key);
      }
    } else {
      if (!node.right) {
        node.right = this.createNode(key);
      } else {
        this.insertNode(node.right, key);
      }
    }
  }

  getRoot(): Node<T> | null {
    return this.root;
  }

  search(key: T): boolean {
    return this.searchNode(this.root, key);
  }

  private searchNode(node: Node<T> | null, key: T): boolean {
    if (!node) {
      return false;
    }

    const comparison = this.compareFn(key, node.key);

    if (comparison === Compare.LESS_THAN) {
      return this.searchNode(node.left, key);
    } else if (comparison === Compare.BIGGER_THAN) {
      return this.searchNode(node.right, key);
    } else {
      return true; // key is equal to node.key
    }
  }

  inOrderTraverse(callback: (key: T) => void): void {
    this.inOrderTraverseNode(this.root, callback);
  }

  private inOrderTraverseNode(node: Node<T> | null, callback: (key: T) => void): void {
    if (node) {
      this.inOrderTraverseNode(node.left, callback);
      callback(node.key);
      this.inOrderTraverseNode(node.right, callback);
    }
  }

  preOrderTraverse(callback: (key: T) => void): void {
    this.preOrderTraverseNode(this.root, callback);
  }

  private preOrderTraverseNode(node: Node<T> | null, callback: (key: T) => void): void {
    if (node) {
      callback(node.key);
      this.preOrderTraverseNode(node.left, callback);
      this.preOrderTraverseNode(node.right, callback);
    }
  }

  postOrderTraverse(callback: (key: T) => void): void {
    this.postOrderTraverseNode(this.root, callback);
  }

  private postOrderTraverseNode(node: Node<T> | null, callback: (key: T) => void): void {
    if (node) {
      this.postOrderTraverseNode(node.left, callback);
      this.postOrderTraverseNode(node.right, callback);
      callback(node.key);
    }
  }

  min(): T | undefined {
    const minNodeResult = this.minNode(this.root);
    return minNodeResult ? minNodeResult.key : undefined;
  }

  protected minNode(node: Node<T> | null): Node<T> | null {
    let current = node;
    while (current && current.left) {
      current = current.left;
    }
    return current;
  }

  max(): T | undefined {
    const maxNodeResult = this.maxNode(this.root);
    return maxNodeResult ? maxNodeResult.key : undefined;
  }

  protected maxNode(node: Node<T> | null): Node<T> | null {
    let current = node;
    while (current && current.right) {
      current = current.right;
    }
    return current;
  }

  remove(key: T): void {
    this.root = this.removeNode(this.root, key);
  }

  protected removeNode(node: Node<T> | null, key: T): Node<T> | null {
    if (!node) {
      return null;
    }

    const comparison = this.compareFn(key, node.key);

    if (comparison === Compare.LESS_THAN) {
      node.left = this.removeNode(node.left, key);
      return node;
    } else if (comparison === Compare.BIGGER_THAN) {
      node.right = this.removeNode(node.right, key);
      return node;
    } else {
      // key is equal to node.key

      // Case 1: Leaf node
      if (!node.left && !node.right) {
        return null;
      }

      // Case 2: Node with only one child
      if (!node.left) {
        return node.right;
      } else if (!node.right) {
        return node.left;
      }

      // Case 3: Node with two children
      const successor = this.minNode(node.right) as Node<T>; // Guaranteed to have a min on the right
      node.key = successor.key;
      node.right = this.removeNode(node.right, successor.key);
      return node;
    }
  }
}