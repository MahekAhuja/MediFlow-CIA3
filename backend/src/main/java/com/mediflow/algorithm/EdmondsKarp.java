
package com.mediflow.algorithm;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;

 /**
  * Edmonds-Karp maximum flow algorithm using BFS.
  * Also calculates the minimum cut using the residual graph.
  */
public final class EdmondsKarp {

    public record InputEdge(String from, String to, long capacity) {}

    public record EdgeFlow(
            String from, String to, long capacity, long flow) {}

    public record CutEdge(
            String from, String to, long capacity) {}

    public record Result(
            long maxFlow,
            List<List<String>> augmentingPaths,
            List<EdgeFlow> edgeFlows,
            List<String> sourceSideNodes,
            List<CutEdge> minCutEdges,
            long minCutCapacity) {}

    private static final class ResidualEdge {
        final int to;
        final int reverseIndex;
        long residual;
        final long originalCapacity;

        ResidualEdge(int to, int reverseIndex,
                     long residual, long originalCapacity) {
            this.to = to;
            this.reverseIndex = reverseIndex;
            this.residual = residual;
            this.originalCapacity = originalCapacity;
        }
    }

    private record Parent(int node, int edgeIndex) {}

    public Result compute(
            List<String> nodes,
            List<InputEdge> edges,
            String source,
            String sink) {

        if (nodes == null || nodes.isEmpty())
            throw new IllegalArgumentException("At least one node is required");

        if (edges == null)
            throw new IllegalArgumentException("Edges cannot be null");

        LinkedHashMap<String, Integer> ids = new LinkedHashMap<>();

        for (String node : nodes) {
            if (node == null || node.isBlank())
                throw new IllegalArgumentException("Node names cannot be blank");

            if (ids.putIfAbsent(node, ids.size()) != null)
                throw new IllegalArgumentException("Duplicate node: " + node);
        }

        if (!ids.containsKey(source) || !ids.containsKey(sink))
            throw new IllegalArgumentException("Source and sink must exist");

        if (source.equals(sink))
            throw new IllegalArgumentException("Source and sink must differ");

        int n = ids.size();

        List<List<ResidualEdge>> graph = new ArrayList<>();

        for (int i = 0; i < n; i++)
            graph.add(new ArrayList<>());

        List<ResidualEdge> originalRefs = new ArrayList<>();

        for (InputEdge edge : edges) {

            if (edge == null ||
                    !ids.containsKey(edge.from()) ||
                    !ids.containsKey(edge.to()))
                throw new IllegalArgumentException("Invalid edge endpoint");

            if (edge.capacity() < 0)
                throw new IllegalArgumentException("Capacity cannot be negative");

            if (edge.from().equals(edge.to()))
                throw new IllegalArgumentException("Self-loops are not supported");

            int u = ids.get(edge.from());
            int v = ids.get(edge.to());

            ResidualEdge forward = new ResidualEdge(
                    v, graph.get(v).size(), edge.capacity(), edge.capacity());

            ResidualEdge reverse = new ResidualEdge(
                    u, graph.get(u).size(), 0, 0);

            graph.get(u).add(forward);
            graph.get(v).add(reverse);

            originalRefs.add(forward);
        }

        int s = ids.get(source);
        int t = ids.get(sink);

        long totalFlow = 0;

        List<List<String>> paths = new ArrayList<>();

        // STEP 1: Find augmenting paths using BFS
        while (true) {

            Parent[] parent = new Parent[n];
            boolean[] seen = new boolean[n];

            Queue<Integer> queue = new ArrayDeque<>();

            queue.add(s);
            seen[s] = true;

            while (!queue.isEmpty() && !seen[t]) {

                int u = queue.remove();

                for (int i = 0; i < graph.get(u).size(); i++) {

                    ResidualEdge edge = graph.get(u).get(i);

                    if (edge.residual > 0 && !seen[edge.to]) {

                        seen[edge.to] = true;
                        parent[edge.to] = new Parent(u, i);
                        queue.add(edge.to);
                    }
                }
            }

            // No more augmenting paths
            if (!seen[t])
                break;

            // STEP 2: Find bottleneck capacity
            long bottleneck = Long.MAX_VALUE;

            for (int v = t; v != s;) {

                Parent p = parent[v];

                ResidualEdge edge =
                        graph.get(p.node()).get(p.edgeIndex());

                bottleneck = Math.min(bottleneck, edge.residual);

                v = p.node();
            }

            // STEP 3: Update residual capacities
            List<String> path = new ArrayList<>();

            for (int v = t;;) {

                path.add(nodeAt(ids, v));

                if (v == s)
                    break;

                Parent p = parent[v];

                ResidualEdge edge =
                        graph.get(p.node()).get(p.edgeIndex());

                edge.residual -= bottleneck;

                graph.get(v).get(edge.reverseIndex).residual =
                        Math.addExact(
                                graph.get(v).get(edge.reverseIndex).residual,
                                bottleneck);

                v = p.node();
            }

            Collections.reverse(path);
            paths.add(path);

            totalFlow = Math.addExact(totalFlow, bottleneck);
        }

        // STEP 4: Find nodes reachable from source in residual graph
        boolean[] reachable = new boolean[n];

        Queue<Integer> queue = new ArrayDeque<>();

        queue.add(s);
        reachable[s] = true;

        while (!queue.isEmpty()) {

            int u = queue.remove();

            for (ResidualEdge edge : graph.get(u)) {

                if (edge.residual > 0 && !reachable[edge.to]) {

                    reachable[edge.to] = true;
                    queue.add(edge.to);
                }
            }
        }

        // STEP 5: Identify minimum cut edges
        List<String> sourceSide = new ArrayList<>();
        List<CutEdge> cutEdges = new ArrayList<>();

        long cutCapacity = 0;

        for (var entry : ids.entrySet()) {

            if (reachable[entry.getValue()])
                sourceSide.add(entry.getKey());
        }

        for (InputEdge edge : edges) {

            int u = ids.get(edge.from());
            int v = ids.get(edge.to());

            if (reachable[u] && !reachable[v]) {

                cutEdges.add(new CutEdge(
                        edge.from(),
                        edge.to(),
                        edge.capacity()));

                cutCapacity = Math.addExact(
                        cutCapacity, edge.capacity());
            }
        }

        // STEP 6: Calculate individual edge flows
        List<EdgeFlow> flows = new ArrayList<>();

        for (int i = 0; i < edges.size(); i++) {

            InputEdge input = edges.get(i);

            ResidualEdge reference = originalRefs.get(i);

            long flow =
                    reference.originalCapacity - reference.residual;

            flows.add(new EdgeFlow(
                    input.from(),
                    input.to(),
                    input.capacity(),
                    flow));
        }

        return new Result(
                totalFlow,
                List.copyOf(paths),
                List.copyOf(flows),
                List.copyOf(sourceSide),
                List.copyOf(cutEdges),
                cutCapacity);
    }

    private String nodeAt(Map<String, Integer> ids, int id) {

        for (var entry : ids.entrySet()) {

            if (entry.getValue() == id)
                return entry.getKey();
        }

        throw new IllegalStateException("Unknown node");
    }
}
