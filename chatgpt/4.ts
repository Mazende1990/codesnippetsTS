import { defaultEquals, IEqualsFunction } from '../util';
import LinkedList from './linked-list';
import { DoublyNode } from './models/linked-list-models';

export default class DoublyLinkedList<T> extends LinkedList<T> {
  protected head: DoublyNode<T> | undefined;
  protected tail: DoublyNode<T> | undefined;

  constructor(protected equalsFn: IEqualsFunction<T> = defaultEquals) {
    super(equalsFn);
  }

  push(element: T): void {
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
      const currentTail = this.tail!;
      currentTail.next = node;
      node.prev = currentTail;
      this.tail = node;
    } else {
      const previous = this.getElementAt(index - 1) as DoublyNode<T>;
      const current = previous.next as DoublyNode<T>;

      node.next = current;
      node.prev = previous;
      previous.next = node;
      current.prev = node;
    }

    this.count++;
    return true;
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this.count) {
      return undefined;
    }

    let current: DoublyNode<T>;

    if (index === 0) {
      current = this.head!;
      this.head = this.head.next as DoublyNode<T>;

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
      current = this.getElementAt(index) as DoublyNode<T>;
      const previous = current.prev as DoublyNode<T>;
      const next = current.next as DoublyNode<T>;

      previous.next = next;
      next.prev = previous;
    }

    this.count--;
    return current.element;
  }

  indexOf(element: T): number {
    let current = this.head;
    let index = 0;

    while (current) {
      if (this.equalsFn(element, current.element)) {
        return index;
      }
      current = current.next;
      index++;
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
    if (!this.head) return '';

    let result = `${this.head.element}`;
    let current = this.head.next;

    while (current) {
      result += `,${current.element}`;
      current = current.next;
    }

    return result;
  }

  inverseToString(): string {
    if (!this.tail) return '';

    let result = `${this.tail.element}`;
    let current = this.tail.prev;

    while (current) {
      result += `,${current.element}`;
      current = current.prev;
    }

    return result;
  }
}
