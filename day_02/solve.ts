
// Load input file 
async function loadFile(path: string) {
    const text = await Deno.readTextFile(path);
    const data = text
      .split("\n")
      .filter(line => line.trim() !== "")
      .map(line => line.split(" ").map(Number));
    return data;
}

const data = await loadFile("./input.txt");
// console.log(data);

function computeDeltas(data: number[]) {
    return data.map((x, i) => x - data[i - 1]).slice(1);
}

function isSafe(deltas: number[]) {
    const sameSign = deltas.every(x => x * deltas[0] > 0);
    const diffAtMost3 = deltas.every(x => Math.abs(x) <= 3);
    const diffAtLeast1 = deltas.every(x => Math.abs(x) >= 1);
    return sameSign && diffAtMost3 && diffAtLeast1;
}

const sum = data.map(computeDeltas).filter(isSafe).reduce(acc => acc + 1, 0);
// console.log("Solution to part 1:", sum);

// Part 2

function isSafeWithDampener(data: number[]) {
    if (isSafe(computeDeltas(data))) {
        return true;
    }


    // Brute force O(n^2)
    for (let i = 0; i < data.length; i++) {
        const subdata = [...data.slice(0, i), ...data.slice(i + 1)];
        if (isSafe(computeDeltas(subdata))) {
            return true;
        }
    }

    return false;
}

// console.log(data.map(x => ({
//     data: x,
//     safe: isSafeWithDampener(x)
// })));
const sum2 = data.filter(isSafeWithDampener).reduce(acc => acc + 1, 0);
console.log("Solution to part 2:", sum2);
