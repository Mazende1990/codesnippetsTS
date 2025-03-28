import { reverseRange } from '../../utils';
import { swap } from '../../utils';

/**
 * Heap utilities for managing heap data structure operations
 */
class HeapUtils {
  /**
   * Get the parent index of a node in the heap
   * @param index Current node index
   * @returns Parent node index
   * @complexity O(1)
   */
  static parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  /**
   * Get the left child index of a node in the heap
   * @param index Current node index
   * @returns Left child node index
   * @complexity O(1)
   */
  static left(index: number): number {
    return 2 * index + 1;
  }

  /**
   * Get the right child index of a node in the heap
   * @param index Current node index
   * @returns Right child node index
   * @complexity O(1)
   */
  static right(index: number): number {
    return 2 * (index + 1);
  }

  /**
   * Check if the given index is within the heap's bounds
   * @param index Index to check
   * @param heapSize Current heap size
   * @returns Whether the index is in the heap
   */
  private static isInHeap(index: number, heapSize: number): boolean {
    return index < heapSize;
  }

  /**
   * Maintain the max-heap property for a given subtree
   * @param input Array representing the heap
   * @param index Root index of the subtree
   * @param heapSize Current size of the heap
   * @returns Modified array
   * @complexity O(log n)
   */
  static maxHeapify(input: number[], index: number, heapSize: number): number[] {
    const leftChild = this.left(index);
    const rightChild = this.right(index);
    
    let largestIndex = index;

    // Find the largest element among root and its children
    if (this.isInHeap(leftChild, heapSize) && input[leftChild] > input[largestIndex]) {
      largestIndex = leftChild;
    }

    if (this.isInHeap(rightChild, heapSize) && input[rightChild] > input[largestIndex]) {
      largestIndex = rightChild;
    }

    // Recursively heapify if root is not the largest
    if (largestIndex !== index) {
      swap(input, index, largestIndex);
      this.maxHeapify(input, largestIndex, heapSize);
    }

    return input;
  }

  /**
   * Convert the input array into a max-heap
   * @param input Array to transform into a max-heap
   * @returns Max-heap array
   * @complexity O(n)
   */
  static buildMaxHeap(input: number[]): number[] {
    // Start from the last non-leaf node
    const firstLeafIndex = Math.floor((input.length - 1) / 2);

    // Heapify all subtrees from bottom to top
    reverseRange(firstLeafIndex).forEach(index => {
      this.maxHeapify(input, index, input.length);
    });

    return input;
  }
}

/**
 * Sort an array using the heap sort algorithm
 * @param input Array to be sorted
 * @returns Sorted array
 * @complexity O(n log n)
 */
export function heapSort(input: number[]): number[] {
  // Build max heap
  HeapUtils.buildMaxHeap(input);

  // Extract elements from heap one by one
  reverseRange(input.length - 1).forEach(heapEnd => {
    // Move current root to end
    swap(input, 0, heapEnd);
    
    // Max heapify the reduced heap
    HeapUtils.maxHeapify(input, 0, heapEnd);
  });

  return input;
}