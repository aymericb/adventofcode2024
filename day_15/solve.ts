function measure<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`Time taken for ${label}:`, end - start, "milliseconds");
    return result;
}

enum Cell {
    Wall = '#',
    Empty = '.',
    Box = 'O',
    Robot = '@'
}

enum Move {
    Up = '^',
    Down = 'v',
    Left = '<',
    Right = '>'
}


function parseData(text: string): [Cell[][], Move[]] {
    const lines = text.split("\n");
    const grid: Cell[][] = [];
    const moves: Move[] = [];

    let in_grid = true;
    for (const line of lines) {
        if (in_grid) {
            if (line.trim().length === 0) {
                in_grid = false;
            } else {
                const row =line.split('').map(char => {
                    switch (char) {
                        case Cell.Wall:
                        return Cell.Wall;
                    case Cell.Empty:
                        return Cell.Empty;
                    case Cell.Box:
                        return Cell.Box;
                    case Cell.Robot:
                        return Cell.Robot;
                    default:
                        throw new Error(`Unknown character: ${char}`);
                    }
                });
                grid.push(row);
            }
        } else {
            const new_moves = line.split('').map(char => {
                switch (char) {
                    case Move.Up:
                        return Move.Up;
                    case Move.Down:
                        return Move.Down;
                    case Move.Left:
                        return Move.Left;
                    case Move.Right:
                        return Move.Right;
                    default:
                        throw new Error(`Unknown character: ${char}`);
                }
            });
            moves.push(...new_moves);
        }
    }

    return [grid, moves];
}

function getMove(move: Move): [number, number] {
    switch (move) {
        case Move.Up:
            return [-1, 0];
        case Move.Down:
            return [1, 0];
        case Move.Left:
            return [0, -1];
        case Move.Right:
            return [0, 1];
        default:
            throw new Error(`Unknown move: ${move}`);
    }
}

function moveBox(grid: Cell[][], dmove: [number, number], box: [number, number]): boolean {
    const new_box_pos: [number, number] = [box[0] + dmove[0], box[1] + dmove[1]];
    const new_box_stuff = grid[new_box_pos[0]][new_box_pos[1]];

    let should_move = false;
    switch (new_box_stuff) {
        case Cell.Wall:
            return false;
        case Cell.Box:
            should_move = moveBox(grid, dmove, new_box_pos);
            break;
        case Cell.Empty:
            should_move = true;
            break;
        default:
            throw new Error(`Unexpected cell: ${new_box_stuff}`);
    }

    if (should_move) {
        grid[new_box_pos[0]][new_box_pos[1]] = Cell.Box;
        grid[box[0]][box[1]] = Cell.Empty;
    }

    return should_move;
}

function moveRobot(grid: Cell[][], move: Move, robot: [number, number]): [number, number] {
    const dmove = getMove(move);    
    const new_robot_pos: [number, number] = [robot[0] + dmove[0], robot[1] + dmove[1]];
    const new_robot_stuff = grid[new_robot_pos[0]][new_robot_pos[1]];

    let should_move = false;
    switch (new_robot_stuff) {
        case Cell.Wall:
            should_move = false;
            break;
        case Cell.Box:
            should_move = moveBox(grid, dmove, new_robot_pos);
            break;
        case Cell.Empty:
            should_move = true;
            break;
    }

    if (should_move) {
        grid[new_robot_pos[0]][new_robot_pos[1]] = Cell.Robot;
        grid[robot[0]][robot[1]] = Cell.Empty;
    }
    return should_move ? new_robot_pos : robot;
}

function findRobot(grid: Cell[][]): [number, number] {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === Cell.Robot) {
                return [i, j];
            }
        }
    }
    throw new Error("Robot not found");
}

function gps(grid: Cell[][]): number {
    let sum = 0;
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === Cell.Box) {
                sum += i * 100 + j;
            }
        }
    }
    return sum;
}

// const text = await Deno.readTextFile("sample.txt");
const text = await Deno.readTextFile("input.txt");
const [grid, moves] = parseData(text);


console.log(grid);
console.log(moves);

let robot = findRobot(grid);
for (const move of moves) {
    robot = moveRobot(grid, move, robot);
}
console.log("Part 1:", gps(grid));


