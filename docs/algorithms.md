# ChangeRipple Graph & Optimization Algorithms

## 1. Graph Conventions & Reverse Impact Traversal

### 1.1 Dependency Direction Convention
ChangeRipple adheres strictly to standard dependency modeling:
$$\text{Component } A \to \text{Component } B \iff A \text{ depends on } B$$

When component $B$ undergoes a logic, interface, or schema alteration, all components that depend on $B$ are potentially affected. Therefore, change impact flows in the reverse direction of dependencies:
$$\text{Impact Propagation} : B \to_{\text{rev}} A \iff A \text{ is in incoming}(B)$$

### 1.2 Algorithmic Pseudocode (BFS Reverse Propagation)

```text
Algorithm: AnalyzeImpact
Input: DirectedGraph G, ChangedNodeID root, ChangeCategory cat, ChangeSeverity sev
Output: ImpactAnalysisResult

1. Initialize depths := HashMap(), predecessor := HashMap()
2. Initialize queue := ArrayDeque()
3. depths[root] := 0
4. queue.push(root)

5. While queue is not empty:
6.    current := queue.pop()
7.    currentDepth := depths[current]
8.    For each edge in G.getIncomingEdges(current):
9.        dependent := edge.sourceId
10.       If dependent not in depths:
11.           depths[dependent] := currentDepth + 1
12.           predecessor[dependent] := current
13.           queue.push(dependent)

14. For each (component, depth) in depths where component != root:
15.    path := ReconstructPath(component, root, predecessor)
16.    blastRadius := CalculateBlastRadius(component, G)
17.    risk := CalculateHeuristicRisk(component, depth, blastRadius, cat, sev)
18.    Collect ImpactedNodeInfo

19. Sort affected components deterministically:
    ORDER BY riskScore DESC, depth ASC, componentName ASC
20. Return ImpactAnalysisResult
```

### 1.3 Complexity Analysis
- **Graph Construction**: $O(V + E)$ where $V$ = components, $E$ = dependencies.
- **BFS Traversal**: Each reachable node and edge is examined at most once: $O(V + E)$.
- **Path Reconstruction**: Backtracking parent pointers takes $O(\text{depth}) \le O(V)$.
- **Total Time Complexity**: $O(V + E)$.
- **Space Complexity**: $O(V)$ auxiliary memory for queue and visited tables.

---

## 2. Greedy Set-Cover Regression Test Selection

### 2.1 Problem Formulation
Let $U = \{c_1, c_2, \dots, c_k\}$ be the set of affected executable runtime components ($\text{type} \in \{\text{CLASS}, \text{API}, \text{MODULE}\}$).
Let $\mathcal{T} = \{t_1, t_2, \dots, t_m\}$ be the set of candidate automated test suites, where each test $t_j$ covers a known subset $\text{Cov}(t_j) \subseteq U$.

The goal is to select an optimized subset $\mathcal{S} \subseteq \mathcal{T}$ such that $|\mathcal{S}|$ is minimized while maximizing covered affected components $|\bigcup_{t \in \mathcal{S}} \text{Cov}(t) \cap U|$.

### 2.2 Greedy Approximation Algorithm
```text
Algorithm: SelectTestsGreedy
Input: AffectedComponents U, CandidateTests T, ComponentLookup
Output: SelectedTestResult

1. uncovered := Copy of U
2. selected := List()
3. remaining := Copy of T

4. While uncovered is not empty and remaining is not empty:
5.    bestTest := null, maxCover := 0
6.    For test in remaining:
7.        newCover := |Cov(test) ∩ uncovered|
8.        If newCover > maxCover:
9.            maxCover := newCover
10.           bestTest := test
11.       Else If newCover == maxCover and newCover > 0:
12.           // Deterministic Tie Breaker
13.           bestTest := TieBreak(test, bestTest, ComponentLookup)

14.   If bestTest is null or maxCover == 0:
15.       Break (no remaining test adds coverage)

16.   remaining.remove(bestTest)
17.   newlyCovered := Cov(bestTest) ∩ uncovered
18.   uncovered.removeAll(newlyCovered)
19.   selected.add(bestTest)

20. Return selected, uncovered, reductionPercent, coveragePercent
```

### 2.3 Deterministic Tie-Breaking
When two candidate tests provide identical incremental coverage, ties are broken deterministically:
1. **Criticality of the Test**: `CRITICAL` > `HIGH` > `MEDIUM` > `LOW`.
2. **Lexical Name Comparison**: alphabetical sort of component names.
3. **Component UUID**: unique deterministic tie-breaker.
