// const text = await Deno.readTextFile("input.txt");
const text = await Deno.readTextFile("sample.txt");

type Direction = "N" | "E" | "S" | "W";

type Node = {
    visited: boolean;
    obstacle: boolean;
    direction: Direction | null;  // No point having visited as well, but too lazy to refactor
}

type Guard = {
    row: number; 
    col: number;
    direction: "N" | "E" | "S" | "W";
}

function parseData(text: string): [Node[][], Guard] {
    let direction: "N" | "E" | "S" | "W" | null = null;
    const result = text.split("\n").map(line => line.split("").map(c => {
        if (c === "^") {
            direction = "N";
        } else if (c === ">") {
            direction = "E";
        } else if (c === "v") {
            direction = "S";
        } else if (c === "<") {
            direction = "W";
        }
        return { 
            visited: c !== "." && c !== "#",
            obstacle: c === "#" 
        };
    }));

    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].length; j++) {
            if (result[i][j].visited) {
                const guard = { row: i, col: j, direction: direction! };
                return [result, guard];
            }
        }
    }

    throw new Error("No guard found");
}

function cloneGrid(grid: Node[][]): Node[][] {
    return grid.map(row => row.map(n => ({ ...n })));
}

const [startGrid, startGuard] = parseData(text);

enum ExitResult {
    Progress,
    Exit,
    InfiniteLoop
}

function move(guard: Guard, grid: Node[][]): ExitResult {
    if (guard.direction === "N") {
        guard.row--;
    } else if (guard.direction === "E") {
        guard.col++;
    } else if (guard.direction === "S") {
        guard.row++;
    } else if (guard.direction === "W") {
        guard.col--;
    }
    const [row, col, direction] = [guard.row, guard.col, guard.direction];
    const node = grid[row]?.[col];
    // console.log(guard, node);
    if (node === undefined) {
        return ExitResult.Exit;
    }
    if (node.visited && node.direction === direction) {
        return ExitResult.InfiniteLoop;
    }

    if (node.obstacle) {
        let newDirection = guard.direction;
        if (guard.direction === "N") {
            guard.row++;
            newDirection = "E";
        } else if (guard.direction === "E") {
            guard.col--;
            newDirection = "S";
        } else if (guard.direction === "S") {
            guard.row--;
            newDirection = "W";
        } else if (guard.direction === "W") {
            guard.col++;
            newDirection = "N";
        }
        guard.direction = newDirection;
        return move(guard, grid);
    }
    grid[row][col].visited = true;
    grid[row][col].direction = direction;
    return ExitResult.Progress;
}

const part1Grid = cloneGrid(startGrid);
const part1Guard = { ...startGuard };

while (move(part1Guard, part1Grid) === ExitResult.Progress) { 
    // do nothing
}

function printGrid(grid: Node[][]) {
    grid.forEach(row => {
        const line = row.map(n => {
            if (n.visited) {
                if (n.obstacle) {
                    return "O";
                }
                return "X"; 
            } else if (n.obstacle) {
                return "#";
            }
            return ".";
        }).join("");
        console.log(line);
    });
}

printGrid(part1Grid);
const sum = part1Grid.reduce((acc, row) => {
    return acc + row.filter(n => n.visited).length;
}, 0);

console.log("Part 1:", sum);

// Part 2 
// Let's brute force it and not think too much about complexity 😱
// (and it is indeed quite slow 🐌 🤷 )
let count = 0;
for (let row = 0; row < startGrid.length; row++) {
    for (let col = 0; col < startGrid[row].length; col++) {
        if (col === startGuard.col && row === startGuard.row) {
            continue;
        }
        let status = ExitResult.Progress;
        const guard = { ...startGuard };
        const grid = startGrid.map(r => r.map(n => ({ ...n })));
        grid[row][col].obstacle = true;
        while (status === ExitResult.Progress) {
            status = move(guard, grid);
        }
        if (status === ExitResult.InfiniteLoop) {
            count++;
        }
    }
}
console.log("Part 2:", count);
