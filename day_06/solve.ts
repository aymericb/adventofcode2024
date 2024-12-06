const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");

type Node = {
    visited: boolean;
    obstacle: boolean;
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

const [grid, guard] = parseData(text);

function move(): boolean {
    if (guard.direction === "N") {
        guard.row--;
    } else if (guard.direction === "E") {
        guard.col++;
    } else if (guard.direction === "S") {
        guard.row++;
    } else if (guard.direction === "W") {
        guard.col--;
    }
    const [row, col] = [guard.row, guard.col];
    const node = grid[row]?.[col];
    console.log(guard, node);
    if (node === undefined) {
        return false;
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
        return move();
    }
    grid[row][col].visited = true;
    return true;
}

while (move()) { 
    // do nothing
}

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

const sum = grid.reduce((acc, row) => {
    return acc + row.filter(n => n.visited).length;
}, 0);

console.log("Part 1:", sum);