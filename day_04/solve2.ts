const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");

// index: row, col 
const grid = text.trim().split("\n").map(line => line.split(""));

type Matches = [number, number][];
const matches: Set<Matches> = new Set();

function check(row: number, col: number): boolean {
    if (grid[row][col] !== "A") {
        return false;
    }

    if (row === 0 || row === grid.length - 1 || col === 0 || col === grid[row].length - 1) {
        return false;
    }
    
    const diag1 = [grid[row-1][col-1], grid[row][col], grid[row + 1][col + 1]].join("");
    const diag2 = [grid[row-1][col+1], grid[row][col], grid[row + 1][col - 1]].join("");
    
    const match = (diag1 === "MAS" || diag1 === "SAM") && (diag2 === "MAS" || diag2 === "SAM");
    if (match) {
        matches.add([[row-1, col-1], [row, col], [row+1, col+1], [row-1, col+1], [row, col], [row+1, col-1]]);
    }
    return match;
}



for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
        check(row, col)
    }
}

console.log("matches count", matches.size);
// console.log("matches", matches);

const flatMatches = Array.from(matches.values()).flat();
for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
        if (!flatMatches.some(([mRow, mCol]) => mRow === row && mCol === col)) {
            grid[row][col] = ".";
        }
    }
}
// grid[9][3] = "x";

const output = grid.map(line => line.join("")).join("\n");

console.log(output);
    