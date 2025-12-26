interface Problem {
  id: number;
  title: string;
  description: string;
  example: string;
  starterCode: string;
  expectedOutputs: string[];
}

interface Topic {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  problems: Problem[];
}

// All problems data
export const problems: Problem[] = [
  {
    id: 1,
    title: "Filter Even Numbers",
    description: "Create a function that takes an array of numbers and returns a new array containing only the even numbers.",
    example: `Input: [1, 2, 3, 4, 5, 6]
Output: [2, 4, 6]`,
    starterCode: `function filterEvenNumbers(numbers) {
  // Your code here
}

// Test cases
console.log(filterEvenNumbers([1, 2, 3, 4, 5, 6]));
console.log(filterEvenNumbers([1, 3, 5, 7, 9]));`,
    expectedOutputs: ["[2,4,6]", "[]"]
  },
  {
    id: 2,
    title: "Calculate Array Average",
    description: "Write a function that calculates the average of all numbers in an array.",
    example: `Input: [1, 2, 3, 4, 5]
Output: 3`,
    starterCode: `function calculateAverage(numbers) {
  // Your code here
}

// Test cases
console.log(calculateAverage([1, 2, 3, 4, 5]));
console.log(calculateAverage([10, 20, 30, 40, 50]));`,
    expectedOutputs: ["3", "30"]
  },
  {
    id: 3,
    title: "Find Duplicate Elements",
    description: "Create a function that finds all duplicate elements in an array.",
    example: `Input: [1, 2, 2, 3, 4, 4, 5]
Output: [2, 4]`,
    starterCode: `function findDuplicates(array) {
  // Your code here
}

// Test cases
console.log(findDuplicates([1, 2, 2, 3, 4, 4, 5]));
console.log(findDuplicates([1, 1, 1, 2, 2, 3]));`,
    expectedOutputs: ["[2,4]", "[1,2]"]
  }
];

// All topics data
export const topics: Topic[] = [
  {
    id: 1,
    title: "JavaScript Array Methods",
    description: "Learn and practice essential array manipulation techniques",
    videoUrl: "https://www.youtube.com/embed/rRgD1yVwIvE",
    problems: [
      {
        id: 1,
        title: "Filter Even Numbers",
        description: "Create a function that takes an array of numbers and returns a new array containing only the even numbers.",
        example: `Input: [1, 2, 3, 4, 5, 6]
Output: [2, 4, 6]`,
        starterCode: `function filterEvenNumbers(numbers) {
  // Your code here
}

// Test cases
console.log(filterEvenNumbers([1, 2, 3, 4, 5, 6]));
console.log(filterEvenNumbers([1, 3, 5, 7, 9]));`,
        expectedOutputs: ["[2,4,6]", "[]"]
      },
      {
        id: 2,
        title: "Calculate Array Average",
        description: "Write a function that calculates the average of all numbers in an array.",
        example: `Input: [1, 2, 3, 4, 5]
Output: 3`,
        starterCode: `function calculateAverage(numbers) {
  // Your code here
}

// Test cases
console.log(calculateAverage([1, 2, 3, 4, 5]));
console.log(calculateAverage([10, 20, 30, 40, 50]));`,
        expectedOutputs: ["3", "30"]
      },
      {
        id: 3,
        title: "Find Duplicate Elements",
        description: "Create a function that finds all duplicate elements in an array.",
        example: `Input: [1, 2, 2, 3, 4, 4, 5]
Output: [2, 4]`,
        starterCode: `function findDuplicates(array) {
  // Your code here
}

// Test cases
console.log(findDuplicates([1, 2, 2, 3, 4, 4, 5]));
console.log(findDuplicates([1, 1, 1, 2, 2, 3]));`,
        expectedOutputs: ["[2,4]", "[1,2]"]
      }
    ]
  },
  {
    id: 2,
    title: "JavaScript Objects",
    description: "Master JavaScript object manipulation and methods",
    videoUrl: "https://www.youtube.com/embed/3PHXvlpOkf4",
    problems: [
      {
        id: 4,
        title: "Object Property Counter",
        description: "Write a function that counts the number of properties in an object.",
        example: `Input: { name: 'John', age: 30, city: 'New York' }
Output: 3`,
        starterCode: `function countProperties(obj) {
  // Your code here
}

// Test cases
console.log(countProperties({ name: 'John', age: 30, city: 'New York' }));
console.log(countProperties({}));`,
        expectedOutputs: ["3", "0"]
      },
      {
        id: 5,
        title: "Object Value Sum",
        description: "Create a function that sums all numeric values in an object.",
        example: `Input: { a: 1, b: 2, c: 3 }
Output: 6`,
        starterCode: `function sumObjectValues(obj) {
  // Your code here
}

// Test cases
console.log(sumObjectValues({ a: 1, b: 2, c: 3 }));
console.log(sumObjectValues({ x: 10, y: 20, z: 30 }));`,
        expectedOutputs: ["6", "60"]
      },
      {
        id: 6,
        title: "Object Key Filter",
        description: "Write a function that filters object keys based on a condition.",
        example: `Input: { name: 'John', age: 30, city: 'New York', country: 'USA' }
Output: { name: 'John', city: 'New York' }`,
        starterCode: `function filterObjectKeys(obj) {
  // Your code here
}

// Test cases
console.log(filterObjectKeys({ name: 'John', age: 30, city: 'New York', country: 'USA' }));
console.log(filterObjectKeys({ a: 1, b: 2, c: 3, d: 4 }));`,
        expectedOutputs: ['{"name":"John","city":"New York"}', '{"a":1,"c":3}']
      }
    ]
  },
  {
    id: 3,
    title: "Linked Lists",
    description: "Master linked list operations and implementations",
    videoUrl: "https://www.youtube.com/embed/R9PTBwOzceo",
    problems: [
      {
        id: 7,
        title: "Reverse a Linked List",
        description: "Write a function that reverses a singly linked list.",
        example: `Input: 1 -> 2 -> 3 -> 4 -> 5
Output: 5 -> 4 -> 3 -> 2 -> 1`,
        starterCode: `class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  // Your code here
}

// Test cases
const list = new ListNode(1);
list.next = new ListNode(2);
list.next.next = new ListNode(3);
console.log(reverseList(list));`,
        expectedOutputs: ["ListNode { val: 3, next: ListNode { val: 2, next: ListNode { val: 1, next: null } } }"]
      },
      {
        id: 8,
        title: "Detect Cycle",
        description: "Detect if a linked list has a cycle in it.",
        example: `Input: 1 -> 2 -> 3 -> 4 -> 2 (points back to 2)
Output: true`,
        starterCode: `function hasCycle(head) {
  // Your code here
}

// Test cases
const list = new ListNode(1);
list.next = new ListNode(2);
list.next.next = list.next; // Creates cycle
console.log(hasCycle(list));`,
        expectedOutputs: ["true"]
      },
      {
        id: 9,
        title: "Middle Node",
        description: "Find the middle node of a linked list.",
        example: `Input: 1 -> 2 -> 3 -> 4 -> 5
Output: 3`,
        starterCode: `function findMiddle(head) {
  // Your code here
}

// Test cases
const list = new ListNode(1);
list.next = new ListNode(2);
list.next.next = new ListNode(3);
console.log(findMiddle(list));`,
        expectedOutputs: ["ListNode { val: 2, next: ListNode { val: 3, next: null } }"]
      }
    ]
  },
  {
    id: 4,
    title: "Binary Trees",
    description: "Learn tree traversal and manipulation techniques",
    videoUrl: "https://www.youtube.com/embed/fAAZixBzIAI",
    problems: [
      {
        id: 10,
        title: "Tree Height",
        description: "Calculate the maximum height of a binary tree.",
        example: `Input:     1
           /  \\
          2    3
         / \\
        4   5
Output: 3`,
        starterCode: `class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function treeHeight(root) {
  // Your code here
}

// Test cases
const tree = new TreeNode(1);
tree.left = new TreeNode(2);
tree.right = new TreeNode(3);
console.log(treeHeight(tree));`,
        expectedOutputs: ["2"]
      },
      {
        id: 11,
        title: "Level Order Traversal",
        description: "Implement level-order traversal of a binary tree.",
        example: `Input:     1
           /  \\
          2    3
Output: [1, 2, 3]`,
        starterCode: `function levelOrder(root) {
  // Your code here
}

// Test cases
const tree = new TreeNode(1);
tree.left = new TreeNode(2);
tree.right = new TreeNode(3);
console.log(levelOrder(tree));`,
        expectedOutputs: ["[1,2,3]"]
      },
      {
        id: 12,
        title: "Is Balanced",
        description: "Check if a binary tree is height-balanced.",
        example: `Input:     1
           /  \\
          2    3
         / \\
        4   5
Output: true`,
        starterCode: `function isBalanced(root) {
  // Your code here
}

// Test cases
const tree = new TreeNode(1);
tree.left = new TreeNode(2);
tree.right = new TreeNode(3);
console.log(isBalanced(tree));`,
        expectedOutputs: ["true"]
      }
    ]
  },
  {
    id: 5,
    title: "Stack & Queue",
    description: "Master stack and queue data structures",
    videoUrl: "https://www.youtube.com/embed/wjI1WNcIntg",
    problems: [
      {
        id: 13,
        title: "Valid Parentheses",
        description: "Check if a string of parentheses is valid.",
        example: `Input: "({[]})"
Output: true`,
        starterCode: `function isValid(s) {
  // Your code here
}

// Test cases
console.log(isValid("({[]})"));
console.log(isValid("({[}])"));`,
        expectedOutputs: ["true", "false"]
      },
      {
        id: 14,
        title: "Queue using Stacks",
        description: "Implement a queue using only stacks.",
        example: `Operations: push(1), push(2), peek(), pop(), empty()
Output: 1, false`,
        starterCode: `class MyQueue {
  constructor() {
    // Initialize your data structure here
  }
  
  push(x) {
    // Your code here
  }
  
  pop() {
    // Your code here
  }
  
  peek() {
    // Your code here
  }
  
  empty() {
    // Your code here
  }
}`,
        expectedOutputs: ["1", "false"]
      },
      {
        id: 15,
        title: "Min Stack",
        description: "Design a stack that supports push, pop, top, and retrieving the minimum element.",
        example: `Operations: push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()
Output: -3, 0, -2`,
        starterCode: `class MinStack {
  constructor() {
    // Initialize your data structure here
  }
  
  push(val) {
    // Your code here
  }
  
  pop() {
    // Your code here
  }
  
  top() {
    // Your code here
  }
  
  getMin() {
    // Your code here
  }
}`,
        expectedOutputs: ["-3", "0", "-2"]
      }
    ]
  },
  {
    id: 6,
    title: "Graph Algorithms",
    description: "Learn fundamental graph traversal and shortest path algorithms",
    videoUrl: "https://www.youtube.com/embed/tWVWeAqZ0WU",
    problems: [
      {
        id: 16,
        title: "BFS Implementation",
        description: "Implement Breadth-First Search for a graph.",
        example: `Input: Graph with edges [[0,1], [0,2], [1,2], [2,3]]
Output: [0, 1, 2, 3]`,
        starterCode: `function bfs(graph, start) {
  // Your code here
}

// Test cases
const graph = [[1,2], [0,2], [0,1,3], [2]];
console.log(bfs(graph, 0));`,
        expectedOutputs: ["[0,1,2,3]"]
      },
      {
        id: 17,
        title: "DFS Implementation",
        description: "Implement Depth-First Search for a graph.",
        example: `Input: Graph with edges [[0,1], [0,2], [1,2], [2,3]]
Output: [0, 1, 2, 3]`,
        starterCode: `function dfs(graph, start) {
  // Your code here
}

// Test cases
const graph = [[1,2], [0,2], [0,1,3], [2]];
console.log(dfs(graph, 0));`,
        expectedOutputs: ["[0,1,2,3]", "[0,2,1,3]"]
      },
      {
        id: 18,
        title: "Number of Islands",
        description: "Count the number of islands in a 2D grid.",
        example: `Input: [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
Output: 3`,
        starterCode: `function numIslands(grid) {
  // Your code here
}

// Test cases
const grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
];
console.log(numIslands(grid));`,
        expectedOutputs: ["3"]
      }
    ]
  },
  {
    id: 7,
    title: "Dynamic Programming",
    description: "Master dynamic programming techniques and patterns",
    videoUrl: "https://www.youtube.com/embed/oBt53YbR9Kk",
    problems: [
      {
        id: 19,
        title: "Fibonacci Number",
        description: "Calculate the nth Fibonacci number using dynamic programming.",
        example: `Input: n = 5
Output: 5 (1,1,2,3,5)`,
        starterCode: `function fib(n) {
  // Your code here
}

// Test cases
console.log(fib(5));
console.log(fib(7));`,
        expectedOutputs: ["5", "13"]
      },
      {
        id: 20,
        title: "Climbing Stairs",
        description: "Count the number of ways to climb n stairs taking 1 or 2 steps at a time.",
        example: `Input: n = 3
Output: 3 (1+1+1, 1+2, 2+1)`,
        starterCode: `function climbStairs(n) {
  // Your code here
}

// Test cases
console.log(climbStairs(3));
console.log(climbStairs(4));`,
        expectedOutputs: ["3", "5"]
      },
      {
        id: 21,
        title: "Coin Change",
        description: "Find the minimum number of coins needed to make a given amount.",
        example: `Input: coins = [1,2,5], amount = 11
Output: 3 (5+5+1)`,
        starterCode: `function coinChange(coins, amount) {
  // Your code here
}

// Test cases
console.log(coinChange([1,2,5], 11));
console.log(coinChange([2,5,10], 27));`,
        expectedOutputs: ["3", "6"]
      }
    ]
  },
  {
    id: 8,
    title: "Binary Search",
    description: "Learn binary search and its variations",
    videoUrl: "https://www.youtube.com/embed/P3YID7liBug",
    problems: [
      {
        id: 22,
        title: "Basic Binary Search",
        description: "Implement binary search to find a target in a sorted array.",
        example: `Input: nums = [1,2,3,4,5], target = 3
Output: 2`,
        starterCode: `function binarySearch(nums, target) {
  // Your code here
}

// Test cases
console.log(binarySearch([1,2,3,4,5], 3));
console.log(binarySearch([1,3,5,7,9], 7));`,
        expectedOutputs: ["2", "3"]
      },
      {
        id: 23,
        title: "First Bad Version",
        description: "Find the first bad version using binary search.",
        example: `Input: n = 5, bad = 4
Output: 4`,
        starterCode: `function firstBadVersion(n) {
  // Your code here
}

// Test cases
console.log(firstBadVersion(5));
console.log(firstBadVersion(10));`,
        expectedOutputs: ["4", "8"]
      },
      {
        id: 24,
        title: "Search in Rotated Array",
        description: "Search for a target in a rotated sorted array.",
        example: `Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4`,
        starterCode: `function search(nums, target) {
  // Your code here
}

// Test cases
console.log(search([4,5,6,7,0,1,2], 0));
console.log(search([5,6,7,8,9,1,2,3], 3));`,
        expectedOutputs: ["4", "7"]
      }
    ]
  },
  {
    id: 9,
    title: "Sorting Algorithms",
    description: "Implement and understand different sorting techniques",
    videoUrl: "https://www.youtube.com/embed/Hoixgm4-P4M",
    problems: [
      {
        id: 25,
        title: "Merge Sort",
        description: "Implement merge sort algorithm.",
        example: `Input: [64, 34, 25, 12, 22, 11, 90]
Output: [11, 12, 22, 25, 34, 64, 90]`,
        starterCode: `function mergeSort(arr) {
  // Your code here
}

// Test cases
console.log(mergeSort([64, 34, 25, 12, 22, 11, 90]));
console.log(mergeSort([5,2,8,1,9]));`,
        expectedOutputs: ["[11,12,22,25,34,64,90]", "[1,2,5,8,9]"]
      },
      {
        id: 26,
        title: "Quick Sort",
        description: "Implement quick sort algorithm.",
        example: `Input: [64, 34, 25, 12, 22, 11, 90]
Output: [11, 12, 22, 25, 34, 64, 90]`,
        starterCode: `function quickSort(arr) {
  // Your code here
}

// Test cases
console.log(quickSort([64, 34, 25, 12, 22, 11, 90]));
console.log(quickSort([5,2,8,1,9]));`,
        expectedOutputs: ["[11,12,22,25,34,64,90]", "[1,2,5,8,9]"]
      },
      {
        id: 27,
        title: "Bubble Sort",
        description: "Implement bubble sort algorithm.",
        example: `Input: [64, 34, 25, 12, 22, 11, 90]
Output: [11, 12, 22, 25, 34, 64, 90]`,
        starterCode: `function bubbleSort(arr) {
  // Your code here
}

// Test cases
console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));
console.log(bubbleSort([5,2,8,1,9]));`,
        expectedOutputs: ["[11,12,22,25,34,64,90]", "[1,2,5,8,9]"]
      }
    ]
  },
  {
    id: 10,
    title: "Hash Tables",
    description: "Learn hash table implementations and problem-solving",
    videoUrl: "https://www.youtube.com/embed/shs0KM3wKv8",
    problems: [
      {
        id: 28,
        title: "Two Sum",
        description: "Find two numbers in an array that add up to a target.",
        example: `Input: nums = [2,7,11,15], target = 9
Output: [0,1]`,
        starterCode: `function twoSum(nums, target) {
  // Your code here
}

// Test cases
console.log(twoSum([2,7,11,15], 9));
console.log(twoSum([3,2,4], 6));`,
        expectedOutputs: ["[0,1]", "[1,2]"]
      },
      {
        id: 29,
        title: "First Unique Character",
        description: "Find the first non-repeating character in a string.",
        example: `Input: s = "leetcode"
Output: 0`,
        starterCode: `function firstUniqChar(s) {
  // Your code here
}

// Test cases
console.log(firstUniqChar("leetcode"));
console.log(firstUniqChar("loveleetcode"));`,
        expectedOutputs: ["0", "2"]
      },
      {
        id: 30,
        title: "Group Anagrams",
        description: "Group strings that are anagrams of each other.",
        example: `Input: ["eat","tea","tan","ate","nat","bat"]
Output: [["eat","tea","ate"],["tan","nat"],["bat"]]`,
        starterCode: `function groupAnagrams(strs) {
  // Your code here
}

// Test cases
console.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]));
console.log(groupAnagrams([""]));`,
        expectedOutputs: ['[["eat","tea","ate"],["tan","nat"],["bat"]]', '[[""]]']
      }
    ]
  }
];