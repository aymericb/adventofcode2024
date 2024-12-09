const text = await Deno.readTextFile("input.txt");
// const text = await Deno.readTextFile("sample.txt");


type BitmapAlloc = (number | null)[];

function parseData(text: string): BitmapAlloc {
    const indices = text.split("").map(Number);
    const data: BitmapAlloc = [];
    let in_file = true;
    let file = 0;
    for (const value of indices) {
        if (in_file) {
            const files = Array(value);
            for (let i=0; i<files.length; i++) {
                files[i] = file;
            }
            data.push(...files);
            file += 1;
        } else {
            const gaps = Array(value);
            for (let i=0; i<gaps.length; i++) {
                gaps[i] = null;
            }
            data.push(...gaps);
        }
        in_file = !in_file;
    }
    return data;
}

function print(data: BitmapAlloc) {
    console.log(data.map(x => x !== null ? x : ".").join(""));
}

function compress(data: BitmapAlloc) {
    let j = data.length - 1;
    for (let i=0; i<data.length; i++) {
        // print(data);
        if (data[i] === null) {
            while (data[j] === null) {
                j -= 1;
            }
            if (j <= i) {
                return;
            }
            data[i] = data[j];
            data[j] = null;
            j -= 1;
        }
    }    
}

type Segment = {
    start: number;
    length: number;
    value: number | null;
}

function findForwardSegment(data: BitmapAlloc, start: number): Segment  {
    const file = data[start];
    if (file !== null) {
        throw new Error("Logic error, file is not null");
    }
    let i = start;
    while (i < data.length && data[i] === file) {
        i += 1;
    }
    return { start, length: i - start, value: file };
}

function findBackwardSegment(data: BitmapAlloc, start: number): Segment  {
    const file = data[start];
    if (file === null) {
        throw new Error("Logic error, file is null");
    }
    let i = start;
    while (i >= 0 && data[i] === file) {
        i -= 1;
    }
    return { start: i + 1, length: start - i, value: file };
}

function fillSegment(data: BitmapAlloc, segment: Segment, file: number | null) {
    for (let i=0; i<segment.length; i++) {
        data[segment.start + i] = file;
    }
}

function compressNofragment(data: BitmapAlloc) {

    for (let j=data.length - 1; j>=0; j--) {
        // console.log("j", j, data[j]);
        // print(data);
        if (data[j] === null) {
            continue;
        }
        const file_segment = findBackwardSegment(data, j);
        // console.log("file_segment", file_segment);

        let skip = true;
        for (let i=0; i<file_segment.start; i++) {
            if (data[i] !== null) {
                continue;
            }
            const free_segment = findForwardSegment(data, i);
            // console.log("free_segment", free_segment);
            if (free_segment.length >= file_segment.length) {
                free_segment.length = file_segment.length;
                fillSegment(data, free_segment, file_segment.value);
                fillSegment(data, file_segment, null);
                skip = false;
                break;
            }
        }
        if (skip) {
            j -= file_segment.length;
            j += 1;
        }
    }
}


const data = parseData(text);

const dataPart1 = [...data];
// print(dataPart1);
compress(dataPart1);
// print(dataPart1);

const part1 = dataPart1.reduce((acc, x, i) => acc! + (x ?? 0) * i, 0);
console.log("Part 1:", part1);

const dataPart2 = [...data];
// print(dataPart2);
compressNofragment(dataPart2);
// print(dataPart2);
const part2 = dataPart2.reduce((acc, x, i) => acc! + (x ?? 0) * i, 0);
console.log("Part 2:", part2);
