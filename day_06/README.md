## Deno / TypeScript

```
deno task solve
```

## Rust

```
cargo run
```

## Results

I implemented roughly the same brute force inefficient algorithm in TypeScript/Deno and in Rust.

```
% time deno task solve  
Task solve deno run --allow-read solve.ts
Part 1: 4696
Part 2: 1443
deno task solve  4.34s user 0.41s system 106% cpu 4.471 total
```

```
% time cargo run --release
    Finished `release` profile [optimized] target(s) in 0.02s
     Running `target/release/solve`
Part 1: 4696
Part 2: 1443
cargo run --release  0.31s user 0.04s system 62% cpu 0.546 total
```

**The single threaded Rust version is 14x times faster.**