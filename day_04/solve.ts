const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");

// index: row, col 
const grid = text.trim().split("\n").map(line => line.split(""));

type Matches = [number, number][];
const matches: Set<Matches> = new Set();

function search(row: number, col: number, word: string, history: Matches, direction: [number, number]): boolean {

    // Check if the current letter matches
    const letter = word[0];
    // console.log(row, col, letter, grid[row][col], word);
    if (grid[row][col] !== letter) {
        return false;
    }

    // Update history
    history = [...history];
    history.push([row, col]);

    // Search for the next letter
    word = word.slice(1);
    if (word.length === 0) {
        matches.add(history);
        return true;
    }

    // console.log(word);

    const [dRow, dCol] = direction;
    const newRow = row + dRow;
    const newCol = col + dCol;    
    if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[newRow].length) {
        return false;
    }

    return search(newRow, newCol, word, history, direction);
}




// search(9, 3, "XMAS", [], [-1, -1]); 

for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
        for (const [dRow, dCol] of [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
            search(row, col, "XMAS", [], [dRow, dCol]); 
        }
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
    