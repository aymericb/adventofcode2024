const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");


function parseData(text: string): number[] {
    return text.split("\n").map(line => line.split(" ").map(Number)).flat();
}

const data = parseData(text);

// Too many items for a single map
class Memo {
    memos: Map<number, Map<number, number>>;
    constructor() {
        this.memos = new Map<number, Map<number, number>>();
    }
    get(stone: number, depth: number): number | undefined {
        if (!this.memos.has(depth)) {
            this.memos.set(depth, new Map<number, number>());
        }
        return this.memos.get(depth)!.get(stone);
    }
    set(stone: number, depth: number, value: number): void {
        if (!this.memos.has(depth)) {
            this.memos.set(depth, new Map<number, number>());
        }
        this.memos.get(depth)!.set(stone, value);
    }
}

function blink(stone: number, depth: number, memo: Memo): number {
    let result = memo.get(stone, depth);
    if (result) {
        return result;
    }

    if (depth === 0) {
        return 1;
    }
    if (stone === 0) {
        return blink(1, depth - 1, memo);
    }

    // Get number of digits
    const numDigits = Math.floor(Math.log10(stone)) + 1;
    if (numDigits % 2 === 0) {
        const divisor = 10 ** (numDigits / 2);
        const right = stone % divisor;
        const left = Math.floor(stone / divisor);
        result = blink(left, depth - 1, memo) + blink(right, depth - 1, memo);
    } else {
        result = blink(2024 * stone, depth - 1, memo);
    }
    memo.set(stone, depth, result);
    return result;
}

function measure<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`Time taken for ${label}:`, end - start, "milliseconds");
    return result;
}

function blinkAll(stones: number[], depth: number, label: string): number {
    const memo = new Memo();
    const result = measure(() => 
        stones.map(stone => blink(stone, depth, memo)).reduce((a, b) => a + b, 0),
        label
    );
    console.log(`Result for ${label}:`, result);
    return result;
}


blinkAll(data, 25, "Part 1");
blinkAll(data, 75, "Part 2");

// for (let i=0; i<45; i++) {
//     data = blinkAll(data);
//     console.log(i, data.length);
// }
// console.log("Part 2:", data.length);