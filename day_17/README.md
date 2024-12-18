## Deno / TypeScript

```sh
deno task solve
```

~~No idea how to solve part 2. Obviously brute force will never work.~~

Ok. Second fail of the year.

So there's a bug/weird feature in JavaScript  `-10%8` is equal to `-2` and not `6`, because it's the remainder. So need to do `&7` for the modulo operations.

I found [this code](https://aoc.csokavar.hu/2024/17/) very legible. I had noticed there was some pattern with the last digits, but did not quite realize what it was.


