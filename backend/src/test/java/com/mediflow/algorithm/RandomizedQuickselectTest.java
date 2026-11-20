package com.mediflow.algorithm;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class RandomizedQuickselectTest {
    private final RandomizedQuickselect algorithm = new RandomizedQuickselect();
    @Test void medianOfOddLengthArray() { assertEquals(5,algorithm.percentile(new int[]{9,1,5,3,7},50,42).value()); }
    @Test void hundredthPercentileReturnsMaximum() { assertEquals(9,algorithm.percentile(new int[]{2,9,1},100,42).value()); }
    @Test void firstPercentileUsesNearestRankMinimum() { assertEquals(1,algorithm.percentile(new int[]{8,1,4},1,42).value()); }
    @Test void duplicatesAreHandled() { assertEquals(4,algorithm.percentile(new int[]{4,4,4,2},75,9).value()); }
    @Test void emptyInputRejected() { assertThrows(IllegalArgumentException.class,()->algorithm.percentile(new int[]{},50,1)); }
    @Test void invalidPercentileRejected() { assertThrows(IllegalArgumentException.class,()->algorithm.percentile(new int[]{1,2},0,1)); }
    @Test void seededRunIsReproducible() { assertEquals(algorithm.percentile(new int[]{8,2,6,4,1},60,123),algorithm.percentile(new int[]{8,2,6,4,1},60,123)); }
}
