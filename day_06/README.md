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

## Optimization (Single Threaded)

Turns out there's no point putting an obstacle on a location which was never visited by the guard!

This simple optimization which I did not think about massively cut down on time ()

```
% time deno task solve    
Task solve deno run --allow-read solve.ts
Part 1: 4696
Part 2: 1443
deno task solve  1.08s user 0.11s system 109% cpu 1.093 total
```

```
% time cargo run --release
    Finished `release` profile [optimized] target(s) in 0.02s
     Running `target/release/solve`
Part 1: 4696
Part 2: 1443
cargo run --release  0.11s user 0.03s system 40% cpu 0.343 total
```

## Failed Optimization (Rayon)

Using a very simple rayon `into_par_iter` we get something that takes longer!

```
% time cargo run --release
    Finished `release` profile [optimized] target(s) in 0.03s
     Running `target/release/solve`
Part 1: 4696
Part 2: 1443
cargo run --release  0.49s user 0.05s system 151% cpu 0.355 total
```

I do not really know Rust let alone Rayon. Even for writing that functional parallel map reduce thing I struggled a lot and asked Claude for help.

I suspect I made some fundamental mistake that prevents the code from being effectively parallelized.

There are lots of copying of the grid, which could likely be optimized away, but these occur in the single threaded version too… 
