package com.mediflow.algorithm;

import java.util.Arrays;
import java.util.Random;

/** Own randomized selection implementation. Percentile uses nearest-rank: ceil(p*n)-1. */
public final class RandomizedQuickselect {
    public record Selection(int value, int zeroBasedIndex, int rank, double percentile) {}

    public Selection percentile(int[] input, double percentile, long seed) {
        if (input == null || input.length == 0) throw new IllegalArgumentException("Demand dataset must not be empty");
        if (!(percentile > 0.0 && percentile <= 100.0)) throw new IllegalArgumentException("Percentile must be > 0 and <= 100");
        int[] values = Arrays.copyOf(input, input.length);
        int rank = (int)Math.ceil((percentile / 100.0) * values.length); // 1-based nearest rank
        int index = rank - 1;
        int value = select(values, index, new Random(seed));
        return new Selection(value, index, rank, percentile);
    }

    private int select(int[] a, int target, Random random) {
        int left=0, right=a.length-1;
        while (left <= right) {
            int pivotIndex = left + random.nextInt(right-left+1);
            int pivot = a[pivotIndex];
            swap(a,pivotIndex,right);
            int store=left;
            for (int i=left;i<right;i++) if (a[i] < pivot) { swap(a,store,i); store++; }
            swap(a,store,right);
            if (store==target) return a[store];
            if (target<store) right=store-1; else left=store+1;
        }
        throw new IllegalStateException("Selection failed unexpectedly");
    }
    private void swap(int[] a,int i,int j) { int t=a[i]; a[i]=a[j]; a[j]=t; }
}
