const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");


function parseData(text: string): number[][] {
    return text.split("\n").map(line => line.split("").map(Number));
}


const data = parseData(text);

// console.log(data);

function walk(row: number, col: number, data: number[][], start: number, acc: [number, number][]): [number, number][] {
    if (row < 0 || row >= data.length || col < 0 || col >= data[row].length) {
        return acc;
    }
    if (data[row][col] !== start) {
        return acc;
    }
    if (start === 9) {
        return [...acc, [row, col]];
    }

    return [...walk(row - 1, col, data, start + 1, acc),
            ...walk(row + 1, col, data, start + 1, acc),
            ...walk(row, col - 1, data, start + 1, acc),
            ...walk(row, col + 1, data, start + 1, acc)];
}

function walkSum(row: number, col: number, data: number[][]): [number, number] {
    const result = walk(row, col, data, 0, []);
    const uniqueResults = result.filter((item, index) => {
        return result.findIndex(other => other[0] === item[0] && other[1] === item[1]) === index;
    });
    const ratings = uniqueResults.map(item => {
        return result.filter(other => other[0] === item[0] && other[1] === item[1]).length;
    });
    const rating = ratings.reduce((acc, rating) => acc + rating, 0);
    return [uniqueResults.length,  rating];    
}

let score = 0;
let rating = 0;
for (let i=0; i<data.length; i++) {
    for (let j=0; j<data[i].length; j++) {
        const [walk_sum, walk_rating] = walkSum(i, j, data);
        score += walk_sum;
        rating += walk_rating;
    }
}

console.log("Part 1:", score);
console.log("Part 2:", rating);
// console.log(walkSum(0, 2, data, 0));