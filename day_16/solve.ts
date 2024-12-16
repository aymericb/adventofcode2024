function measure<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`Time taken for ${label}:`, end - start, "milliseconds");
    return result;
}

// const text = await Deno.readTextFile("sample.txt");
const text = await Deno.readTextFile("input.txt");

enum Cell {
    Wall = '#',
    Empty = '.',
    Exit = 'E',
    Start = 'S'
}

enum Direction {
    Up = '^',
    Down = 'v',
    Left = '<',
    Right = '>'
}

enum Action {
    Advance = 'A',
    RotateRight = 'R',
    RotateLeft = 'L'
}

type Deer = {
    position: [number, number];
    direction: Direction;
}

type Maze = {
    width: number;
    height: number;
    grid: Cell[][];
    deer: Deer;
    exit: [number, number];
}


function parseData(text: string): Maze {
    const lines = text.split("\n").filter(line => line.trim().length > 0);

    const cells = lines.map(line => line.split('').map(char => {
        switch (char) {
            case Cell.Wall:
                return Cell.Wall;
            case Cell.Empty:
                return Cell.Empty;
            case Cell.Exit:
                return Cell.Exit;
            case Cell.Start:
                return Cell.Start;
            default:
                throw new Error(`Unknown character: ${char}`);
        }
    }));

    const height = cells.length;
    const width = cells[0].length;
    let exit: [number, number] = [0, 0];
    let deer: [number, number] = [0, 0];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (cells[y][x] === Cell.Exit) {
                exit = [y, x];
            }
            if (cells[y][x] === Cell.Start) {
                deer = [y, x];
            }
        }
    }

    return {
        width,
        height,
        grid: cells,
        deer: {
            position: deer,
            direction: Direction.Right
        },
        exit
    };

}

const maze = parseData(text);

// console.log(maze);

function computeKey(maze: Maze, [row, col]: [number, number]): number {
    return maze.width * row + col;
}

const direction_count = Object.keys(Direction).length;
function computeKeyWithDirection(maze: Maze, [row, col]: [number, number], direction: Direction): number {
    const dir = Object.values(Direction).indexOf(direction);
    return maze.width * row * direction_count + col * direction_count + dir;
}



function advance(maze: Maze, deer: Deer): Deer | null {
    // console.log("Advancing", deer);
    let new_position: [number, number];

    switch (deer.direction) {
        case Direction.Up:
            new_position = [deer.position[0] - 1, deer.position[1]];
            break;
        case Direction.Down:
            new_position = [deer.position[0] + 1, deer.position[1]];
            break;
        case Direction.Left:
            new_position = [deer.position[0], deer.position[1] - 1];
            break;
        case Direction.Right:
            new_position = [deer.position[0], deer.position[1] + 1];
            break;
        default:
            throw new Error(`Unknown direction: ${deer.direction}`);
    }

    if (new_position[0] < 0 || new_position[0] >= maze.height || new_position[1] < 0 || new_position[1] >= maze.width) {
        // console.log("Out of bounds", new_position);
        return null;
    }

    if (maze.grid[new_position[0]][new_position[1]] === Cell.Wall) {
        // console.log("Hit wall", new_position);
        return null;
    }

    return {
        position: new_position,
        direction: deer.direction
    };
}

function rotateRight(deer: Deer): Deer {
    // console.log("Rotating right", deer);
    switch (deer.direction) {
        case Direction.Up:
            return { ...deer, direction: Direction.Right };
        case Direction.Right:
            return { ...deer, direction: Direction.Down };
        case Direction.Down:
            return { ...deer, direction: Direction.Left };
        case Direction.Left:
            return { ...deer, direction: Direction.Up };
    }
}

function rotateLeft(deer: Deer): Deer {
    // console.log("Rotating left", deer);
    switch (deer.direction) {
        case Direction.Up:
            return { ...deer, direction: Direction.Left };
        case Direction.Right:
            return { ...deer, direction: Direction.Up };
        case Direction.Down:
            return { ...deer, direction: Direction.Right };
        case Direction.Left:
            return { ...deer, direction: Direction.Down };
    }
}

let move_count = 0;


function visitInternal(maze: Maze, deer: Deer | null, actions: Action[], visited: Map<number, number>, newActions: Action[]): Action[][] | null {

    move_count++;
    if (move_count % 100000 === 0) {
        console.log("Move count", move_count);
    }

    if (deer === null) {
        return null;
    }

    const key = computeKey(maze, deer.position);
    actions = [...actions, ...newActions];

    const points = computePoints(actions);
    const visited_points = visited.get(key);

    if (visited_points !== undefined && visited_points + 1000 < points) {
        // console.log("Already visited", key);
        return null;
    }


    visited.set(key, points);
    return visit(maze, deer, actions, visited);
}

function computePoints(actions: Action[]): number {
    return actions.reduce((sum, action) => sum + (action === Action.Advance ? 1 : 1000), 0);
}

let best = Number.MAX_SAFE_INTEGER;
function visit(maze: Maze, deer: Deer, actions: Action[], visited: Map<number, number>): Action[][] | null {

    const points = computePoints(actions);

    if (deer.position[0] === maze.exit[0] && deer.position[1] === maze.exit[1]) {
        // console.log("Found exit", actions);
        if (points < best) {
            best = points;
            console.log("New best", best);
        }
        return [actions];
    }

    if (points > best) {
        return null; // no point continuing
    }

    const moves = [
        visitInternal(maze, advance(maze, deer), actions, visited, [Action.Advance]),
        visitInternal(maze, advance(maze, rotateRight(deer)), actions, visited, [Action.RotateRight, Action.Advance]),
        visitInternal(maze, advance(maze, rotateLeft(deer)), actions, visited, [Action.RotateLeft, Action.Advance])
    ].filter((move) => move !== null);



    if (moves.length === 0) {
        return null;
    }

    const flat_moves = moves.flat();
    if (flat_moves.length === 0) {
        return null;
    }

    const smallest = flat_moves.reduce((best, move) => 
        computePoints(best) < computePoints(move) ? best : move, 
        flat_moves[0]
    );
    const smallest_points = computePoints(smallest);
    const paths = flat_moves.filter(move => computePoints(move) === smallest_points);

    return paths;
}

function mark(maze: Maze, deer: Deer, actions: Action[], visited: Set<number>) {
    if (actions.length === 0) {
        return;
    }

    const action = actions.shift();

    switch (action) {
        case Action.Advance:
            deer = advance(maze, deer)!;
            break;
        case Action.RotateRight:
            deer = rotateRight(deer);
            break;
        case Action.RotateLeft:
            deer = rotateLeft(deer);
            break;
    }

    visited.add(computeKey(maze, deer.position));
    mark(maze, deer, actions, visited);
}



function printMaze(maze: Maze, visited: Set<number>) {
    for (let y = 0; y < maze.height; y++) {
        let line = "";
        for (let x = 0; x < maze.width; x++) {
            const key = computeKey(maze, [y, x]);
            if (visited.has(key)) {
                line += "O"
            } else {
                line += maze.grid[y][x];
            }
        }
        console.log(line);
    }
}

const cache = new Map<number, number>();
const found = visit(maze, maze.deer, [], cache);
// console.log(found);
if (found) {
    const score = computePoints(found[0]);
    console.log("Part 1 score", score);

    const visited = new Set<number>();
    for (const paths of found) {
        mark(maze, maze.deer, [...paths], visited);
    }
    visited.add(computeKey(maze, maze.deer.position));
    printMaze(maze, visited);
    console.log("Part 2 score", visited.size);
}
