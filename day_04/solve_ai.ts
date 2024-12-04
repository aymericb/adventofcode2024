const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");

// index: row, col 
const grid = text.trim().split("\n").map(line => line.split(""));

//
// AI Generated
//

// All 8 possible directions to check
const directions = [
    [-1, -1], [-1, 0], [-1, 1],  // up-left, up, up-right
    [0, -1],           [0, 1],    // left, right
    [1, -1],  [1, 0],  [1, 1]     // down-left, down, down-right
];

function isValidPos(row: number, col: number, maxRow: number, maxCol: number): boolean {
    return row >= 0 && row < maxRow && col >= 0 && col < maxCol;
}

function findXMAS(grid: string[][]): { count: number; debugGrid: string[][] } {
    const rows = grid.length;
    const cols = grid[0].length;
    let count = 0;
    const debugGrid = Array.from({ length: rows }, () => 
        Array.from({ length: cols }, () => '.')
    );

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Check each direction from this starting position
            for (const [dRow, dCol] of directions) {
                let found = true;
                const word = "XMAS";
                const positions: [number, number][] = [];

                // Check if word fits in this direction
                for (let i = 0; i < word.length; i++) {
                    const newRow = row + dRow * i;
                    const newCol = col + dCol * i;

                    if (!isValidPos(newRow, newCol, rows, cols) || 
                        grid[newRow][newCol] !== word[i]) {
                        found = false;
                        break;
                    }
                    positions.push([newRow, newCol]);
                }

                if (found) {
                    count++;
                    // Mark the found word in debug grid
                    for (const [r, c] of positions) {
                        debugGrid[r][c] = grid[r][c];
                    }
                }
            }
        }
    }

    return { count, debugGrid };
}

const { count, debugGrid } = findXMAS(grid);
console.log(`Found ${count} instances of XMAS`);
// console.log("\nDebug grid:");
// console.log(debugGrid.map(row => row.join("")).join("\n"));
