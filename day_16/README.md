## Deno / TypeScript

```sh
deno task solve
```

Takes about 4.5 second to solve both part.

My algorithm works on the maze grid/array directly instead of converting it to a graph. I have seen a lot of people on [Reddit use the Dijkstra algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm) which I do not know very well, but it seems to run faster than my algorithm.

The idea is that you do a Breadth-First Search. This obviously would fail on the large input as the complexity is exponential. 

However, I keep a Map which is a cache of position to score. The idea is similar to Djestrak is that for each (x,y) position in the the maze you assign a score. If your current score is _higher_ there is no point pursuing. This simple optimization makes the algorithm returns in a few seconds, despite ample use of the spread operator and inefficient things like that.

If you tweak the algorithm to return the list of all the best solutions, instead of just "the best", the initial algorithm _almost works_. The edge case is that one of the path may necessitate a rotation and the other not. So to avoid this issue, I add up `1000` to the threshold, so the algorithm looks ahead by _one potential_ rotation. This is probably very inefficient but works.

```
Two paths to end up in the same place. 
             ┌────┐    ┌────┐
             │2004│    │2004│
             └────┘    └────┘
                    ▲        
                    │        
                    │        
              ┌────┐│  ┌────┐
              │ 1  ││  │ 1  │
              └────┘│  └────┘
                    │        
                    ▲        
              ┌────┐│        
              │ 1  ││        
              └────┘│  ┌────┐
        ┌────┐┌────┐│  │ 1  │
┌────┐  │ 1  ││1000││  └────┘
│1000│  └────┘└────┘│        
└────┘▲ ────────────▶▲       
      │              │       
┌────┐│              │       
│ 1  ││              │ ┌────┐
└────┘│              │ │ 1  │
      │              │ └────┘
      │ ────────────▶│       
      ┌────┐  ┌────┐  ┌────┐ 
      │1000│  │ 1  │  │1000│ 
      └────┘  └────┘  └────┘ 
```      
