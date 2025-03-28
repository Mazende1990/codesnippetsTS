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
    const newNode = new DoublyNode(element);

    if (this.isEmpty()) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail!.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    
    this.count++;
  }

  insert(element: T, index: number): boolean {
    if (index < 0 || index > this.count) return false;

    const newNode = new DoublyNode(element);

    if (index === 0) {
      this.insertAtHead(newNode);
    } else if (index === this.count) {
      this.insertAtTail(newNode);
    } else {
      this.insertAtIndex(newNode, index);
    }

    this.count++;
    return true;
  }

  private insertAtHead(newNode: DoublyNode<T>): void {
    if (this.isEmpty()) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head!.prev = newNode;
      this.head = newNode;
    }
  }

  private insertAtTail(newNode: DoublyNode<T>): void {
    const currentTail = this.tail!;
    currentTail.next = newNode;
    newNode.prev = currentTail;
    this.tail = newNode;
  }

  private insertAtIndex(newNode: DoublyNode<T>, index: number): void {
    const previousNode = this.getElementAt(index - 1)!;
    const currentNode = previousNode.next!;

    newNode.next = currentNode;
    previousNode.next = newNode;

    currentNode.prev = newNode;
    newNode.prev = previousNode;
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this.count) return undefined;

    let current = this.head!;

    if (index === 0) {
      this.removeHead();
    } else if (index === this.count - 1) {
      current = this.removeTail();
    } else {
      current = this.removeAtIndex(index);
    }

    this.count--;
    return current.element;
  }

  private removeHead(): void {
    this.head = this.head!.next;

    if (this.head) {
      this.head.prev = undefined;
    } else {
      this.tail = undefined;
    }
  }

  private removeTail(): DoublyNode<T> {
    const currentTail = this.tail!;
    this.tail = currentTail.prev;
    this.tail!.next = undefined;
    return currentTail;
  }

  private removeAtIndex(index: number): DoublyNode<T> {
    const current = this.getElementAt(index)!;
    const previousNode = current.prev!;
    
    previousNode.next = current.next;
    current.next!.prev = previousNode;

    return current;
  }

  indexOf(element: T): number {
    let current = this.head;
    let index = 0;

    while (current != null) {
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
    if (!this.head) return '';

    let elements = [];
    let current = this.head;

    while (current) {
      elements.push(current.element);
      current = current.next!;
    }

    return elements.join(',');
  }

  inverseToString(): string {
    if (!this.tail) return '';

    let elements = [];
    let current = this.tail;

    while (current) {
      elements.push(current.element);
      current = current.prev!;
    }

    return elements.join(',');
  }

  private isEmpty(): boolean {
    return this.count === 0;
  }
}