import { reverseRange, swap } from '../../utils';

/**
 * Return the index of the parent in the heap.
 * Time complexity: O(1)
 * @param index Index of the current node
 */
export function parent(index: number): number {
  return Math.floor((index - 1) / 2);
}

/**
 * Return the index of the left child in the heap.
 * Time complexity: O(1)
 * @param index Index of the current node
 */
export function left(index: number): number {
  return 2 * index + 1;
}

/**
 * Return the index of the right child in the heap.
 * Time complexity: O(1)
 * @param index Index of the current node
 */
export function right(index: number): number {
  return 2 * (index + 1);
}

/**
 * Check if the index is within the heap size.
 * @param index Index to check
 * @param heapSize Size of the heap
 */
function isInHeap(index in the correct position in the max-heap. Assumes child nodes are valid heaps.
 * Time complexity: O(log(n))
 * @param input Array represented by the heap
 * @param index Index of the element to place
 * @param heapSize Size of the heap
 */
export function maxHeapify(input: number[], index: number, heapSize: number): number[] {
  const leftChild = left(index);
  const rightChild = right(index);
  let maxIndex = index;

  if (isInHeap(leftChild, heapSize) && input[leftChild] > input[index]) {
    maxIndex = leftChild;
  }

  if (isInHeap(rightChild, heapSize) && input[rightChild] > input[maxIndex]) {
    maxIndex = rightChild;
  }

  if (maxIndex !== index) {
    swap(input, index, maxIndex);
    maxHeapify(input, maxIndex, heapSize); // Repeat max-heap check for the subtree
  }

  return input;
}

/**
 * Build a max-heap from the input array.
 * Time complexity: O(n)
 * @param input Array to build the max-heap from
 */
export function buildMaxHeap(input: number[]): number[] {
  const firstLeaf = Math.floor((input.length - 1) / 2);

  reverseRange(firstLeaf).forEach(index => {
    maxHeapify(input, index, input.length);
  });

  return input;
}

/**
 * Sort the input array using heap sort.
 * Time complexity: O(n * log(n))
 * @param input Array to be sorted
 */
export function heapSort(input: number[]): number[] {
  buildMaxHeap(input);

  reverseRange(input.length - 1).forEach(heapEnd => {
    swap(input, 0, heapEnd);
    maxHeapify(input, 0, heapEnd);
  });

  return input;
}