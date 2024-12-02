
// Load input file 
async function loadFile(path: string) {
  const text = await Deno.readTextFile(path);
  const data = text
    .split("\n")
    .filter(line => line.trim() !== "")
    .map(line => line.split("   ").map(Number));
  const l1 = data.map(x => x[0]);
  const l2 = data.map(x => x[1]);
  return [l1, l2];
}


const [l1, l2] = await loadFile("./input.txt");
l1.sort();
l2.sort();

// console.log(l1);
// console.log(l2);

const distances = l1.map((x, i) => Math.abs(l2[i] - x));
// console.log(distances);

const sum = distances.reduce((acc, x) => acc + x, 0);
console.log(sum);
