## Deno / TypeScript

```
deno task solve
```

The base example with 25 iterations is extremely easy.

However for part 2 you need 75 iterations. The number of elements in the array roughly doubles with every iteration. So you would need `2**75`. You would never get nowhere near enough RAM to resolve this issue. 

The key insight is that you **do not need** to hold the whole array in memory to compute the tally. I suspect the most efficient implementation would probably hold an array up to a certain size, and then use recursion. 

