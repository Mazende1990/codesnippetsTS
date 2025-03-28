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
      // Attach to the tail node
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }

    this.count++;
  }

  insert(element: T, index: number): boolean {
    if (index < 0 || index > this.count) {
      return false;
    }

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
      // Last item
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    } else {
      const previous = this.getElementAt(index - 1);
      const current = previous.next;
      node.next = current;
      previous.next = node;
      current.prev = node;
      node.prev = previous;
    }

    this.count++;
    return true;
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined;
    }

    let removedElement: T | undefined;

    if (index === 0) {
      removedElement = this.head.element;
      this.head = this.head.next;

      // If there is only one item, update tail as well
      if (this.count === 1) {
        this.tail = undefined;
      } else {
        this.head.prev = undefined;
      }
    } else if (index === this.count - 1) {
      // Last item
      removedElement = this.tail.element;
      this.tail = this.tail.prev;
      this.tail.next = undefined;
    } else {
      const current = this.getElementAt(index);
      removedElement = current.element;
      const previous = current.prev;
      // Link previous with current's next, skipping current
      previous.next = current.next;
      current.next.prev = previous;
    }

    this.count--;
    return removedElement;
  }

  indexOf(element: T): number {
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

  getHead(): DoublyNode<T> | undefined {
    return this.head;
  }

  getTail(): DoublyNode<T> | undefined {
    return this.tail;
  }

  clear(): void {
    super.clear();
    this.tail = undefined;
  }

  toString(): string {
    if (!this.head) {
      return '';
    }

    let objString = `${this.head.element}`;
    let current = this.head.next;

    while (current) {
      objString = `${objString},${current.element}`;
      current = current.next;
    }

    return objString;
  }

  inverseToString(): string {
    if (!this.tail) {
      return '';
    }

    let objString = `${this.tail.element}`;
    let previous = this.tail.prev;

    while (previous) {
      objString = `${objString},${previous.element}`;
      previous = previous.prev;
    }

    return objString;
  }
}