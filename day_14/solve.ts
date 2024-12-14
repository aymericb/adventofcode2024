import { Image } from "https://deno.land/x/imagescript/mod.ts";

function measure<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`Time taken for ${label}:`, end - start, "milliseconds");
    return result;
}

type Robot = {
    position: [number, number];
    velocity: [number, number];
}

type Grid = {
    robots: Robot[];
    width: number;
    height: number;
}

function parseData(text: string): Robot[] {
    const regex = /^p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/;
    const robots: Robot[] = text.split("\n")
        .filter(line => line.length > 0)
        .map(line => {
            const match = regex.exec(line);
            return {
                position: [parseInt(match![1]), parseInt(match![2])],
                velocity: [parseInt(match![3]), parseInt(match![4])]
            };
        });
    return robots;
}

async function loadGrid(filename: string): Promise<Grid> {
    const text = await Deno.readTextFile(filename);
    const robots = parseData(text);
    const isSample = filename === "sample.txt";
    const width = isSample ? 11 : 101;
    const height = isSample ? 7 : 103;

    return { robots, width, height };
}

function moveRobot(robot: Robot, width: number, height: number): void {
    robot.position[0] += robot.velocity[0];
    robot.position[1] += robot.velocity[1];
    if (robot.position[0] < 0) {
        robot.position[0] += width;
    } else if (robot.position[0] >= width) {
        robot.position[0] -= width;
    }
    if (robot.position[1] < 0) {
        robot.position[1] += height;
    } else if (robot.position[1] >= height) {
        robot.position[1] -= height;
    }
}

function moveRobots(grid: Grid): void {
    for (const robot of grid.robots) {
        moveRobot(robot, grid.width, grid.height);
    }
}

function printGrid(grid: Grid): void {
    for (let y = 0; y < grid.height; ++y) {
        let line = "";
        for (let x = 0; x < grid.width; ++x) {
            const count = grid.robots.filter(robot => robot.position[0] === x && robot.position[1] === y).length;
            line += count > 0 ? count : ".";
        }
        console.log(line);
    }
}

function countRobots(grid: Grid, [x, y, w, h]: [number, number, number, number]): number {
    return grid.robots.filter(robot => robot.position[0] >= x && robot.position[0] < x + w && robot.position[1] >= y && robot.position[1] < y + h).length;
}

function countRobotsNoOverlap(grid: Grid, [x, y, w, h]: [number, number, number, number]): number {
    const robots =  grid.robots.filter(robot => robot.position[0] >= x && robot.position[0] < x + w && robot.position[1] >= y && robot.position[1] < y + h);
    const uniqueRobots = new Set(robots.map(robot => robot.position.toString()));
    // if (robots.length != uniqueRobots.size) {
    //     return 0;
    // }
    return uniqueRobots.size;
}


function safetyScore(grid: Grid): number {
    const w = Math.floor(grid.width / 2);
    const h = Math.floor(grid.height / 2);
    return countRobots(grid, [0, 0, w, h]) *
        countRobots(grid, [w+1, 0, w, h]) *
        countRobots(grid, [0, h+1, w, h]) *
        countRobots(grid, [w+1, h+1, w, h]);
}

function xMasScore(grid: Grid): number {
    let bestScore = 0;
    let current = 0;
    for (let y = 0; y < grid.height; ++y) {
        const robots = grid.robots.filter(robot => robot.position[1] == y);
        robots.sort((a, b) => a.position[0] - b.position[0]);
        current = 0;
        for (let i = 0; i < robots.length; ++i) {
            if (robots[i].position[0] === robots[i+1]?.position[0] + 1) {
                current++;
            } else {
                current = 0;
            }
        }
        if (current > bestScore) {
            bestScore = current;
        }

    }
    // console.log(bestScore);
    return bestScore;
}

// const data = await loadGrid("sample.txt");
const data = await loadGrid("input.txt");
// console.log(data);

for (let i = 0; i < 100; ++i) {
    moveRobots(data);
}

function cloneRobots(robots: Robot[]): Robot[] {
    return robots.map(robot => ({position: [...robot.position], velocity: [...robot.velocity]}));
}

printGrid(data);
console.log("Part 1:", safetyScore(data));
const robots: Robot[] = cloneRobots(data.robots);

function checkRobotsEquality(robots: Robot[], other: Robot[]): boolean {
    if (robots.length != other.length) {
        return false;
    }
    for (let i = 0; i < robots.length; ++i) {
        if (robots[i].position[0] !== other[i].position[0] || robots[i].position[1] !== other[i].position[1] || robots[i].velocity[0] !== other[i].velocity[0] || robots[i].velocity[1] !== other[i].velocity[1]) {
            return false;
        }
    }
    return true;
}

async function createImage(grid: Grid, i: number): Promise<void> {
    const image = new Image(grid.width, grid.height);
    for (let y = 0; y < grid.height; ++y) {
        for (let x = 0; x < grid.width; ++x) {
            const count = grid.robots.filter(robot => robot.position[0] === x && robot.position[1] === y).length;
            // console.log(x, y, count);
            image.setPixelAt(x+1, y+1, count > 0 ? 0xffffffff : 0xff);
        }
    }
    const encoded = await image.encode();
    await Deno.writeFile(`robots/robots_${i}.png`, encoded);
}

console.log("Looking for xMas trees");
let i = 100;
while (true) {
    // await createImage(data, i);
    moveRobots(data);
    i++;
    if (i % 100000 == 0) {
        console.log(i, xMasScore(data));
    }
    if (xMasScore(data) >= 12) {
        console.log("Treee??:", i, xMasScore(data));
        printGrid(data);
    }
    // console.log(robots);
    if (checkRobotsEquality(robots, data.robots)) {
        console.log("Robots are equal at", i);
        break;
    }

}
const equality = i;

function computeDuplicates(robots: Robot[]): number {
    let count = 0;
    for (let i = 0; i < robots.length; ++i) {
        for (let j = i+1; j < robots.length; ++j) {
            if (robots[i].position[0] == robots[j].position[0] && robots[i].position[1] == robots[j].position[1]) {
                count++;
            }
        }
    }
    return count;
}

// Min duplicates
let scores = [];
data.robots = cloneRobots(data.robots);
for (let i = 0; i < equality; ++i) {
    // scores.push(safetyScore(data));
    scores.push(computeDuplicates(data.robots));
    moveRobots(data);
}
const min = Math.min(...scores);
console.log(min);
let find = -1;
while (find < 0) {
    find = scores.indexOf(min, find + 1);
    console.log(find+100);
}

// Safety scores
scores = [];
data.robots = cloneRobots(data.robots);
for (let i = 0; i < equality; ++i) {
    scores.push(safetyScore(data));
    // scores.push(computeDuplicates(data.robots));
    moveRobots(data);
}
const max = Math.max(...scores);
console.log(max);
find = -1;
while (find < 0) {
    find = scores.indexOf(max, find + 1);
    console.log(find+100);
}




