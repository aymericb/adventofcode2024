## Deno / TypeScript

```sh
deno task solve
```

The base example with 25 iterations is extremely easy.

However for part 2 you need 75 iterations. The number of elements in the array roughly doubles with every iteration. So you would need `2**75` elements. There is nowhere near enough RAM to resolve this issue with brute force.

The key insight is that you **do not need** to hold the whole array in memory to compute the tally. You can compute the number of elements using recursion. 

- if depth is `0` then return `1` because that's the end of recursion
- if the number is `1` then return the number of digits of `0` at `depth - 1`
- for any other number, apply the `blink()` algorithm recursively at `depth - 1`
    - for even digits, `blink(left, depth - 1) + blink(right, depth - 1)` 
    - otherwise `blink(value*2024, depth - 1)`

It is still orders of magnitude too slow without memoization. I botched the implementation of the memoization, which made me optimize the `blink()` method to death in rust. A bit of a lost cause but I managed to get to `50` levels of recursions with acceptable times. 

Once I figured out the errors of my ways, I cleaned up the mess and back ported to TypeScript.

The TypeScript implementation is very legible. The only "trick" is that we have a `Memo` class rather than directly using a `Map` since we push against the limits of the number of elements available.

```
Time taken for Part 1: 1.35 milliseconds
Time taken for Part 2: 33.04 milliseconds
```

## Rust

I did a lot of stupid optimizations which saves a few `ms` at the expensive of legibility. 

- Pass the number of digits around and avoid calling `log10`. 
- Precomputed powers of 10.  
- Rayon with `par_iter` with a thread pool of `10` (number of cores on my machine)

I left the optimizations in as they save marginal amounts of time

```
Time taken for Part 1: 379µs
Time taken for Part 2: 14.630708ms
```
