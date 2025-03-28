import { reverseRange } from '../../utils';
import { swap } from '../../utils';

/**
 * Returns the index of the parent node in the heap.
 * @param index Index of the current node
 */
export function parent(index: number): number {
  return Math.floor((index - 1) / 2);
}

/**
 * Returns the index of the left child node in the heap.
 * @param index Index of the current node
 */
export function left(index: number): number {
  return 2 * index + 1;
}

/**
 * Returns the index of the right child node in the heap.
 * @param index Index of the current node
 */
export function right(index: number): number {
  return 2 * (index + 1);
}

/**
 * Checks whether a given index is within the bounds of the heap.
 * @param index Index to check
 * @param heapSize Current size of the heap
 */
function isInHeap(index: number, heapSize: number): boolean {
  return index < heapSize;
}

/**
 * Ensures the max-heap property at the given index, assuming child subtrees are valid heaps.
 * Time complexity: O(log n)
 * @param heap Array representing the heap
 * @param index Index to start heapifying from
 * @param heapSize Effective size of the heap
 */
export function maxHeapify(heap: number[], index: number, heapSize: number): number[] {
  const leftChildIdx = left(index);
  const rightChildIdx = right(index);
  let largest = index;

  if (isInHeap(leftChildIdx, heapSize) && heap[leftChildIdx] > heap[largest]) {
    largest = leftChildIdx;
  }

  if (isInHeap(rightChildIdx, heapSize) && heap[rightChildIdx] > heap[largest]) {
    largest = rightChildIdx;
  }

  if (largest !== index) {
    swap(heap, index, largest);
    maxHeapify(heap, largest, heapSize);
  }

  return heap;
}

/**
 * Converts an array into a max-heap.
 * Time complexity: O(n)
 * @param array Input array to be converted into a heap
 */
export function buildMaxHeap(array: number[]): number[] {
  const lastParentIdx = Math.floor((array.length - 1) / 2);

  reverseRange(lastParentIdx).forEach(index => {
    maxHeapify(array, index, array.length);
  });

  return array;
}

/**
 * Performs heap sort on the input array.
 * Time complexity: O(n log n)
 * @param array Array to be sorted
 */
export function heapSort(array: number[]): number[] {
  buildMaxHeap(array);

  reverseRange(array.length - 1).forEach(heapEnd => {
    swap(array, 0, heapEnd);
    maxHeapify(array, 0, heapEnd);
  });

  return array;
}
