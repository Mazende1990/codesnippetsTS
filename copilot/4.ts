import { defaultEquals, IEqualsFunction } from '../util';
import LinkedList from './linked-list';
import { DoublyNode } from './models/linked-list-models';

export default class DoublyLinkedList<T> extends LinkedList<T> {
  protected head: DoublyNode<T> | undefined;
  protected tail: DoublyNode<T> | undefined;

  constructor(protected equalsFn: IEqualsFunction<T> = defaultEquals) {
    super(equalsFn);
  }

  push(element: T) {
    const node = new DoublyNode(element);

    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail!.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    this.count++;
  }

  insert(element: T, index: number) {
    if (index < 0 || index > this.count) return false;

    const node = new DoublyNode(element);

    if (index === 0) {
      if (!this.head) {
        this.head = node;
        this.tail = node;
      } else {
        node.next = this.head;
        this.head.prev = node;
        this.head = node;
      }
    } else if (index === this.count) {
      const current = this.tail!;
      current.next = node;
      node.prev = current;
      this.tail = node;
    } else {
      const previous = this.getElementAt(index - 1)!;
      const current = previous.next!;
      node.next = current;
      previous.next = node;
      current.prev = node;
      node.prev = previous;
    }
    this.count++;
    return true;
  }

  removeAt(index: number) {
    if (index < 0 || index >= this.count) return undefined;

    let current = this.head;

    if (index === 0) {
      this.head = this.head!.next;
      if (this.count === 1) {
        this.tail = undefined;
      } else {
        this.head!.prev = undefined;
      }
    } else if (index === this.count - 1) {
      current = this.tail!;
      this.tail = current.prev;
      this.tail!.next = undefined;
    } else {
      current = this.getElementAt(index)!;
      const previous = current.prev!;
      previous.next = current.next;
      current.next!.prev = previous;
    }
    this.count--;
    return current.element;
  }

  indexOf(element: T) {
    let current = this.head;
    let index = 0;

    while (current) {
      if (this.equalsFn(element, current.element)) {
        return index;
      }
      index++;
      current = current.next;
    }

    return -1;
  }

  getHead() {
    return this.head;
  }

  getTail() {
    return this.tail;
  }

  clear() {
    super.clear();
    this.tail = undefined;
  }

  toString() {
    if (!this.head) return '';

    let objString = `${this.head.element}`;
    let current = this.head.next;
    while (current) {
      objString = `${objString},${current.element}`;
      current = current.next;
    }
    return objString;
  }

  inverseToString() {
    if (!this.tail) return '';

    let objString = `${this.tail.element}`;
    let previous = this.tail.prev;
    while (previous) {
      objString = `${objString},${previous.element}`;
      previous = previous.prev;
    }
    return objString;
  }
}