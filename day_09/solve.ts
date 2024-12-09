const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");


type Node = {
    file: number | null;
}

function parseData(text: string): Node[] {
    const indices = text.split("").map(Number);
    const data: Node[] = [];
    let in_file = true;
    let file = 0;
    for (const value of indices) {
        if (in_file) {
            const files = Array(value);
            for (let i=0; i<files.length; i++) {
                files[i] = { file };
            }
            data.push(...files);
            file += 1;
        } else {
            const gaps = Array(value);
            for (let i=0; i<gaps.length; i++) {
                gaps[i] = { file: null };
            }
            data.push(...gaps);
        }
        in_file = !in_file;
    }
    return data;
}

function print(data: Node[]) {
    console.log(data.map(x => x.file !== null ? x.file : ".").join(""));
}

function compress(data: Node[]) {
    let j = data.length - 1;
    for (let i=0; i<data.length; i++) {
        // print(data);
        if (data[i].file === null) {
            while (data[j].file === null) {
                j -= 1;
            }
            if (j <= i) {
                return;
            }
            data[i].file = data[j].file;
            data[j].file = null;
            j -= 1;
        }
    }    
}

const data = parseData(text);
// print(data);
compress(data);
// print(data);

const part1 = data.reduce((acc, x, i) => acc + (x.file ?? 0) * i, 0);
console.log("Part 1:", part1);