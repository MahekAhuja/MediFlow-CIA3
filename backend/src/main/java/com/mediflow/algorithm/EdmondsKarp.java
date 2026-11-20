package com.mediflow.algorithm;

import java.util.*;

/** Own implementation of Edmonds-Karp maximum flow using BFS augmenting paths. */
public final class EdmondsKarp {
    public record InputEdge(String from, String to, long capacity) {}
    public record EdgeFlow(String from, String to, long capacity, long flow) {}
    public record Result(long maxFlow, List<List<String>> augmentingPaths, List<EdgeFlow> edgeFlows) {}

    private static final class ResidualEdge {
        final int to, reverseIndex;
        long residual;
        final long originalCapacity;
        final int inputEdgeIndex;
        ResidualEdge(int to, int reverseIndex, long residual, long originalCapacity, int inputEdgeIndex) {
            this.to = to; this.reverseIndex = reverseIndex; this.residual = residual;
            this.originalCapacity = originalCapacity; this.inputEdgeIndex = inputEdgeIndex;
        }
    }
    private record Parent(int node, int edgeIndex) {}

    public Result compute(List<String> nodes, List<InputEdge> edges, String source, String sink) {
        if (nodes == null || nodes.isEmpty()) throw new IllegalArgumentException("At least one node is required");
        if (edges == null) throw new IllegalArgumentException("Edges cannot be null");
        LinkedHashMap<String,Integer> ids = new LinkedHashMap<>();
        for (String node : nodes) {
            if (node == null || node.isBlank()) throw new IllegalArgumentException("Node names cannot be blank");
            if (ids.putIfAbsent(node, ids.size()) != null) throw new IllegalArgumentException("Duplicate node: " + node);
        }
        if (!ids.containsKey(source) || !ids.containsKey(sink)) throw new IllegalArgumentException("Source and sink must exist in nodes");
        if (source.equals(sink)) throw new IllegalArgumentException("Source and sink must be different");
        int n = ids.size();
        List<List<ResidualEdge>> graph = new ArrayList<>();
        for (int i=0;i<n;i++) graph.add(new ArrayList<>());
        List<ResidualEdge> originalRefs = new ArrayList<>();
        for (int i=0;i<edges.size();i++) {
            InputEdge e = edges.get(i);
            if (e == null || !ids.containsKey(e.from()) || !ids.containsKey(e.to())) throw new IllegalArgumentException("Every edge endpoint must exist");
            if (e.capacity() < 0) throw new IllegalArgumentException("Capacity cannot be negative");
            if (e.from().equals(e.to())) throw new IllegalArgumentException("Self-loop edges are not supported");
            int u=ids.get(e.from()), v=ids.get(e.to());
            ResidualEdge forward = new ResidualEdge(v, graph.get(v).size(), e.capacity(), e.capacity(), i);
            ResidualEdge reverse = new ResidualEdge(u, graph.get(u).size(), 0, 0, -1);
            graph.get(u).add(forward); graph.get(v).add(reverse); originalRefs.add(forward);
        }
        int s=ids.get(source), t=ids.get(sink);
        long total=0;
        List<List<String>> paths = new ArrayList<>();
        while (true) {
            Parent[] parent = new Parent[n];
            boolean[] seen = new boolean[n];
            ArrayDeque<Integer> q = new ArrayDeque<>(); q.add(s); seen[s]=true;
            while (!q.isEmpty() && !seen[t]) {
                int u=q.remove();
                for (int ei=0;ei<graph.get(u).size();ei++) {
                    ResidualEdge e=graph.get(u).get(ei);
                    if (e.residual>0 && !seen[e.to]) { seen[e.to]=true; parent[e.to]=new Parent(u,ei); q.add(e.to); }
                }
            }
            if (!seen[t]) break;
            long bottleneck=Long.MAX_VALUE;
            for (int v=t;v!=s;) { Parent p=parent[v]; bottleneck=Math.min(bottleneck, graph.get(p.node()).get(p.edgeIndex()).residual); v=p.node(); }
            List<String> path = new ArrayList<>();
            for (int v=t;;) { path.add(nodeAt(ids,v)); if(v==s) break; Parent p=parent[v]; ResidualEdge e=graph.get(p.node()).get(p.edgeIndex()); e.residual-=bottleneck; graph.get(v).get(e.reverseIndex).residual+=bottleneck; v=p.node(); }
            Collections.reverse(path); paths.add(path); total=Math.addExact(total,bottleneck);
        }
        List<EdgeFlow> flows = new ArrayList<>();
        for (int i=0;i<edges.size();i++) { InputEdge in=edges.get(i); ResidualEdge ref=originalRefs.get(i); flows.add(new EdgeFlow(in.from(),in.to(),in.capacity(),ref.originalCapacity-ref.residual)); }
        return new Result(total, List.copyOf(paths), List.copyOf(flows));
    }
    private String nodeAt(Map<String,Integer> ids, int id) { for (var e:ids.entrySet()) if(e.getValue()==id) return e.getKey(); throw new IllegalStateException(); }
}
