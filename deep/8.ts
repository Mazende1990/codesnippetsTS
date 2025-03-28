import { reverseRange } from '../../utils';
import { swap } from '../../utils';

/**
 * Heap utility functions
 */
export const Heap = {
  parent: (index: number): number => Math.floor((index - 1) / 2),
  leftChild: (index: number): number => 2 * index + 1,
  rightChild: (index: number): number => 2 * (index + 1),
  isValidIndex: (index: number, heapSize: number): boolean => index < heapSize,
};

/**
 * Maintains the max-heap property for an element at the given index.
 * Assumes child nodes are valid heaps.
 * Time complexity: O(log n)
 */
export function maxHeapify(
  array: number[],
  index: number,
  heapSize: number
): number[] {
  const { leftChild, rightChild, isValidIndex } = Heap;
  
  let largestIndex = index;
  const leftIndex = leftChild(index);
  const rightIndex = rightChild(index);

  // Find the largest element among current node and its children
  if (isValidIndex(leftIndex, heapSize) && array[leftIndex] > array[largestIndex]) {
    largestIndex = leftIndex;
  }

  if (isValidIndex(rightIndex, heapSize) && array[rightIndex] > array[largestIndex]) {
    largestIndex = rightIndex;
  }

  // If the largest element isn't the current node, swap and continue heapifying
  if (largestIndex !== index) {
    swap(array, index, largestIndex);
    maxHeapify(array, largestIndex, heapSize);
  }

  return array;
}

/**
 * Builds a max-heap from an unsorted array.
 * Time complexity: O(n)
 */
export function buildMaxHeap(array: number[]): number[] {
  // Start from the last non-leaf node (parent of last element)
  const lastNonLeafIndex = Math.floor((array.length - 1) / 2);

  // Heapify all non-leaf nodes in reverse order
  for (const index of reverseRange(lastNonLeafIndex)) {
    maxHeapify(array, index, array.length);
  }

  return array;
}

/**
 * Sorts an array using heap sort algorithm.
 * Time complexity: O(n log n)
 */
export function heapSort(array: number[]): number[] {
  let heapSize = array.length;

  // First build a max-heap from the array
  buildMaxHeap(array);

  // Extract elements one by one from the heap
  for (const end of reverseRange(heapSize - 1)) {
    // Move current root (max element) to end
    swap(array, 0, end);
    
    // Reduce heap size and heapify the root element
    heapSize--;
    maxHeapify(array, 0, heapSize);
  }

  return array;
}