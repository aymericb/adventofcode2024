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

function visitAll(data: string[][], row: number, col: number): number {
    const value = data[row][col];
    if (value === VISITED) {
        return 0;
    }

    const context: VisitorContext = {
        region: value,
        area: 0,
        perimeter: 0,
        coords: []
    };

    visit(data, row, col, context);
    const tally = context.area * context.perimeter;
    for (const [row, col] of context.coords) {
        data[row][col] = VISITED;
    }
    // console.log(row, col, context.region, tally);
    return tally;
}

const data = parseData(text);

let sum = 0;
for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
        sum += visitAll(data, row, col);
    }
}
console.log(sum);



