import { reverseRange } from '../../utils';
import { swap } from '../../utils';

/**
 * Calculates the parent node's index in a heap.
 *
 * Time complexity: O(1)
 *
 * @param index The index of the current node.
 * @returns The index of the parent node.
 */
export const getParentIndex = (index: number): number => Math.floor((index - 1) / 2);

/**
 * Calculates the left child node's index in a heap.
 *
 * Time complexity: O(1)
 *
 * @param index The index of the current node.
 * @returns The index of the left child node.
 */
export const getLeftChildIndex = (index: number): number => 2 * index + 1;

/**
 * Calculates the right child node's index in a heap.
 *
 * Time complexity: O(1)
 *
 * @param index The index of the current node.
 * @returns The index of the right child node.
 */
export const getRightChildIndex = (index: number): number => 2 * (index + 1);

/**
 * Checks if a given index is within the bounds of the heap.
 *
 * Time complexity: O(1)
 *
 * @param index The index to check.
 * @param heapSize The current size of the heap.
 * @returns True if the index is within the heap, false otherwise.
 */
const isIndexInHeap = (index: number, heapSize: number): boolean => index < heapSize;

/**
 * Maintains the max-heap property for a given node in the heap.
 * It assumes that the left and right subtrees are already max-heaps.
 *
 * Time complexity: O(lg(n))
 *
 * @param heap The array representing the heap.
 * @param index The index of the node to heapify.
 * @param heapSize The current size of the heap.
 * @returns The modified heap array.
 */
export const heapifyMax = (heap: number[], index: number, heapSize: number): number[] => {
  const leftChildIndex = getLeftChildIndex(index);
  const rightChildIndex = getRightChildIndex(index);
  let largestIndex = index;

  if (isIndexInHeap(leftChildIndex, heapSize) && heap[leftChildIndex] > heap[largestIndex]) {
    largestIndex = leftChildIndex;
  }

  if (isIndexInHeap(rightChildIndex, heapSize) && heap[rightChildIndex] > heap[largestIndex]) {
    largestIndex = rightChildIndex;
  }

  if (largestIndex !== index) {
    swap(heap, index, largestIndex);
    // Recursively heapify the affected subtree
    heapifyMax(heap, largestIndex, heapSize);
  }

  return heap;
};

/**
 * Builds a max-heap from an unsorted array.
 *
 * Time complexity: O(n)
 *
 * @param array The input array to build the max-heap from.
 * @returns The array as a max-heap.
 */
export const buildMaxHeap = (array: number[]): number[] => {
  // The first element that is not a leaf node is at index floor((n/2) - 1)
  const firstNonLeafNodeIndex = Math.floor((array.length - 1) / 2);

  // Heapify all non-leaf nodes in reverse order
  reverseRange(firstNonLeafNodeIndex).forEach(index => {
    heapifyMax(array, index, array.length);
  });

  return array;
};

/**
 * Sorts an array using the heap sort algorithm.
 *
 * Time complexity: O(n * lg(n)).
 *
 * @param array The array to be sorted.
 * @returns The sorted array.
 */
export const heapSort = (array: number[]): number[] => {
  // Build the initial max-heap
  buildMaxHeap(array);

  // Iterate from the end of the heap down to the beginning
  reverseRange(array.length - 1).forEach(heapEnd => {
    // Move the current largest element (root of the heap) to the end
    swap(array, 0, heapEnd);
    // Reduce the heap size and heapify the new root
    heapifyMax(array, 0, heapEnd);
  });

  return array;
};