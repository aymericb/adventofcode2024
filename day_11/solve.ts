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
    const str_stone = stone.toString();
    if (str_stone.length%2 === 0) {
        const left = str_stone.slice(0, str_stone.length/2);
        const right = str_stone.slice(str_stone.length/2);
        return [Number(left), Number(right)];
    }
    return [2024 * stone];
}

function blinkAll(stones: number[]): number[] {
    return stones.map(stone => blink(stone)).flat();
}

for (let i=0; i<25; i++) {
    data = blinkAll(data);
}

console.log("Part 1:", data.length);
