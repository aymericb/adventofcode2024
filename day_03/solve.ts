const text = await Deno.readTextFile("input.txt");
// console.log(text);

const re = /mul\(([0-9]{1,3})\,([0-9]{1,3})\)/g;

const sum = Array.from(text.matchAll(re))
    .map(x => [Number(x[1]), Number(x[2])])
    .map(([a, b]) => a * b)
    .reduce((acc, x) => acc + x, 0);

console.log("Solution to part 1:", sum);

// Part 2
const re2 = /(mul\(([0-9]{1,3})\,([0-9]{1,3})\))|(don't\(\))|(do\(\))/g;
// const sample = "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))";
const matches = Array.from(text.matchAll(re2));

// My input data is pathological, I don't need to handle the 'state' at all… everything is summed up!
let state = true;
let sum2 = 0;
for (const match of matches) {
    const s = match[0];
    if (s === "do()") {
        state = true;
    } else if (s === "don't()") {
        state = false;
    } else if (state) {
        if (state) {
            sum2 += Number(match[2]) * Number(match[3]);
        }
    }
}
console.log("Solution to part 2:", sum2);
