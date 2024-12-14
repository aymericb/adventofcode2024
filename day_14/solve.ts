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
    if (robots.length != uniqueRobots.size) {
        return 0;
    }
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
        const count = countRobotsNoOverlap(grid, [0, y, grid.width, 1]);
        if (count == 0 || (count != current + 1 && count != current + 2 && count != current + 3)) {
            bestScore = Math.max(bestScore, current);
            current = 0;
        } else {
            current = count;
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


printGrid(data);
console.log("Part 1:", safetyScore(data));

console.log("Looking for xMas trees");
let i = 100;
while (true) {
    moveRobots(data);
    i++;
    if (i % 100000 == 0) {
        console.log(i, xMasScore(data));
    }
    if (xMasScore(data) >= 20) {
        console.log("Part 2:", i, xMasScore(data));
        printGrid(data);
    }
}


