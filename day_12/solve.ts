const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");

function measure<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`Time taken for ${label}:`, end - start, "milliseconds");
    return result;
}

function parseData(text: string): string[][] {
    return text.split("\n")
        .filter(line => line.length > 0)
        .map(line => line.split(""));
}

function printData(data: string[][]) {
    console.log(data.map(line => line.join("")).join("\n"));
}

const VISITED = " ";

type VisitorContext = {
    region: string;
    area: number;
    perimeter: number;
    coords: [number, number][];
}

function visit(data: string[][], row: number, col: number, context: VisitorContext) {

    const value = data[row]?.[col];
    if (value !== context.region) {
        return;
    }

    if (context.coords.some(x => x[0] === row && x[1] === col)) {
        return;
    }
    // console.log(row, col, 1);

    context.coords.push([row, col]);

    context.area += 1;
    context.perimeter += 
        (data[row - 1]?.[col] !== context.region ? 1 : 0) +
        (data[row + 1]?.[col] !== context.region ? 1 : 0) +
        (data[row]?.[col - 1] !== context.region ? 1 : 0) +
        (data[row]?.[col + 1] !== context.region ? 1 : 0);

    visit(data, row+1, col, context);
    visit(data, row, col+1, context);
    visit(data, row-1, col, context);
    visit(data, row, col-1, context);
}

function computeSideInternal(coords: [number, number][], moves: [number, number][], check: [number, number]): number {
    let remainingCoords = [...coords];

    const inside = (coords: [number, number][],[row, col]: [number, number]): boolean => coords.some(x => x[0] === row && x[1] === col);
    const remove = (coords: [number, number][],[row, col]: [number, number]): [number, number][] => coords.filter(x => x[0] !== row || x[1] !== col);

    let sides = 0;
    while (remainingCoords.length > 0) {
        const [row, col] = remainingCoords.pop()!;
        // console.log(row, col, inside(coords, [row + check[0], col + check[1]]));

        if (inside(coords, [row + check[0], col + check[1]])) {
            continue;
        }
        // console.log("coords", coords);

        sides += 1;
        for (const move of moves) {
            let moveCoord: [number, number] = [row + move[0], col + move[1]];
            while (inside(remainingCoords, moveCoord) && !inside(coords, [moveCoord[0] + check[0], moveCoord[1] + check[1]])) {
                // console.log("move", moveCoord);
                remainingCoords = remove(remainingCoords, moveCoord);
                moveCoord = [moveCoord[0] + move[0], moveCoord[1] + move[1]];
            }
            // console.log("move stop");
        }
        // console.log("sides", sides);
    }    

    // console.log(sides);
    return sides;
}

function computeSide(coords: [number, number][]): number {
    // console.log(coords);
    // return computeSideInternal(coords, [[0, 1], [0, -1]], [1, 0]);

    return computeSideInternal(coords, [[0, 1], [0, -1]], [-1, 0]) +    // up
           computeSideInternal(coords, [[0, 1], [0, -1]], [1, 0]) +      // down
           computeSideInternal(coords, [[1, 0], [-1, 0]], [0, -1]) +     // left
           computeSideInternal(coords, [[1, 0], [-1, 0]], [0, 1]);         // right
};

function visitAll(data: string[][], row: number, col: number): [number, number] {
    const value = data[row][col];
    if (value === VISITED) {
        return [0, 0];
    }

    const context: VisitorContext = {
        region: value,
        area: 0,
        perimeter: 0,
        coords: []
    };

    visit(data, row, col, context);
    for (const [row, col] of context.coords) {
        data[row][col] = VISITED;
    }

    const tally = context.area * context.perimeter;
    const newTally = context.area * computeSide(context.coords);
    console.log(context.region, tally, newTally);
    return [tally, newTally];
}

const data = parseData(text);

let part1 = 0;
let part2 = 0;
for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
        const [sum1, sum2] = visitAll(data, row, col);
        part1 += sum1;
        part2 += sum2;
        part2 = Math.max(part2, sum2);
    }
}
console.log("Part1:", part1);
console.log("Part2:", part2);

// console.log(visitAll(data, 0, 6));
// printData(data);

