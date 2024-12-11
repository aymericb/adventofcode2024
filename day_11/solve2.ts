const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");


function parseData(text: string): number[] {
    return text.split("\n").map(line => line.split(" ").map(Number)).flat();
}

const data = parseData(text);
// console.log(data);

const memo = new Map<bigint, bigint>();

function blinkMemo(stone: bigint, depth: number, digits?: number): bigint {
    if (memo.has(stone)) {
        return memo.get(stone)!;
    }
    return blink(stone, depth, digits);
}


function blink(stone: bigint, depth: number, digits?: number): bigint {
    if (depth === 0) {
        return 1n;
    }    
    if (stone === 0n) {
        return blink(1n, depth - 1);
    }

    
    if (!digits) {
        digits = stone.toString().length;
    }
    // Check if digits are correct
    // if (digits !== stone.toString().length) {
    //     console.log("Debug:", stone, digits, stone.toString().length, depth);
    //     throw new Error("Debug");
    // }

    if (digits % 2 === 0) {
        // For even number of digits, split in half using division/modulo
        let divisor = 10n ** (BigInt(digits) / 2n);
        const left = stone / divisor;
        const right = stone % divisor;

        let rightDigits = digits / 2;
        if (right < divisor) {
            while (right < divisor) {
                // console.log("rightDigits:", digits, rightDigits, stone, right, divisor);
                rightDigits--;
                divisor /= 10n;
            }
            rightDigits++;
        }

        return blink(left, depth - 1, digits / 2) 
             + blink(right, depth - 1, rightDigits);
    } else {
        const divisor = 10n ** BigInt(digits);
        const newStone = stone * 2024n;
        let temp = newStone / divisor;
        while (temp > 0n) {
            temp /= 10n;
            digits++;
        }

        return blink(newStone, depth - 1, digits);
    }
}

function blinkStr(stone: bigint, depth: number): bigint {
    if (depth === 0) {
        return 1n;
    }    
    if (stone === 0n) {
        return blinkStr(1n, depth - 1);
    }

    const str_stone = stone.toString();
    if (str_stone.length % 2 === 0) {
        const left = BigInt(str_stone.slice(0, str_stone.length / 2));
        const right = BigInt(str_stone.slice(str_stone.length / 2));
        return blinkStr(left, depth - 1) + blinkStr(right, depth - 1);
    } else {
        return blinkStr(stone * 2024n, depth - 1);
    }
}


function blinkAll(stones: number[], depth: number): bigint {
    const bigStones = stones.map(stone => BigInt(stone));
    let tally = 0n;
    for (let i = 0; i < bigStones.length; i++) {
        // console.log("Debug:", bigStones[i], depth);
        tally += blink(bigStones[i], depth);
    }
    return tally;
}

function blinkAllStr(stones: number[], depth: number): bigint {
    const bigStones = stones.map(stone => BigInt(stone));
    let tally = 0n;
    for (let i = 0; i < bigStones.length; i++) {
        // console.log("Debug:", bigStones[i], depth);
        tally += blinkStr(bigStones[i], depth);
    }
    return tally;
}

function createWorker(stone: bigint, depth: number) {
    const workerCode = `
        let memo = new Map();
        ${blinkMemo.toString()}
        ${blink.toString()}

        self.onmessage = (e) => {
            const { stone, depth } = e.data;
            const result = blinkMemo(stone, depth);
            self.postMessage(result);
        };
    `;

    return new Worker(`data:application/javascript;charset=utf-8,${encodeURIComponent(workerCode)}`, { type: "module" });
}


function blinkArray(stone: number): number[] {
    if (stone === 0) {
        return [1];
    }
    
    // Get number of digits
    const numDigits = Math.floor(Math.log10(stone)) + 1;    
    if (numDigits % 2 === 0) {
        const divisor = 10 ** (numDigits / 2);
        const right = stone % divisor;
        const left = Math.floor(stone / divisor);
        return [left, right];
    }
    return [2024 * stone];
}

function blinkAllArray(stones: number[]): number[] {
    return stones.map(stone => blinkArray(stone)).flat();
}

// Part 1: 185894

console.log("Part 1:", data.length);

async function blinkAllParallel(stones: number[], depth: number): Promise<bigint> {
    const BATCH_SIZE = navigator.hardwareConcurrency || 4; // Use available CPU cores
    console.log("BATCH_SIZE:", BATCH_SIZE);
    let tally = 0n;
    const bigStones = stones.map(stone => BigInt(stone));
    
    // Process stones in batches
    for (let i = 0; i < bigStones.length; i += BATCH_SIZE) {
        const batch = bigStones.slice(i, i + BATCH_SIZE);
        const workers = batch.map(stone => {
            const worker = createWorker(stone, depth);
            worker.postMessage({ stone, depth });
            return worker;
        });

        const results = await Promise.all(
            workers.map(worker => 
                new Promise<bigint>((resolve) => {
                    worker.onmessage = (e) => {
                        worker.terminate();
                        resolve(e.data);
                    };
                })
            )
        );

        tally += results.reduce((sum, val) => sum + val, 0n);
    }
    
    return tally;
}

async function blinkAllParallelRoundArray(stones: number[], depth: number): Promise<bigint> {
    if (depth <= 5) {
        return blinkAllParallel(stones, depth);
    }

    for (let i=0; i<5; i++) {
        stones = blinkAllArray(stones);
    }    
    return blinkAllParallel(stones, depth - 5);
}



function measureTime(fn: () => bigint, label: string = "Operation"): bigint {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${label}:`, result);
    console.log(`Time taken for ${label}:`, end - start, "milliseconds");
    return result;
}

async function measureTimeAsync(fn: () => Promise<bigint>, label: string = "Operation"): Promise<bigint> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${label}:`, result);
    console.log(`Time taken for ${label}:`, end - start, "milliseconds");
    return result;
}

function blinkAllMemo(stones: number[], depth: number): bigint {
    const bigStones = stones.map(stone => BigInt(stone));
    let tally = 0n;
    for (let i = 0; i < bigStones.length; i++) {
        // console.log("Debug:", bigStones[i], depth);
        tally += blinkMemo(bigStones[i], depth);
    }
    return tally;
}



console.log("Debug:", blinkAll([125, 17], 6));

// Part 1: 185894
console.log("Part 1:", blinkAll(data, 25));

// measureTime(() => blinkAll(data, 46), "blnkall 46");
// measureTime(() => blinkAllMemo(data, 46), "blnkall memo 46");
// measureTime(() => blinkAllStr(data, 36), "blnkall str 36");
// await measureTimeAsync(() => blinkAllParallel(data, 36), "blnkall memo 36");
// 1.5x factor
await measureTimeAsync(() => blinkAllParallelRoundArray(data, 45), "blnkall parallel round 45");
// await measureTimeAsync(() => blinkAllParallelRoundArray(data, 46), "blnkall parallel round 46");
// await measureTimeAsync(() => blinkAllParallelRoundArray(data, 47), "blnkall parallel round 47");

// console.log("40", blinkAll(data, 40));


// console.log("Part 2:", blinkAll(data, 75));
// 