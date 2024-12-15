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
    Robot = '@',
    BoxLeft = '[',
    BoxRight = ']'
}

enum Move {
    Up = '^',
    Down = 'v',
    Left = '<',
    Right = '>'
}

function parseData2(text: string): [Cell[][], Move[]] {
    const [grid, moves] = parseData(text);
    return [makeGridPart2(grid), moves];
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
                const row = line.split('').map(char => {
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
            console.error(new_box_stuff);
            throw new Error(`Unexpected cell: ${new_box_stuff}`);
    }

    if (should_move) {
        grid[new_box_pos[0]][new_box_pos[1]] = Cell.Box;
        grid[box[0]][box[1]] = Cell.Empty;
    }

    return should_move;
}

// function otherBoxPos(pos: [number, number], side: Cell): [number, number] {
//     switch (side) {
//         case Cell.BoxLeft:
//             return [pos[0], pos[1] - 1];
//         case Cell.BoxRight:
//             return [pos[0], pos[1] + 1];
//         default:
//             throw new Error(`Unknown side: ${side}`);
//     }
// }

function moveBox2(grid: Cell[][], dmove: [number, number], box: [number, number]): boolean {

    const left_box_pos: [number, number] = [box[0] + dmove[0], box[1] + dmove[1]];
    const left_box_stuff = grid[left_box_pos[0]][left_box_pos[1]];
    const right_box_pos: [number, number] = [left_box_pos[0], left_box_pos[1] + 1];
    const right_box_stuff = grid[right_box_pos[0]][right_box_pos[1]];
    // console.log("box dmove", box, dmove, left_box_pos, left_box_stuff, right_box_pos, right_box_stuff);
    
    let should_move = false;
    if (left_box_stuff === Cell.Wall || right_box_stuff === Cell.Wall) {
        return false;
    }
    if (left_box_stuff === Cell.Empty && right_box_stuff === Cell.Empty) {
        should_move = true;
    } else if (dmove[0] === 0) {
        if (dmove[1] === 1) { // move right
            // console.log("right", right_box_pos, right_box_stuff);
            switch (right_box_stuff) {
                case Cell.BoxLeft:
                    should_move = moveBox2(grid, dmove, right_box_pos);
                    break;
                case Cell.Empty:
                    should_move = true;
                    break;
                default:
                    throw new Error(`Unexpected cell (move right): ${right_box_stuff}`);
            }            
        } else { // move left
            switch (left_box_stuff) {
                case Cell.BoxRight:
                    should_move = moveBox2(grid, dmove, [left_box_pos[0], left_box_pos[1] - 1]);
                    break;
                case Cell.Empty:
                    should_move = true;
                    break;
                default:
                    throw new Error(`Unexpected cell (move left): ${left_box_stuff}`);
            }
            // console.log("left", left_box_pos, left_box_stuff, should_move);

        }
    } else {        
        // console.log("up and down");
        let checks: [number, number][] = [];
        if (left_box_stuff === Cell.BoxLeft) {
            // console.log("left_box_stuff_left");
            checks.push(left_box_pos);
        } else if (left_box_stuff === Cell.BoxRight) {
            // console.log("left_box_stuff_right");
            checks.push([left_box_pos[0], left_box_pos[1] - 1]);
        }
        if (right_box_stuff === Cell.BoxLeft) {
            // console.log("right_box_stuff_left");
            checks.push(right_box_pos);
        } else if (right_box_stuff === Cell.BoxRight) {
            // console.log("right_box_stuff_right");
            checks.push([right_box_pos[0], right_box_pos[1] - 1]);
        }
        // Remove any duplicate check positions
        checks = checks.filter((check, index) => {
            return checks.findIndex(c => c[0] === check[0] && c[1] === check[1]) === index;
        });

        should_move = true;
        for (const check of checks) {
            should_move = should_move && moveBox2(grid, dmove, check);
        }
    }


    if (should_move) {
        // printGrid(grid);
        grid[box[0]][box[1]] = Cell.Empty;
        grid[box[0]][box[1]+1] = Cell.Empty;
        grid[left_box_pos[0]][left_box_pos[1]] = Cell.BoxLeft;
        grid[right_box_pos[0]][right_box_pos[1]] = Cell.BoxRight;
        // console.log("moved");
        // printGrid(grid);
    }

    return should_move;    
}


function moveRobot(grid: Cell[][], move: Move, robot: [number, number]): [number, number] {
    const dmove = getMove(move);    
    const new_robot_pos: [number, number] = [robot[0] + dmove[0], robot[1] + dmove[1]];
    const new_robot_stuff = grid[new_robot_pos[0]][new_robot_pos[1]];

    // console.log("new_robot", new_robot_pos, new_robot_stuff, move);
    let should_move = false;
    switch (new_robot_stuff) {
        case Cell.Wall:
            should_move = false;
            break;
        case Cell.Box:
            should_move = moveBox(grid, dmove, new_robot_pos);
            break;
        case Cell.BoxLeft:
            should_move = moveBox2(grid, dmove, new_robot_pos);
            break;
        case Cell.BoxRight:
            should_move = moveBox2(grid, dmove, [new_robot_pos[0], new_robot_pos[1] - 1]);
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
            if (grid[i][j] === Cell.Box || grid[i][j] === Cell.BoxLeft) {
                sum += i * 100 + j;
            }
        }
    }
    return sum;
}

function makeGridPart2(grid: Cell[][]): Cell[][] {
    const new_grid: Cell[][] = [];
    for (const row of grid) {
        const row_str = row.join('')
            .replaceAll("#", "##")
            .replaceAll("O", "[]")
            .replaceAll(".", "..")
            .replaceAll("@", "@.");
        const new_row = row_str.split('').map(char => {
                switch (char) {
                    case Cell.Wall:
                        return Cell.Wall;
                    case Cell.Empty:
                        return Cell.Empty;
                    case Cell.BoxLeft:
                        return Cell.BoxLeft;
                    case Cell.BoxRight:
                        return Cell.BoxRight;
                    case Cell.Robot:
                        return Cell.Robot;
                    default:
                        throw new Error(`Unknown character: ${char}`);
                }
            });
        new_grid.push(new_row);
    }

    return new_grid;
}

function printGrid(grid: Cell[][], move?: Move) {
    const moveStr = move ? move : "@";
    for (const row of grid) {
        console.log(row.join('').replace("@", moveStr));
    }
}

// const text = await Deno.readTextFile("sample.txt");
// const text = await Deno.readTextFile("input.txt");
const text = await Deno.readTextFile("test.txt");
const [grid, moves] = parseData(text);

// console.log(grid);
// console.log(moves);

let robot = findRobot(grid);
for (const move of moves) {
    robot = moveRobot(grid, move, robot);
}
console.log("Part 1:", gps(grid));

const [grid2, moves2] = parseData2(text);
robot = findRobot(grid2);
let i = 0;
for (const move of moves2) {
    // if (move === Move.Left && grid2[robot[0]][robot[1]-1] === Cell.BoxRight) {
    //     printGrid(grid2);
    //     console.log(move);
    // }
    printGrid(grid2, move);
    // console.log(i++, move);
    robot = moveRobot(grid2, move, robot);

    // if (move === Move.Left && grid2[robot[0]][robot[1]-1] === Cell.BoxRight) {
    //     printGrid(grid2);
    //     // break;
    // }
    // // i++;
    // // if (i > 20) {
    // //     break;
    // // }

    // wait for any key press
    // if (i > 20) {
        const buf = new Uint8Array(1);
        await Deno.stdin.read(buf);
    // }
    // printGrid(grid2);

}
printGrid(grid2);
console.log("Part 2:", gps(grid2));
