const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");


function parseData(text: string): number[] {
    return text.split("\n").map(line => line.split(" ").map(Number)).flat();
}

let data = parseData(text);
// console.log(data);

function blink(stone: number): number[] {
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

function blinkAll(stones: number[]): number[] {
    return stones.map(stone => blink(stone)).flat();
}

// Part 1: 185894

for (let i=0; i<25; i++) {
    data = blinkAll(data);
}

console.log("Part 1:", data.length);

for (let i=0; i<45; i++) {
    data = blinkAll(data);
    console.log(i, data.length);
}
console.log("Part 2:", data.length);