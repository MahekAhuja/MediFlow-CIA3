package com.mediflow.algorithm;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
class EdmondsKarpTest {
    private final EdmondsKarp algorithm = new EdmondsKarp();
    @Test void classicNetworkMaximumFlowIs23() { var r=algorithm.compute(List.of("s","a","b","c","d","t"), List.of(new EdmondsKarp.InputEdge("s","a",16),new EdmondsKarp.InputEdge("s","c",13),new EdmondsKarp.InputEdge("a","b",12),new EdmondsKarp.InputEdge("b","c",9),new EdmondsKarp.InputEdge("c","a",4),new EdmondsKarp.InputEdge("c","d",14),new EdmondsKarp.InputEdge("d","b",7),new EdmondsKarp.InputEdge("b","t",20),new EdmondsKarp.InputEdge("d","t",4)), "s","t"); assertEquals(23,r.maxFlow()); }
    @Test void noPathReturnsZero() { assertEquals(0,algorithm.compute(List.of("s","t"),List.of(),"s","t").maxFlow()); }
    @Test void singleEdgeBoundary() { assertEquals(5,algorithm.compute(List.of("s","t"),List.of(new EdmondsKarp.InputEdge("s","t",5)),"s","t").maxFlow()); }
    @Test void zeroCapacityReturnsZero() { assertEquals(0,algorithm.compute(List.of("s","t"),List.of(new EdmondsKarp.InputEdge("s","t",0)),"s","t").maxFlow()); }
    @Test void invalidNegativeCapacityRejected() { assertThrows(IllegalArgumentException.class,()->algorithm.compute(List.of("s","t"),List.of(new EdmondsKarp.InputEdge("s","t",-1)),"s","t")); }
    @Test void unknownEndpointRejected() { assertThrows(IllegalArgumentException.class,()->algorithm.compute(List.of("s","t"),List.of(new EdmondsKarp.InputEdge("s","x",2)),"s","t")); }
}
