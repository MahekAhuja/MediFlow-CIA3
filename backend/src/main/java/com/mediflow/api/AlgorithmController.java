package com.mediflow.api;

import com.mediflow.algorithm.EdmondsKarp;
import com.mediflow.algorithm.RandomizedQuickselect;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/algorithms")
@CrossOrigin(origins = "*") // Restrict to the deployed frontend origin before production use.
public class AlgorithmController {
    private final EdmondsKarp maxFlow = new EdmondsKarp();
    private final RandomizedQuickselect quickselect = new RandomizedQuickselect();

    public record FlowEdge(@NotBlank String from, @NotBlank String to, @PositiveOrZero long capacity) {}
    public record FlowRequest(@NotEmpty List<@NotBlank String> nodes, @NotEmpty List<@Valid FlowEdge> edges,
                              @NotBlank String source, @NotBlank String sink) {}
    public record PercentileRequest(@NotEmpty List<Integer> demands, @DecimalMin("0.0001") @DecimalMax("100.0") double percentile,
                                    Long seed) {}
    public record PercentileResponse(int value, int rank, int zeroBasedIndex, double percentile,
                                     int sortedBaselineValue, long quickselectNanos, long sortNanos) {}

    @PostMapping("/max-flow")
    public EdmondsKarp.Result maxFlow(@Valid @RequestBody FlowRequest request) {
        try {
            List<EdmondsKarp.InputEdge> edges = request.edges().stream()
                    .map(e -> new EdmondsKarp.InputEdge(e.from(), e.to(), e.capacity())).toList();
            return maxFlow.compute(request.nodes(), edges, request.source(), request.sink());
        } catch (IllegalArgumentException | ArithmeticException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }

    @PostMapping("/demand-percentile")
    public PercentileResponse percentile(@Valid @RequestBody PercentileRequest request) {
        try {
            int[] values = request.demands().stream().mapToInt(Integer::intValue).toArray();
            long seed = request.seed() == null ? System.nanoTime() : request.seed();
            long start = System.nanoTime();
            RandomizedQuickselect.Selection selected = quickselect.percentile(values, request.percentile(), seed);
            long quickNanos = System.nanoTime() - start;
            int[] sorted = values.clone();
            start = System.nanoTime();
            java.util.Arrays.sort(sorted);
            long sortNanos = System.nanoTime() - start;
            return new PercentileResponse(selected.value(), selected.rank(), selected.zeroBasedIndex(), selected.percentile(),
                    sorted[selected.zeroBasedIndex()], quickNanos, sortNanos);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
    }
}
