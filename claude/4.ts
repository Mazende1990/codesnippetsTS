import { defaultEquals, IEqualsFunction } from '../util';
import LinkedList from './linked-list';
import { DoublyNode } from './models/linked-list-models';

export default class DoublyLinkedList<T> extends LinkedList<T> {
  protected head: DoublyNode<T> | undefined;
  protected tail: DoublyNode<T> | undefined;

  constructor(protected equalsFn: IEqualsFunction<T> = defaultEquals) {
    super(equalsFn);
  }

  /**
   * Adds an element to the end of the list
   * @param element The element to be added
   */
  push(element: T): void {
    const newNode = new DoublyNode(element);

    if (this.isEmpty()) {
      this.initializeListWithSingleNode(newNode);
    } else {
      this.appendNodeToTail(newNode);
    }

    this.count++;
  }

  /**
   * Inserts an element at a specific index
   * @param element The element to insert
   * @param index The position to insert the element
   * @returns Boolean indicating success of insertion
   */
  insert(element: T, index: number): boolean {
    if (index < 0 || index > this.count) return false;

    const newNode = new DoublyNode(element);

    if (index === 0) {
      this.insertAtBeginning(newNode);
    } else if (index === this.count) {
      this.insertAtEnd(newNode);
    } else {
      this.insertAtMiddle(newNode, index);
    }

    this.count++;
    return true;
  }

  /**
   * Removes an element at a specific index
   * @param index The index of the element to remove
   * @returns The removed element or undefined
   */
  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this.count) return undefined;

    let removedElement: T;

    if (index === 0) {
      removedElement = this.removeFirstNode();
    } else if (index === this.count - 1) {
      removedElement = this.removeLastNode();
    } else {
      removedElement = this.removeMiddleNode(index);
    }

    this.count--;
    return removedElement;
  }

  /**
   * Finds the index of a given element
   * @param element The element to find
   * @returns The index of the element or -1 if not found
   */
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

  /**
   * Returns the first node of the list
   */
  getHead(): DoublyNode<T> | undefined {
    return this.head;
  }

  /**
   * Returns the last node of the list
   */
  getTail(): DoublyNode<T> | undefined {
    return this.tail;
  }

  /**
   * Clears the entire list
   */
  clear(): void {
    super.clear();
    this.tail = undefined;
  }

  /**
   * Converts the list to a string representation (forward)
   */
  toString(): string {
    return this.createStringRepresentation(true);
  }

  /**
   * Converts the list to a string representation (reverse)
   */
  inverseToString(): string {
    return this.createStringRepresentation(false);
  }

  // Private helper methods for improved readability

  private isEmpty(): boolean {
    return this.head === null;
  }

  private initializeListWithSingleNode(node: DoublyNode<T>): void {
    this.head = node;
    this.tail = node;
  }

  private appendNodeToTail(node: DoublyNode<T>): void {
    this.tail!.next = node;
    node.prev = this.tail;
    this.tail = node;
  }

  private insertAtBeginning(node: DoublyNode<T>): void {
    if (!this.head) {
      this.initializeListWithSingleNode(node);
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
  }

  private insertAtEnd(node: DoublyNode<T>): void {
    const lastNode = this.tail!;
    lastNode.next = node;
    node.prev = lastNode;
    this.tail = node;
  }

  private insertAtMiddle(node: DoublyNode<T>, index: number): void {
    const previousNode = this.getElementAt(index - 1)!;
    const currentNode = previousNode.next!;

    node.next = currentNode;
    node.prev = previousNode;
    previousNode.next = node;
    currentNode.prev = node;
  }

  private removeFirstNode(): T {
    const removedElement = this.head!.element;
    this.head = this.head!.next;

    if (this.count === 1) {
      this.tail = undefined;
    } else {
      this.head!.prev = undefined;
    }

    return removedElement;
  }

  private removeLastNode(): T {
    const removedElement = this.tail!.element;
    this.tail = this.tail!.prev;
    this.tail!.next = undefined;

    return removedElement;
  }

  private removeMiddleNode(index: number): T {
    const currentNode = this.getElementAt(index)!;
    const previousNode = currentNode.prev!;
    const nextNode = currentNode.next!;

    previousNode.next = nextNode;
    nextNode.prev = previousNode;

    return currentNode.element;
  }

  private createStringRepresentation(isForward: boolean): string {
    if (!this.head) return '';

    const nodes = isForward 
      ? this.collectNodesForward() 
      : this.collectNodesReverse();

    return nodes.join(',');
  }

  private collectNodesForward(): T[] {
    const nodes: T[] = [this.head!.element];
    let current = this.head!.next;

    while (current) {
      nodes.push(current.element);
      current = current.next;
    }

    return nodes;
  }

  private collectNodesReverse(): T[] {
    const nodes: T[] = [this.tail!.element];
    let previous = this.tail!.prev;

    while (previous) {
      nodes.push(previous.element);
      previous = previous.prev;
    }

    return nodes;
  }
}