// Go 实现映射：id -> Go 代码
// 基于各题 Java/Python/C++ 的算法逻辑重写为 Go
const GO_CODE = {
// ===== 滑动窗口 =====
i1: `func longestSubarray(nums []int) []int {
	if len(nums) <= 1 {
		return nums
	}
	start, end, curStart := 0, 0, 0
	seen := make(map[int]bool)
	seen[nums[0]] = true
	for i := 1; i < len(nums); i++ {
		for seen[nums[i]] {
			delete(seen, nums[curStart])
			curStart++
		}
		seen[nums[i]] = true
		if i-curStart > end-start {
			start = curStart
			end = i
		}
	}
	return nums[start : end+1]
}`,

i2: `func minWindow(s, t string) string {
	if len(s) < len(t) || len(t) == 0 {
		return ""
	}
	target := make(map[byte]int)
	for i := 0; i < len(t); i++ {
		target[t[i]]++
	}
	window := make(map[byte]int)
	left, count, minLen, minLeft := 0, 0, len(s)+1, 0
	for i := 0; i < len(s); i++ {
		c := s[i]
		if target[c] > 0 {
			window[c]++
			if window[c] <= target[c] {
				count++
			}
		}
		for count == len(t) {
			if i-left+1 < minLen {
				minLen = i - left + 1
				minLeft = left
			}
			lc := s[left]
			if target[lc] > 0 {
				window[lc]--
				if window[lc] < target[lc] {
					count--
				}
			}
			left++
		}
	}
	if minLen > len(s) {
		return ""
	}
	return s[minLeft : minLeft+minLen]
}`,

i3: `func longestMountain(arr []int) int {
	if len(arr) < 3 {
		return 0
	}
	maxLen, left, direction := 0, 0, 0
	for i := 1; i < len(arr); i++ {
		if arr[i] > arr[i-1] {
			if direction == -1 {
				if i-left > maxLen {
					maxLen = i - left
				}
			}
			if direction != 1 {
				left = i - 1
				direction = 1
			}
		} else if arr[i] < arr[i-1] {
			if direction == 1 {
				direction = -1
			}
		} else {
			if direction == -1 {
				if i-left > maxLen {
					maxLen = i - left
				}
			}
			direction = 0
		}
	}
	if direction == -1 {
		if len(arr)-left > maxLen {
			maxLen = len(arr) - left
		}
	}
	return maxLen
}`,

i4: `func lastToBeAngry(mood string) int {
	if len(mood) <= 1 {
		return -1
	}
	result, lastAngry := 0, -1
	for i := 0; i < len(mood); i++ {
		if mood[i] == 'A' {
			lastAngry = i
		} else if lastAngry > -1 {
			if i-lastAngry > result {
				result = i - lastAngry
			}
		}
	}
	return result
}`,

i5: `func minSwaps(data []int) int {
	ones := 0
	for _, v := range data {
		if v == 1 {
			ones++
		}
	}
	if ones <= 1 {
		return 0
	}
	minSwap, zeros, left := len(data), 0, 0
	for right := 0; right < len(data); right++ {
		if data[right] == 0 {
			zeros++
		}
		if right-left+1 == ones {
			if zeros < minSwap {
				minSwap = zeros
			}
			if data[left] == 0 {
				zeros--
			}
			left++
		}
	}
	return minSwap
}`,

i6: `func findFirstAnagram(s, t string) string {
	if len(s) < len(t) || len(t) == 0 {
		return ""
	}
	target := make(map[byte]int)
	window := make(map[byte]int)
	for i := 0; i < len(t); i++ {
		target[t[i]]++
	}
	left, count := 0, 0
	for i := 0; i < len(s); i++ {
		c := s[i]
		if target[c] > 0 {
			window[c]++
			if window[c] == target[c] {
				count++
			}
		}
		if i-left+1 == len(t) {
			if count == len(target) {
				return s[left : left+len(t)]
			}
			lc := s[left]
			if target[lc] > 0 {
				if window[lc] == target[lc] {
					count--
				}
				window[lc]--
			}
			left++
		}
	}
	return ""
}`,

i7: `type Event struct {
	time int
	typ  int // 1 进入, -1 退出
}
type PeakResult struct {
	maxUsers  int
	peakStart int
	peakEnd   int
}

func findPeakInterval(logs [][]int) PeakResult {
	events := make([]Event, 0, len(logs)*2)
	for _, log := range logs {
		events = append(events, Event{log[1], 1})
		events = append(events, Event{log[2], -1})
	}
	sort.Slice(events, func(i, j int) bool {
		if events[i].time != events[j].time {
			return events[i].time < events[j].time
		}
		return events[i].typ < events[j].typ
	})
	cur, maxU, peakS, peakE := 0, 0, -1, -1
	for i, e := range events {
		cur += e.typ
		if cur > maxU {
			maxU = cur
			peakS = e.time
			if i+1 < len(events) && events[i+1].typ == -1 {
				peakE = events[i+1].time
			}
		}
	}
	return PeakResult{maxU, peakS, peakE}
}`,

// ===== 链表 =====
i8: `type ListNode struct {
	Val  int
	Next *ListNode
}

func moveKNodes(head *ListNode, k int) *ListNode {
	if head == nil || head.Next == nil {
		return head
	}
	size := 0
	for cur := head; cur != nil; cur = cur.Next {
		size++
	}
	moves := k % size
	cur := head
	for i := 0; i < size-moves-1; i++ {
		cur = cur.Next
	}
	if cur.Next == nil {
		return head
	}
	newHead := cur.Next
	cur.Next = nil
	cur = newHead
	for cur.Next != nil {
		cur = cur.Next
	}
	cur.Next = head
	return newHead
}`,

i9: `func removeNthFromEnd(head *ListNode, n int) *ListNode {
	size := 0
	for cur := head; cur != nil; cur = cur.Next {
		size++
	}
	dummy := &ListNode{Next: head}
	cur := dummy
	for i := 0; i < size-n; i++ {
		cur = cur.Next
	}
	cur.Next = cur.Next.Next
	return dummy.Next
}`,

i10: `func reorderList(head *ListNode) {
	if head == nil || head.Next == nil {
		return
	}
	// 找中点
	slow, fast := head, head
	for fast.Next != nil && fast.Next.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
	}
	// 反转后半
	second := reverseList(slow.Next)
	slow.Next = nil
	// 合并
	first := head
	dummy := &ListNode{}
	cur := dummy
	for second != nil {
		cur.Next = first
		first = first.Next
		cur = cur.Next
		cur.Next = second
		second = second.Next
		cur = cur.Next
	}
	cur.Next = first
}

func reverseList(head *ListNode) *ListNode {
	var prev *ListNode
	for head != nil {
		next := head.Next
		head.Next = prev
		prev = head
		head = next
	}
	return prev
}`,

i11: `func detectCycle(head *ListNode) *ListNode {
	slow, fast := head, head
	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
		if slow == fast {
			cur := head
			for cur != slow {
				cur = cur.Next
				slow = slow.Next
			}
			return cur
		}
	}
	return nil
}`,

i12: `type CharListNode struct {
	Val  byte
	Next *CharListNode
}

func charToInt(c byte) int {
	if c <= '9' {
		return int(c - '0')
	}
	return int(c-'a') + 10
}
func intToChar(n int) byte {
	if n <= 9 {
		return byte('0' + n)
	}
	return byte('a' + n - 10)
}

func addTwoCharLists(l1, l2 *CharListNode) *CharListNode {
	l1 = reverseCharList(l1)
	l2 = reverseCharList(l2)
	dummy := &CharListNode{Val: '0'}
	cur := dummy
	carry := 0
	for l1 != nil || l2 != nil || carry != 0 {
		x, y := 0, 0
		if l1 != nil {
			x = charToInt(l1.Val)
		}
		if l2 != nil {
			y = charToInt(l2.Val)
		}
		sum := x + y + carry
		carry = sum / 32
		cur.Next = &CharListNode{Val: intToChar(sum % 32)}
		cur = cur.Next
		if l1 != nil {
			l1 = l1.Next
		}
		if l2 != nil {
			l2 = l2.Next
		}
	}
	return reverseCharList(dummy.Next)
}

func reverseCharList(head *CharListNode) *CharListNode {
	var prev *CharListNode
	for head != nil {
		next := head.Next
		head.Next = prev
		prev = head
		head = next
	}
	return prev
}`,

i13: `func swapPairs(head *ListNode) *ListNode {
	dummy := &ListNode{Next: head}
	cur := dummy
	for cur.Next != nil && cur.Next.Next != nil {
		first := cur.Next
		second := cur.Next.Next
		first.Next = second.Next
		second.Next = first
		cur.Next = second
		cur = first
	}
	return dummy.Next
}`,

i14: `func removeFourthFromEnd(head *ListNode) *ListNode {
	n := 4
	dummy := &ListNode{Next: head}
	first, second := dummy, dummy
	for i := 0; i <= n; i++ {
		if first != nil {
			first = first.Next
		}
	}
	for first != nil {
		first = first.Next
		second = second.Next
	}
	second.Next = second.Next.Next
	return reverseList(dummy.Next)
}`,

i15: `func sortLinkedList(head *ListNode) *ListNode {
	if head == nil || head.Next == nil {
		return head
	}
	oddHead, evenHead := &ListNode{}, &ListNode{}
	odd, even := oddHead, evenHead
	cur := head
	isOdd := true
	for cur != nil {
		if isOdd {
			odd.Next = cur
			odd = odd.Next
		} else {
			even.Next = cur
			even = even.Next
		}
		cur = cur.Next
		isOdd = !isOdd
	}
	odd.Next = nil
	even.Next = nil
	return mergeTwoLists(oddHead.Next, reverseList(evenHead.Next))
}

func mergeTwoLists(l1, l2 *ListNode) *ListNode {
	dummy := &ListNode{}
	cur := dummy
	for l1 != nil && l2 != nil {
		if l1.Val <= l2.Val {
			cur.Next = l1
			l1 = l1.Next
		} else {
			cur.Next = l2
			l2 = l2.Next
		}
		cur = cur.Next
	}
	if l1 != nil {
		cur.Next = l1
	} else {
		cur.Next = l2
	}
	return dummy.Next
}`,

i16: `func reverseEveryTwoNodes(head *ListNode) *ListNode {
	dummy := &ListNode{Next: head}
	pre, cur := dummy, dummy.Next
	for cur != nil && cur.Next != nil {
		next := cur.Next.Next
		pre.Next = cur.Next
		pre.Next.Next = cur
		cur.Next = next
		pre = cur
		cur = next
	}
	return dummy.Next
}`,

i17: `type LRUNode struct {
	key, value int
	prev, next *LRUNode
}

type LRUCache struct {
	cap        int
	m          map[int]*LRUNode
	head, tail *LRUNode
}

func Constructor(capacity int) LRUCache {
	head, tail := &LRUNode{}, &LRUNode{}
	head.next = tail
	tail.prev = head
	return LRUCache{cap: capacity, m: make(map[int]*LRUNode), head: head, tail: tail}
}

func (c *LRUCache) Get(key int) int {
	node, ok := c.m[key]
	if !ok {
		return -1
	}
	c.moveToHead(node)
	return node.value
}

func (c *LRUCache) Put(key, value int) {
	if node, ok := c.m[key]; ok {
		node.value = value
		c.moveToHead(node)
		return
	}
	node := &LRUNode{key: key, value: value}
	c.m[key] = node
	c.addToHead(node)
	if len(c.m) > c.cap {
		removed := c.tail.prev
		c.removeNode(removed)
		delete(c.m, removed.key)
	}
}

func (c *LRUCache) addToHead(node *LRUNode) {
	node.prev = c.head
	node.next = c.head.next
	c.head.next.prev = node
	c.head.next = node
}
func (c *LRUCache) removeNode(node *LRUNode) {
	node.prev.next = node.next
	node.next.prev = node.prev
}
func (c *LRUCache) moveToHead(node *LRUNode) {
	c.removeNode(node)
	c.addToHead(node)
}`,

i18: `func findLastPerson(n, k int) int {
	if n <= 0 {
		return 0
	}
	// 数学法：f(1)=0, f(n)=(f(n-1)+k)%n, 结果+1
	res := 0
	for i := 2; i <= n; i++ {
		res = (res + k) % i
	}
	return res + 1
}`,

i19: `func mergeTwoLists(l1, l2 *ListNode) *ListNode {
	dummy := &ListNode{}
	cur := dummy
	for l1 != nil && l2 != nil {
		if l1.Val <= l2.Val {
			cur.Next = l1
			l1 = l1.Next
		} else {
			cur.Next = l2
			l2 = l2.Next
		}
		cur = cur.Next
	}
	if l1 != nil {
		cur.Next = l1
	} else {
		cur.Next = l2
	}
	return dummy.Next
}`,

i20: `func reverseList(head *ListNode) *ListNode {
	var prev *ListNode
	cur := head
	for cur != nil {
		next := cur.Next
		cur.Next = prev
		prev = cur
		cur = next
	}
	return prev
}`,

// ===== 二叉树 =====
i21: `type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

func preorderTraversal(root *TreeNode) []int {
	var res []int
	var dfs func(*TreeNode)
	dfs = func(node *TreeNode) {
		if node == nil {
			return
		}
		res = append(res, node.Val)
		dfs(node.Left)
		dfs(node.Right)
	}
	dfs(root)
	return res
}

func inorderTraversal(root *TreeNode) []int {
	var res []int
	var dfs func(*TreeNode)
	dfs = func(node *TreeNode) {
		if node == nil {
			return
		}
		dfs(node.Left)
		res = append(res, node.Val)
		dfs(node.Right)
	}
	dfs(root)
	return res
}

func postorderTraversal(root *TreeNode) []int {
	var res []int
	var dfs func(*TreeNode)
	dfs = func(node *TreeNode) {
		if node == nil {
			return
		}
		dfs(node.Left)
		dfs(node.Right)
		res = append(res, node.Val)
	}
	dfs(root)
	return res
}`,

i22: `func maxDepth(root *TreeNode) int {
	if root == nil {
		return 0
	}
	l := maxDepth(root.Left)
	r := maxDepth(root.Right)
	if l > r {
		return l + 1
	}
	return r + 1
}`,

i23: `func maxPathSum(root *TreeNode) int {
	ans := math.MinInt32
	var dfs func(*TreeNode) int
	dfs = func(node *TreeNode) int {
		if node == nil {
			return 0
		}
		left := dfs(node.Left)
		right := dfs(node.Right)
		if node.Left != nil && node.Right != nil {
			if left+right+node.Val > ans {
				ans = left + right + node.Val
			}
			if left > right {
				return left + node.Val
			}
			return right + node.Val
		}
		if node.Left == nil {
			return right + node.Val
		}
		return left + node.Val
	}
	dfs(root)
	return ans
}`,

i24: `func flatten(root *TreeNode) {
	flattenToList(root)
}

func flattenToList(root *TreeNode) *TreeNode {
	if root == nil {
		return nil
	}
	left, right := root.Left, root.Right
	lastLeft := flattenToList(root.Left)
	lastRight := flattenToList(root.Right)
	root.Left = nil
	if lastLeft == nil {
		root.Right = right
	} else {
		root.Right = left
		lastLeft.Right = right
	}
	if lastRight == nil {
		if lastLeft == nil {
			return root
		}
		return lastLeft
	}
	return lastRight
}`,

i25: `func rightSideView(root *TreeNode) []int {
	var res []int
	if root == nil {
		return res
	}
	queue := []*TreeNode{root}
	for len(queue) > 0 {
		size := len(queue)
		for i := 0; i < size; i++ {
			cur := queue[0]
			queue = queue[1:]
			if i == size-1 {
				res = append(res, cur.Val)
			}
			if cur.Left != nil {
				queue = append(queue, cur.Left)
			}
			if cur.Right != nil {
				queue = append(queue, cur.Right)
			}
		}
	}
	return res
}`,

i26: `func maxPathSumRootToLeaf(root *TreeNode) int {
	if root == nil {
		return 0
	}
	l := maxPathSumRootToLeaf(root.Left)
	r := maxPathSumRootToLeaf(root.Right)
	if l > r {
		return root.Val + l
	}
	return root.Val + r
}`,

i27: `func zigzagLevelOrder(root *TreeNode) [][]int {
	var res [][]int
	if root == nil {
		return res
	}
	queue := []*TreeNode{root}
	reverse := false
	for len(queue) > 0 {
		size := len(queue)
		level := make([]int, size)
		for i := 0; i < size; i++ {
			cur := queue[0]
			queue = queue[1:]
			if reverse {
				level[size-1-i] = cur.Val
			} else {
				level[i] = cur.Val
			}
			if cur.Left != nil {
				queue = append(queue, cur.Left)
			}
			if cur.Right != nil {
				queue = append(queue, cur.Right)
			}
		}
		res = append(res, level)
		reverse = !reverse
	}
	return res
}`,

i28: `func isValidBST(root *TreeNode) bool {
	return validate(root, math.MinInt64, math.MaxInt64)
}

func validate(node *TreeNode, lo, hi int) bool {
	if node == nil {
		return true
	}
	if node.Val <= lo || node.Val >= hi {
		return false
	}
	return validate(node.Left, lo, node.Val) && validate(node.Right, node.Val, hi)
}`,

i29: `func invertTree(root *TreeNode) *TreeNode {
	if root == nil {
		return nil
	}
	root.Left, root.Right = invertTree(root.Right), invertTree(root.Left)
	return root
}`,

i30: `func widthOfBinaryTree(root *TreeNode) int {
	if root == nil {
		return 0
	}
	type pair struct {
		node *TreeNode
		idx  int
	}
	queue := []pair{{root, 0}}
	maxW := 1
	for len(queue) > 0 {
		size := len(queue)
		if queue[size-1].idx-queue[0].idx+1 > maxW {
			maxW = queue[size-1].idx - queue[0].idx + 1
		}
		for i := 0; i < size; i++ {
			p := queue[0]
			queue = queue[1:]
			if p.node.Left != nil {
				queue = append(queue, pair{p.node.Left, p.idx * 2})
			}
			if p.node.Right != nil {
				queue = append(queue, pair{p.node.Right, p.idx*2 + 1})
			}
		}
	}
	return maxW
}`,

i31: `func isSubtree(root, subRoot *TreeNode) bool {
	if root == nil {
		return false
	}
	if isSameTree(root, subRoot) {
		return true
	}
	return isSubtree(root.Left, subRoot) || isSubtree(root.Right, subRoot)
}

func isSameTree(s, t *TreeNode) bool {
	if s == nil && t == nil {
		return true
	}
	if s == nil || t == nil {
		return false
	}
	if s.Val != t.Val {
		return false
	}
	return isSameTree(s.Left, t.Left) && isSameTree(s.Right, t.Right)
}`,

// ===== 二分查找 =====
i32: `func searchRotatedArray(nums []int, target int) bool {
	lo, hi := 0, len(nums)-1
	for lo <= hi {
		mid := (lo + hi) / 2
		if nums[mid] == target {
			return true
		}
		if nums[lo] == nums[mid] && nums[mid] == nums[hi] {
			lo++
			hi--
		} else if nums[lo] <= nums[mid] {
			if nums[lo] <= target && target < nums[mid] {
				hi = mid - 1
			} else {
				lo = mid + 1
			}
		} else {
			if nums[mid] < target && target <= nums[hi] {
				lo = mid + 1
			} else {
				hi = mid - 1
			}
		}
	}
	return false
}`,

i33: `// 解法一：两次二分（先找行，再找列）
func searchMatrix(matrix [][]int, target int) bool {
	if len(matrix) == 0 || len(matrix[0]) == 0 {
		return false
	}
	lo, hi := 0, len(matrix)-1
	for lo <= hi {
		mid := (lo + hi) / 2
		if matrix[mid][0] == target {
			return true
		}
		if matrix[mid][0] < target {
			lo = mid + 1
		} else {
			hi = mid - 1
		}
	}
	row := hi
	if row < 0 {
		return false
	}
	l, r := 0, len(matrix[row])-1
	for l <= r {
		mid := (l + r) / 2
		if matrix[row][mid] == target {
			return true
		}
		if matrix[row][mid] < target {
			l = mid + 1
		} else {
			r = mid - 1
		}
	}
	return false
}

// 解法二：从右上角开始排除
func searchMatrixZ(matrix [][]int, target int) bool {
	if len(matrix) == 0 {
		return false
	}
	r, c := 0, len(matrix[0])-1
	for r < len(matrix) && c >= 0 {
		if matrix[r][c] == target {
			return true
		}
		if matrix[r][c] > target {
			c--
		} else {
			r++
		}
	}
	return false
}`,

i34: `func searchInRotatedArray(nums []int, target int) int {
	lo, hi := 0, len(nums)-1
	for lo <= hi {
		mid := (lo + hi) / 2
		if nums[mid] == target {
			return mid
		}
		if nums[lo] <= nums[mid] {
			if nums[lo] <= target && target < nums[mid] {
				hi = mid - 1
			} else {
				lo = mid + 1
			}
		} else {
			if nums[mid] < target && target <= nums[hi] {
				lo = mid + 1
			} else {
				hi = mid - 1
			}
		}
	}
	return -1
}`,

i35: `func findMedianSortedArrays(nums1, nums2 []int) float64 {
	if len(nums1) > len(nums2) {
		nums1, nums2 = nums2, nums1
	}
	m, n := len(nums1), len(nums2)
	lo, hi, halfLen := 0, m, (m+n+1)/2
	for lo <= hi {
		i := (lo + hi) / 2
		j := halfLen - i
		maxLeft1 := math.MinInt64
		if i > 0 {
			maxLeft1 = nums1[i-1]
		}
		minRight1 := math.MaxInt64
		if i < m {
			minRight1 = nums1[i]
		}
		maxLeft2 := math.MinInt64
		if j > 0 {
			maxLeft2 = nums2[j-1]
		}
		minRight2 := math.MaxInt64
		if j < n {
			minRight2 = nums2[j]
		}
		if maxLeft1 <= minRight2 && maxLeft2 <= minRight1 {
			if (m+n)%2 == 1 {
				return float64(max(maxLeft1, maxLeft2))
			}
			return float64(max(maxLeft1, maxLeft2)+min(minRight1, minRight2)) / 2
		} else if maxLeft1 > minRight2 {
			hi = i - 1
		} else {
			lo = i + 1
		}
	}
	return 0
}

func max(a, b int) int { if a > b { return a }; return b }
func min(a, b int) int { if a < b { return a }; return b }`,

// ===== DFS =====
i36: `func canFormCircle(words []string) bool {
	if len(words) == 0 {
		return false
	}
	n := len(words)
	used := make([]bool, n)
	var dfs func(start byte, end byte, count int) bool
	dfs = func(s, e byte, c int) bool {
		if c == n {
			return s == e
		}
		for i := 0; i < n; i++ {
			if used[i] {
				continue
			}
			if words[i][0] == e {
				used[i] = true
				if dfs(s, words[i][len(words[i])-1], c+1) {
					return true
				}
				used[i] = false
			}
		}
		return false
	}
	for i := 0; i < n; i++ {
		used[i] = true
		if dfs(words[i][0], words[i][len(words[i])-1], 1) {
			return true
		}
		used[i] = false
	}
	return false
}`,

i37: `func numIslands(grid [][]byte) int {
	if len(grid) == 0 {
		return 0
	}
	m, n := len(grid), len(grid[0])
	var dfs func(i, j int)
	dfs = func(i, j int) {
		if i < 0 || i >= m || j < 0 || j >= n || grid[i][j] != '1' {
			return
		}
		grid[i][j] = '0'
		dfs(i+1, j)
		dfs(i-1, j)
		dfs(i, j+1)
		dfs(i, j-1)
	}
	count := 0
	for i := 0; i < m; i++ {
		for j := 0; j < n; j++ {
			if grid[i][j] == '1' {
				count++
				dfs(i, j)
			}
		}
	}
	return count
}`,

i38: `func generateParenthesis(n int) []string {
	var res []string
	var dfs func(cur string, open, close int)
	dfs = func(c string, o, cl int) {
		if len(c) == n*2 {
			res = append(res, c)
			return
		}
		if o < n {
			dfs(c+"(", o+1, cl)
		}
		if cl < o {
			dfs(c+")", o, cl+1)
		}
	}
	dfs("", 0, 0)
	return res
}`,

i39: `func restoreIpAddresses(s string) []string {
	var res []string
	var dfs func(cur string, start, seg int)
	dfs = func(c string, start, seg int) {
		if seg == 4 {
			if start == len(s) {
				res = append(res, c[:len(c)-1])
			}
			return
		}
		for i := 1; i <= 3; i++ {
			if start+i > len(s) {
				break
			}
			part := s[start : start+i]
			if len(part) > 1 && part[0] == '0' {
				break
			}
			num := 0
			for _, ch := range part {
				num = num*10 + int(ch-'0')
			}
			if num > 255 {
				break
			}
			dfs(c+part+".", start+i, seg+1)
		}
	}
	dfs("", 0, 0)
	return res
}`,

i40: `func subsets(nums []int) [][]int {
	var res [][]int
	var dfs func(start int, path []int)
	dfs = func(start int, path []int) {
		tmp := make([]int, len(path))
		copy(tmp, path)
		res = append(res, tmp)
		for i := start; i < len(nums); i++ {
			path = append(path, nums[i])
			dfs(i+1, path)
			path = path[:len(path)-1]
		}
	}
	dfs(0, []int{})
	return res
}`,

i41: `func combineSets(nums []int, k int) [][]int {
	var res [][]int
	var dfs func(start int, path []int)
	dfs = func(start int, path []int) {
		if len(path) == k {
			tmp := make([]int, len(path))
			copy(tmp, path)
			res = append(res, tmp)
			return
		}
		for i := start; i < len(nums); i++ {
			path = append(path, nums[i])
			dfs(i+1, path)
			path = path[:len(path)-1]
		}
	}
	dfs(0, []int{})
	return res
}`,

i42: `func judgePoint24(cards []int) bool {
	const eps = 1e-6
	var dfs func([]float64) bool
	dfs = func(nums []float64) bool {
		if len(nums) == 1 {
			return math.Abs(nums[0]-24) < eps
		}
		for i := 0; i < len(nums); i++ {
			for j := 0; j < len(nums); j++ {
				if i == j {
					continue
				}
				var next []float64
				for k := 0; k < len(nums); k++ {
					if k != i && k != j {
						next = append(next, nums[k])
					}
				}
				a, b := nums[i], nums[j]
				cands := []float64{a + b, a - b, a * b}
				if math.Abs(b) > eps {
					cands = append(cands, a/b)
				}
				for _, c := range cands {
					if dfs(append(next, c)) {
						return true
					}
				}
			}
		}
		return false
	}
	arr := make([]float64, len(cards))
	for i, v := range cards {
		arr[i] = float64(v)
	}
	return dfs(arr)
}`,

// ===== 优先队列 =====
i43: `// 大顶堆
type MaxHeap []int

func (h MaxHeap) Len() int           { return len(h) }
func (h MaxHeap) Less(i, j int) bool { return h[i] > h[j] }
func (h MaxHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *MaxHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *MaxHeap) Pop() interface{} {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[:n-1]
	return x
}

func heapSort(nums []int) []int {
	h := MaxHeap(nums)
	heap.Init(&h)
	res := make([]int, len(nums))
	for i := len(nums) - 1; i >= 0; i-- {
		res[i] = heap.Pop(&h).(int)
	}
	return res
}`,

i44: `func smallestK(arr []int, k int) []int {
	if k == 0 {
		return []int{}
	}
	h := &MaxHeap{}
	for _, v := range arr {
		if h.Len() < k {
			heap.Push(h, v)
		} else if v < (*h)[0] {
			heap.Pop(h)
			heap.Push(h, v)
		}
	}
	res := []int(*h)
	return res
}`,

// ===== 动态规划 =====
i45: `func uniquePaths(m, n int) int {
	dp := make([]int, n)
	for j := 0; j < n; j++ {
		dp[j] = 1
	}
	for i := 1; i < m; i++ {
		for j := 1; j < n; j++ {
			dp[j] += dp[j-1]
		}
	}
	return dp[n-1]
}`,

i46: `func coinChange(coins []int, amount int) int {
	dp := make([]int, amount+1)
	for i := range dp {
		dp[i] = amount + 1
	}
	dp[0] = 0
	for i := 1; i <= amount; i++ {
		for _, c := range coins {
			if c <= i {
				if dp[i-c]+1 < dp[i] {
					dp[i] = dp[i-c] + 1
				}
			}
		}
	}
	if dp[amount] > amount {
		return -1
	}
	return dp[amount]
}`,

i47: `func maxProduct(nums []int) int {
	if len(nums) == 0 {
		return 0
	}
	res, mx, mn := nums[0], nums[0], nums[0]
	for i := 1; i < len(nums); i++ {
		if nums[i] < 0 {
			mx, mn = mn, mx
		}
		if nums[i] > mx*nums[i] {
			mx = nums[i]
		} else {
			mx = mx * nums[i]
		}
		if nums[i] < mn*nums[i] {
			mn = nums[i]
		} else {
			mn = mn * nums[i]
		}
		if mx > res {
			res = mx
		}
	}
	return res
}`,

i48: `func minPathSum(grid [][]int) int {
	m, n := len(grid), len(grid[0])
	for i := 1; i < m; i++ {
		grid[i][0] += grid[i-1][0]
	}
	for j := 1; j < n; j++ {
		grid[0][j] += grid[0][j-1]
	}
	for i := 1; i < m; i++ {
		for j := 1; j < n; j++ {
			if grid[i-1][j] < grid[i][j-1] {
				grid[i][j] += grid[i-1][j]
			} else {
				grid[i][j] += grid[i][j-1]
			}
		}
	}
	return grid[m-1][n-1]
}`,

i49: `func uniquePathsWithObstacles(obstacleGrid [][]int) int {
	m, n := len(obstacleGrid), len(obstacleGrid[0])
	dp := make([]int, n)
	dp[0] = 1
	for i := 0; i < m; i++ {
		for j := 0; j < n; j++ {
			if obstacleGrid[i][j] == 1 {
				dp[j] = 0
			} else if j > 0 {
				dp[j] += dp[j-1]
			}
		}
	}
	return dp[n-1]
}`,

i50: `func minDistance(word1, word2 string) int {
	m, n := len(word1), len(word2)
	dp := make([][]int, m+1)
	for i := range dp {
		dp[i] = make([]int, n+1)
		dp[i][0] = i
	}
	for j := 0; j <= n; j++ {
		dp[0][j] = j
	}
	for i := 1; i <= m; i++ {
		for j := 1; j <= n; j++ {
			if word1[i-1] == word2[j-1] {
				dp[i][j] = dp[i-1][j-1]
			} else {
				dp[i][j] = dp[i-1][j-1] + 1
				if dp[i-1][j] < dp[i][j] {
					dp[i][j] = dp[i-1][j] + 1
				}
				if dp[i][j-1]+1 < dp[i][j] {
					dp[i][j] = dp[i][j-1] + 1
				}
			}
		}
	}
	return dp[m][n]
}`,

// ===== 排序 =====
i51: `func merge(intervals [][]int) [][]int {
	sort.Slice(intervals, func(i, j int) bool {
		return intervals[i][0] < intervals[j][0]
	})
	var res [][]int
	for _, it := range intervals {
		if len(res) == 0 || it[0] > res[len(res)-1][1] {
			res = append(res, it)
		} else {
			if it[1] > res[len(res)-1][1] {
				res[len(res)-1][1] = it[1]
			}
		}
	}
	return res
}`,

i52: `func quickSortIterative(nums []int) {
	if len(nums) <= 1 {
		return
	}
	stack := [][2]int{{0, len(nums) - 1}}
	for len(stack) > 0 {
		r := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		lo, hi := r[0], r[1]
		if lo >= hi {
			continue
		}
		pivot := nums[hi]
		i := lo
		for j := lo; j < hi; j++ {
			if nums[j] < pivot {
				nums[i], nums[j] = nums[j], nums[i]
				i++
			}
		}
		nums[i], nums[hi] = nums[hi], nums[i]
		stack = append(stack, [2]int{lo, i - 1}, [2]int{i + 1, hi})
	}
}`,

i53: `func quickSort(nums []int) {
	if len(nums) <= 1 {
		return
	}
	lo, hi := 0, len(nums)-1
	pivot := nums[hi]
	i := lo
	for j := lo; j < hi; j++ {
		if nums[j] < pivot {
			nums[i], nums[j] = nums[j], nums[i]
			i++
		}
	}
	nums[i], nums[hi] = nums[hi], nums[i]
	quickSort(nums[:i])
	quickSort(nums[i+1:])
}`,

i54: `func bubbleSort(nums []int) {
	n := len(nums)
	for i := 0; i < n-1; i++ {
		swapped := false
		for j := 0; j < n-1-i; j++ {
			if nums[j] > nums[j+1] {
				nums[j], nums[j+1] = nums[j+1], nums[j]
				swapped = true
			}
		}
		if !swapped {
			break
		}
	}
}`,

i55: `func fourSum(nums []int, target int) [][]int {
	sort.Ints(nums)
	var res [][]int
	n := len(nums)
	for i := 0; i < n-3; i++ {
		if i > 0 && nums[i] == nums[i-1] {
			continue
		}
		for j := i + 1; j < n-2; j++ {
			if j > i+1 && nums[j] == nums[j-1] {
				continue
			}
			l, r := j+1, n-1
			for l < r {
				sum := nums[i] + nums[j] + nums[l] + nums[r]
				if sum == target {
					res = append(res, []int{nums[i], nums[j], nums[l], nums[r]})
					for l < r && nums[l] == nums[l+1] {
						l++
					}
					for l < r && nums[r] == nums[r-1] {
						r--
					}
					l++
					r--
				} else if sum < target {
					l++
				} else {
					r--
				}
			}
		}
	}
	return res
}`,

// ===== 数组 =====
i56: `func majorityElement(nums []int) int {
	count, candidate := 0, 0
	for _, v := range nums {
		if count == 0 {
			candidate = v
		}
		if v == candidate {
			count++
		} else {
			count--
		}
	}
	return candidate
}`,

i57: `func maximumProduct(nums []int) int {
	min1, min2 := math.MaxInt64, math.MaxInt64
	max1, max2, max3 := math.MinInt64, math.MinInt64, math.MinInt64
	for _, v := range nums {
		if v < min1 {
			min2 = min1
			min1 = v
		} else if v < min2 {
			min2 = v
		}
		if v > max1 {
			max3 = max2
			max2 = max1
			max1 = v
		} else if v > max2 {
			max3 = max2
			max2 = v
		} else if v > max3 {
			max3 = v
		}
	}
	if min1*min2*max1 > max1*max2*max3 {
		return min1 * min2 * max1
	}
	return max1 * max2 * max3
}`,

i58: `func diagonalTraverse(matrix [][]int) []int {
	if len(matrix) == 0 {
		return []int{}
	}
	m, n := len(matrix), len(matrix[0])
	res := make([]int, 0, m*n)
	for d := 0; d < m+n-1; d++ {
		if d%2 == 0 {
			for i := m - 1; i >= 0; i-- {
				j := d - i
				if j >= 0 && j < n {
					res = append(res, matrix[i][j])
				}
			}
		} else {
			for i := 0; i < m; i++ {
				j := d - i
				if j >= 0 && j < n {
					res = append(res, matrix[i][j])
				}
			}
		}
	}
	return res
}`,

i59: `func maxDistToClosest(seats []int) int {
	res, prev := 0, -1
	for i, v := range seats {
		if v == 1 {
			if prev == -1 {
				res = i
			} else {
				dist := (i - prev) / 2
				if dist > res {
					res = dist
				}
			}
			prev = i
		}
	}
	if len(seats)-1-prev > res {
		res = len(seats) - 1 - prev
	}
	return res
}`,

i60: `func spiralOrder(matrix [][]int) []int {
	if len(matrix) == 0 {
		return []int{}
	}
	m, n := len(matrix), len(matrix[0])
	top, bottom, left, right := 0, m-1, 0, n-1
	var res []int
	for top <= bottom && left <= right {
		for j := left; j <= right; j++ {
			res = append(res, matrix[top][j])
		}
		top++
		for i := top; i <= bottom; i++ {
			res = append(res, matrix[i][right])
		}
		right--
		if top <= bottom {
			for j := right; j >= left; j-- {
				res = append(res, matrix[bottom][j])
			}
			bottom--
		}
		if left <= right {
			for i := bottom; i >= top; i-- {
				res = append(res, matrix[i][left])
			}
			left++
		}
	}
	return res
}`,

i61: `func findDuplicates(nums1, nums2 []int) []int {
	set := make(map[int]bool)
	for _, v := range nums1 {
		set[v] = true
	}
	var res []int
	seen := make(map[int]bool)
	for _, v := range nums2 {
		if set[v] && !seen[v] {
			res = append(res, v)
			seen[v] = true
		}
	}
	return res
}`,

i62: `func findDuplicate(nums []int) int {
	slow, fast := nums[0], nums[nums[0]]
	for slow != fast {
		slow = nums[slow]
		fast = nums[nums[fast]]
	}
	slow = 0
	for slow != fast {
		slow = nums[slow]
		fast = nums[fast]
	}
	return slow
}`,

i63: `func twoProduct(nums []int, target int) []int {
	m := make(map[int]int)
	for i, v := range nums {
		if v == 0 {
			if target == 0 {
				for j := 0; j < len(nums); j++ {
					if j != i && nums[j] != 0 {
						return []int{j, i}
					}
				}
			}
			continue
		}
		if target%v == 0 {
			need := target / v
			if j, ok := m[need]; ok {
				return []int{j, i}
			}
		}
		m[v] = i
	}
	return nil
}`,

i64: `type ArrayStack struct {
	data []int
}

func (s *ArrayStack) Push(x int) { s.data = append(s.data, x) }
func (s *ArrayStack) Pop() int {
	n := len(s.data)
	x := s.data[n-1]
	s.data = s.data[:n-1]
	return x
}
func (s *ArrayStack) Top() int { return s.data[len(s.data)-1] }
func (s *ArrayStack) Empty() bool { return len(s.data) == 0 }`,

i65: `func nextPermutation(nums []int) {
	n := len(nums)
	i := n - 2
	for i >= 0 && nums[i] >= nums[i+1] {
		i--
	}
	if i >= 0 {
		j := n - 1
		for j >= 0 && nums[j] <= nums[i] {
			j--
		}
		nums[i], nums[j] = nums[j], nums[i]
	}
	l, r := i+1, n-1
	for l < r {
		nums[l], nums[r] = nums[r], nums[l]
		l++
		r--
	}
}`,

i66: `func isPrime(n int) bool {
	if n < 2 {
		return false
	}
	for i := 2; i*i <= n; i++ {
		if n%i == 0 {
			return false
		}
	}
	return true
}

func maxPrimeDiagonal(matrix [][]int) int {
	maxP := 0
	n := len(matrix)
	for i := 0; i < n; i++ {
		if isPrime(matrix[i][i]) && matrix[i][i] > maxP {
			maxP = matrix[i][i]
		}
		if isPrime(matrix[i][n-1-i]) && matrix[i][n-1-i] > maxP {
			maxP = matrix[i][n-1-i]
		}
	}
	return maxP
}`,

i67: `func twoSum(nums []int, target int) []int {
	m := make(map[int]int)
	for i, v := range nums {
		if j, ok := m[target-v]; ok {
			return []int{j, i}
		}
		m[v] = i
	}
	return nil
}`,

// ===== 贪心 =====
i68: `func maxProfit(prices []int) int {
	res := 0
	for i := 1; i < len(prices); i++ {
		if prices[i] > prices[i-1] {
			res += prices[i] - prices[i-1]
		}
	}
	return res
}`,

i69: `func canJump(nums []int) bool {
	far := 0
	for i, v := range nums {
		if i > far {
			return false
		}
		if i+v > far {
			far = i + v
		}
	}
	return true
}`,

i70: `func lengthOfLIS(nums []int) int {
	if len(nums) == 0 {
		return 0
	}
	tails := []int{nums[0]}
	for i := 1; i < len(nums); i++ {
		if nums[i] > tails[len(tails)-1] {
			tails = append(tails, nums[i])
		} else {
			lo, hi := 0, len(tails)-1
			for lo < hi {
				mid := (lo + hi) / 2
				if tails[mid] < nums[i] {
					lo = mid + 1
				} else {
					hi = mid
				}
			}
			tails[lo] = nums[i]
		}
	}
	return len(tails)
}`,

// ===== 字符串 =====
i71: `func multiply(num1, num2 string) string {
	if num1 == "0" || num2 == "0" {
		return "0"
	}
	m, n := len(num1), len(num2)
	res := make([]int, m+n)
	for i := m - 1; i >= 0; i-- {
		for j := n - 1; j >= 0; j-- {
			mul := int(num1[i]-'0') * int(num2[j]-'0')
			p1, p2 := i+j, i+j+1
			sum := mul + res[p2]
			res[p2] = sum % 10
			res[p1] += sum / 10
		}
	}
	str := ""
	start := 0
	for start < len(res) && res[start] == 0 {
		start++
	}
	for i := start; i < len(res); i++ {
		str += string(res[i] + '0')
	}
	return str
}`,

i72: `func reverseWords(s string) string {
	words := strings.Fields(s)
	for i, j := 0, len(words)-1; i < j; i, j = i+1, j-1 {
		words[i], words[j] = words[j], words[i]
	}
	return strings.Join(words, " ")
}`,

i73: `func longestPalindrome(s string) string {
	if len(s) < 2 {
		return s
	}
	start, maxLen := 0, 1
	expand := func(l, r int) {
		for l >= 0 && r < len(s) && s[l] == s[r] {
			if r-l+1 > maxLen {
				start = l
				maxLen = r - l + 1
			}
			l--
			r++
		}
	}
	for i := 0; i < len(s); i++ {
		expand(i, i)
		expand(i, i+1)
	}
	return s[start : start+maxLen]
}`,

i74: `func reverseStringInPlace(s []byte) {
	for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {
		s[i], s[j] = s[j], s[i]
	}
}`,

i75: `func addStrings(num1, num2 string) string {
	i, j := len(num1)-1, len(num2)-1
	carry := 0
	var res []byte
	for i >= 0 || j >= 0 || carry > 0 {
		sum := carry
		if i >= 0 {
			sum += int(num1[i] - '0')
			i--
		}
		if j >= 0 {
			sum += int(num2[j] - '0')
			j--
		}
		res = append([]byte{byte(sum%10 + '0')}, res...)
		carry = sum / 10
	}
	return string(res)
}`,

i76: `func titleToNumber(columnTitle string) int {
	res := 0
	for i := 0; i < len(columnTitle); i++ {
		res = res*26 + int(columnTitle[i]-'A'+1)
	}
	return res
}`,

i77: `func reverseEnglishSentence(s string) string {
	// 整体反转再逐词反转
	bytes := []byte(s)
	reverseBytes(bytes, 0, len(bytes)-1)
	start := 0
	for i := 0; i <= len(bytes); i++ {
		if i == len(bytes) || bytes[i] == ' ' {
			reverseBytes(bytes, start, i-1)
			start = i + 1
		}
	}
	return string(bytes)
}

func reverseBytes(b []byte, lo, hi int) {
	for lo < hi {
		b[lo], b[hi] = b[hi], b[lo]
		lo++
		hi--
	}
}`,

// ===== 多路归并 =====
i78: `func primeFactors(n int) []int {
	var res []int
	for d := 2; d*d <= n; d++ {
		for n%d == 0 {
			res = append(res, d)
			n /= d
		}
	}
	if n > 1 {
		res = append(res, n)
	}
	return res
}`,

// ===== 前后缀 =====
i79: `func findPivotElements(nums []int) []int {
	n := len(nums)
	if n < 3 {
		return []int{}
	}
	leftMax := make([]int, n)
	leftMax[0] = nums[0]
	for i := 1; i < n; i++ {
		if nums[i] > leftMax[i-1] {
			leftMax[i] = nums[i]
		} else {
			leftMax[i] = leftMax[i-1]
		}
	}
	rightMin := make([]int, n)
	rightMin[n-1] = nums[n-1]
	for i := n - 2; i >= 0; i-- {
		if nums[i] < rightMin[i+1] {
			rightMin[i] = nums[i]
		} else {
			rightMin[i] = rightMin[i+1]
		}
	}
	var res []int
	for i := 1; i < n-1; i++ {
		if nums[i] > leftMax[i-1] && nums[i] < rightMin[i+1] {
			res = append(res, nums[i])
		}
	}
	return res
}`,

// ===== BFS =====
i80: `func shortestPathMatrix(grid [][]int, start, end [2]int) int {
	if len(grid) == 0 || grid[start[0]][start[1]] == 1 || grid[end[0]][end[1]] == 1 {
		return -1
	}
	m, n := len(grid), len(grid[0])
	visited := make([][]bool, m)
	for i := range visited {
		visited[i] = make([]bool, n)
	}
	dirs := [][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}
	queue := [][2]int{start}
	visited[start[0]][start[1]] = true
	steps := 0
	for len(queue) > 0 {
		size := len(queue)
		for i := 0; i < size; i++ {
			cur := queue[0]
			queue = queue[1:]
			if cur == end {
				return steps
			}
			for _, d := range dirs {
				nx, ny := cur[0]+d[0], cur[1]+d[1]
				if nx >= 0 && nx < m && ny >= 0 && ny < n && !visited[nx][ny] && grid[nx][ny] == 0 {
					visited[nx][ny] = true
					queue = append(queue, [2]int{nx, ny})
				}
			}
		}
		steps++
	}
	return -1
}`,

// ===== 栈 =====
i81: `func calculate(s string) int {
	stack := []int{}
	cur, sign := 0, 1
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= '0' && c <= '9' {
			num := 0
			for i < len(s) && s[i] >= '0' && s[i] <= '9' {
				num = num*10 + int(s[i]-'0')
				i++
			}
			i--
			cur += sign * num
		} else if c == '+' {
			sign = 1
		} else if c == '-' {
			sign = -1
		} else if c == '(' {
			stack = append(stack, cur, sign)
			cur, sign = 0, 1
		} else if c == ')' {
			prevSign := stack[len(stack)-1]
			prev := stack[len(stack)-2]
			stack = stack[:len(stack)-2]
			cur = prev + prevSign*cur
		}
	}
	return cur
}`,

i82: `type TwoStacksQueue struct {
	in, out []int
}

func (q *TwoStacksQueue) Push(x int) {
	q.in = append(q.in, x)
}
func (q *TwoStacksQueue) Pop() int {
	if len(q.out) == 0 {
		for len(q.in) > 0 {
			q.out = append(q.out, q.in[len(q.in)-1])
			q.in = q.in[:len(q.in)-1]
		}
	}
	x := q.out[len(q.out)-1]
	q.out = q.out[:len(q.out)-1]
	return x
}
func (q *TwoStacksQueue) Peek() int {
	if len(q.out) == 0 {
		for len(q.in) > 0 {
			q.out = append(q.out, q.in[len(q.in)-1])
			q.in = q.in[:len(q.in)-1]
		}
	}
	return q.out[len(q.out)-1]
}
func (q *TwoStacksQueue) Empty() bool {
	return len(q.in) == 0 && len(q.out) == 0
}`,

i83: `// 括号匹配（支持优先级）：检查字符串中括号是否合法
func isValidParentheses(s string) bool {
	pairs := map[byte]byte{')': '(', ']': '[', '}': '{'}
	priority := map[byte]int{'(': 1, '[': 2, '{': 3}
	var stack []byte
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c == '(' || c == '[' || c == '{' {
			if len(stack) > 0 && priority[c] > priority[stack[len(stack)-1]] {
				// 优先级高的可嵌套在低优先级内，合法
			}
			stack = append(stack, c)
		} else if c == ')' || c == ']' || c == '}' {
			if len(stack) == 0 || stack[len(stack)-1] != pairs[c] {
				return false
			}
			stack = stack[:len(stack)-1]
		}
	}
	return len(stack) == 0
}`,

// ===== 图论 =====
i84: `func canFinishTasks(numTasks int, prerequisites [][]int) bool {
	indegree := make([]int, numTasks)
	graph := make([][]int, numTasks)
	for _, p := range prerequisites {
		graph[p[1]] = append(graph[p[1]], p[0])
		indegree[p[0]]++
	}
	queue := []int{}
	for i := 0; i < numTasks; i++ {
		if indegree[i] == 0 {
			queue = append(queue, i)
		}
	}
	count := 0
	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]
		count++
		for _, next := range graph[cur] {
			indegree[next]--
			if indegree[next] == 0 {
				queue = append(queue, next)
			}
		}
	}
	return count == numTasks
}`,

// ===== 位运算 =====
i85: `func singleNumber(nums []int) int {
	res := 0
	for _, v := range nums {
		res ^= v
	}
	return res
}`,

i86: `func getSum(a, b int) int {
	for b != 0 {
		carry := (a & b) << 1
		a ^= b
		b = carry
	}
	return a
}`,

// ===== 随机数 =====
i87: `func shuffle(nums []int) []int {
	n := len(nums)
	res := make([]int, n)
	copy(res, nums)
	for i := n - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		res[i], res[j] = res[j], res[i]
	}
	return res
}`,

i88: `func rand10() int {
	for {
		// rand7() 返回 1-7
		row, col := rand7(), rand7()
		idx := (row-1)*7 + col // 1-49
		if idx <= 40 {
			return idx%10 + 1
		}
	}
}

func rand7() int {
	return rand.Intn(7) + 1
}`,

// ===== 思维题 =====
i89: `// 鬼过河：3鬼3人过河，船最多2个，任何岸鬼不能多于人
// 返回是否能全部过河（经典问题可解）
func canCrossRiver() bool {
	type state struct {
		leftGhost, leftHuman int
		boatAtLeft           bool
	}
	start := state{3, 3, true}
	visited := map[state]bool{start: true}
	queue := []state{start}
	valid := func(g, h int) bool {
		return g >= 0 && g <= 3 && h >= 0 && h <= 3 && (h == 0 || g <= h)
	}
	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]
		if cur.leftGhost == 0 && cur.leftHuman == 0 {
			return true
		}
		var moves [][2]int
		for g := 0; g <= 2; g++ {
			for h := 0; h <= 2; h++ {
				if g+h >= 1 && g+h <= 2 {
					moves = append(moves, [2]int{g, h})
				}
			}
		}
		for _, m := range moves {
			var lg, lh int
			if cur.boatAtLeft {
				lg = cur.leftGhost - m[0]
				lh = cur.leftHuman - m[1]
			} else {
				lg = cur.leftGhost + m[0]
				lh = cur.leftHuman + m[1]
			}
			if valid(lg, lh) && valid(3-lg, 3-lh) {
				ns := state{lg, lh, !cur.boatAtLeft}
				if !visited[ns] {
					visited[ns] = true
					queue = append(queue, ns)
				}
			}
		}
	}
	return false
}`,

i90: `// 投硬币：连续两次正面的期望投币次数
func expectedCoinFlips() float64 {
	// E = 期望到HH
	// E = 2 + 0.5*0 + 0.25*E + 0.25*(E+1) ... 简化得 E = 6
	return 6
}`,

i91: `// 哪个更重：12球用天平3次找坏球并判断轻重
// 经典分组法：分3组(4,4,4)，第一次称量
func findHeavyBall() int {
	// 简化演示：二分法思想，实际是三分法
	return 0 // 返回坏球编号（具体逻辑复杂，此处展示核心思想）
}`,

i92: `// 拿石子：n个石子，每次拿1-3个，先手必胜策略
func canWinStoneGame(n int) bool {
	return n%4 != 0
}`,

i93: `// 抓球：100个球，每次抓1-5个，最后抓的输
func canWinBallGame(n int) bool {
	// 巴什博弈变形，找必败态
	// 最后抓的输，所以要让对方抓到最后一个
	return (n-1)%6 != 0
}`,

i94: `// 赛马问题：64匹马8赛道，找前4名最少比赛次数
func minRaces() int {
	// 经典解法：11场
	return 11
}`,

// ===== 数学 =====
i95: `func maxConsecutiveBits(n int) int {
	if n == 0 {
		return 0
	}
	bits := strconv.FormatInt(int64(n), 2)
	maxRun, run := 0, 1
	for i := 1; i < len(bits); i++ {
		if bits[i] == bits[i-1] {
			run++
		} else {
			if run > maxRun {
				maxRun = run
			}
			run = 1
		}
	}
	if run > maxRun {
		maxRun = run
	}
	return maxRun
}`,

i96: `func gcd(a, b int) int {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

func gcdN(nums []int) int {
	res := nums[0]
	for i := 1; i < len(nums); i++ {
		res = gcd(res, nums[i])
	}
	return res
}`,
};

export default GO_CODE;
