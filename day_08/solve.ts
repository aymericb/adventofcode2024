const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");

type Node = {
    freq: string | null;
    anti: boolean;
}

function parseData(text: string): Node[][] {
    return text.split("\n").filter(line => line).map(line => {
        return line.split("").map(x => ({ freq: x === "." ? null : x, anti: false }));
    });
}

function printGrid(grid: Node[][]) {
    for (const row of grid) {
        const line = row.map(x => {
            if (x.freq) {
                return x.freq;
            } else if (x.anti) {
                return "#";
            } else {
                return ".";
            }
        }).join("");
        console.log(line);
    }
}

function unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
}

const data = parseData(text);


function findFrequencies(data: Node[][]): Map<string, [number, number][]> {
    const frequencies: Map<string, [number, number][]> = new Map();
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            const node = data[i][j];
            if (node.freq) {
                frequencies.set(node.freq, [...(frequencies.get(node.freq) || []), [i, j]]);
            }
        }
    }
    return frequencies;
}

function markAnti(positions: [number, number][]) {
    const width = data[0].length;
    const height = data.length;

    for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
            const [x1, y1] = positions[i];
            const [x2, y2] = positions[j];

            const [dx1, dy1] = [x1 - x2, y1 - y2];
            const [dx2, dy2] = [x2 - x1, y2 - y1];

            const [xa1, ya1] = [x1 + dx1, y1 + dy1];
            const [xa2, ya2] = [x2 + dx2, y2 + dy2];

            if (xa1 >= 0 && xa1 < width && ya1 >= 0 && ya1 < height) {
                data[xa1][ya1].anti = true;
            }
            if (xa2 >= 0 && xa2 < width && ya2 >= 0 && ya2 < height) {
                data[xa2][ya2].anti = true;
            }
        }
    }
}

const frequencies = findFrequencies(data);
console.log(frequencies);

for (const key of frequencies.keys()) {
    markAnti(frequencies.get(key) || []);
}
// printGrid(data);
const part1 = data.flat().filter(x => x.anti).length;
console.log("Part1", part1);

