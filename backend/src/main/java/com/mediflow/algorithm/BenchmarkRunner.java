package com.mediflow.algorithm;

import java.util.Arrays;
import java.util.Random;

/** Reproducible local benchmark: Quickselect vs full sorting at three increasing sizes. */
public final class BenchmarkRunner {
    public static void main(String[] args) {
        int[] sizes = {1_000, 10_000, 100_000};
        RandomizedQuickselect qs = new RandomizedQuickselect();
        for (int n : sizes) {
            int[] data = new Random(2026L + n).ints(n, 1, 1_000_001).toArray();
            long t1 = System.nanoTime();
            var result = qs.percentile(data, 90, 12345L);
            long quickNanos = System.nanoTime() - t1;
            int[] copy = data.clone();
            t1 = System.nanoTime(); Arrays.sort(copy); long sortNanos = System.nanoTime() - t1;
            int baseline = copy[(int)Math.ceil(.90 * n) - 1];
            System.out.printf("n=%d, percentile=%d, quickselect=%d ns, sort=%d ns, baseline=%d, match=%s%n",
                    n, result.value(), quickNanos, sortNanos, baseline, result.value()==baseline);
        }
    }
}
