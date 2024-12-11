const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");


function parseData(text: string): number[] {
    return text.split("\n").map(line => line.split(" ").map(Number)).flat();
}

const data = parseData(text);
// console.log(data);

const BigIntZero = BigInt(0);
const BigIntOne = BigInt(1);
const BigInt2024 = BigInt(2024);

function blink(stone: bigint, depth: number): bigint {
    if (depth === 0) {
        return BigIntOne;
    }    
    if (stone === BigIntZero) {
        return blink(BigIntOne, depth - 1);
    }

    const str_stone = stone.toString();
    if (str_stone.length % 2 === 0) {
        const left = BigInt(str_stone.slice(0, str_stone.length / 2));
        const right = BigInt(str_stone.slice(str_stone.length / 2));
        return blink(left, depth - 1) + blink(right, depth - 1);
    } else {
        return blink(stone * BigInt2024, depth - 1);
    }
}

function blinkAll(stones: number[], depth: number): bigint {
    const bigStones = stones.map(stone => BigInt(stone));
    let tally = BigIntZero;
    for (let i = 0; i < bigStones.length; i++) {
        tally += blink(bigStones[i], depth);
    }
    return tally;
}

console.log("Debug:", blinkAll([125, 17], 6));

// Part 1: 185894
console.log("Part 1:", blinkAll(data, 25));
console.log("50", blinkAll(data, 50));
// console.log("Part 2:", blinkAll(data, 75));
