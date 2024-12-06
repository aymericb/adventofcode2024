## Deno / TypeScript

```
deno task solve
```

## Issue

The main issue in part 2 which is not apparent in the sample, is that **more than one rule** may be broken by a given input.

I initially thought there would similar to the sample, where only one rule is breached… Took me some time to figure out that it was not the case.

My way to fix it is to basically swap every two numbers that are in breach a rule until there are no breaches left.

I suspect that's very inefficient. Complexity must be O^2, or very likely even worse.

It feels like a sort problem. And my implementation feels like a bubble sort implementation. This is what is in `solve.ts`

So, ideally, one would like to deploy the quick sort algorithm from JavaScript and use `.sort()` but the problem is that it's unclear how to order two values `a` and `b`. 

