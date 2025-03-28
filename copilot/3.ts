import { Compare, defaultCompare, ICompareFunction } from '../util';
import { Node } from './models/node';

export default class BinarySearchTree<T> {
  protected root: Node<T>;

  constructor(protected compareFn: ICompareFunction<T> = defaultCompare) {}

  insert(key: T) {
    if (this.root == null) {
      this.root = new Node(key);
    } else {
      this.insertNode(this.root, key);
    }
  }

  protected insertNode(node: Node<T>, key: T) {
    if (this.compareFn(key, node.key) === Compare.LESS_THAN) {
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

  getRoot() {
    return this.root;
  }

  search(key: T): boolean {
    return this.searchNode(this.root, key);
  }

  private searchNode(node: Node<T>, key: T): boolean {
    if (node == null) {
      return false;
    }

    if (this.compareFn(key, node.key) === Compare.LESS_THAN) {
      return this.searchNode(node.left, key);
    } else if (this.compareFn(key, node.key) === Compare.BIGGER_THAN) {
      return this.searchNode(node.right, key);
    } else {
      return true;
    }
  }

  inOrderTraverse(callback: Function) {
    this.traverseNode(this.root, callback, 'inOrder');
  }

  preOrderTraverse(callback: Function) {
    this.traverseNode(this.root, callback, 'preOrder');
  }

  postOrderTraverse(callback: Function) {
    this.traverseNode(this.root, callback, 'postOrder');
  }

  private traverseNode(node: Node<T>, callback: Function, order: string) {
    if (node != null) {
      if (order === 'preOrder') callback(node.key);
      this.traverseNode(node.left, callback, order);
      if (order === 'inOrder') callback(node.key);
      this.traverseNode(node.right, callback, order);
      if (order === 'postOrder') callback(node.key);
    }
  }

  min(): Node<T> {
    return this.minNode(this.root);
  }

  protected minNode(node: Node<T>): Node<T> {
    let current = node;
    while (current != null && current.left != null) {
      current = current.left;
    }
    return current;
  }

  max(): Node<T> {
    return this.maxNode(this.root);
  }

  protected maxNode(node: Node<T>): Node<T> {
    let current = node;
    while (current != null && current.right != null) {
      current = current.right;
    }
    return current;
  }

  remove(key: T) {
    this.root = this.removeNode(this.root, key);
  }

  protected removeNode(node: Node<T>, key: T): Node<T> {
    if (node == null) {
      return null;
    }

    if (this.compareFn(key, node.key) === Compare.LESS_THAN) {
      node.left = this.removeNode(node.left, key);
      return node;
    } else if (this.compareFn(key, node.key) === Compare.BIGGER_THAN) {
      node.right = this.removeNode(node.right, key);
      return node;
    } else {
      if (node.left == null && node.right == null) {
        return null;
      }

      if (node.left == null) {
        return node.right;
      } else if (node.right == null) {
        return node.left;
      }

      const aux = this.minNode(node.right);
      node.key = aux.key;
      node.right = this.removeNode(node.right, aux.key);
      return node;
    }
  }
}