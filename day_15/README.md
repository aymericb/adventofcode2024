## Deno / TypeScript

```sh
deno task solve
```

Spent an hour debugging an edge case. I was not able to discover the edge case until I had some interactive mode robot where I could move with the keyboard arrows (commented out).


```
##############
#            #
#        #   #
#      [][]  #
#       []   #
#       ^    #
##############
```

The issue I had was that going up here should do nothing. 

However, my recursive algorithm modified the state of the world. I fixed this by taking a copy of the whole state for each up/down recursion branches. There is likely to be a more efficient way to do it…


```
BUG
##############
#            #
#      []#   # <-- This recursively 
#        []  #      moved up BUG!
#       []   #
#       ^    #
##############
```
