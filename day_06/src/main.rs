#[derive(Clone, Copy, PartialEq)]
enum Direction {
    N,
    E,
    S,
    W,
}

#[derive(Clone, Copy)]
struct Node {
    obstacle: bool,
    direction: Option<Direction>,
}

#[derive(Clone)]
struct Grid {
    nodes: Vec<Vec<Node>>,
    width: usize,
    height: usize,
}

#[derive(Clone, Copy)]
struct Guard {
    row: usize,
    col: usize,
    direction: Direction,
}

fn parse_data(data: &str) -> (Grid, Guard) {
    let lines = data.lines().collect::<Vec<&str>>();
    let grid: Vec<Vec<Node>>  = lines.iter().map(|line| 
        line.chars().map(|c| {
            match c {
                '#' => Node { obstacle: true, direction: None },
                '^' => Node { obstacle: false, direction: Some(Direction::N) },
                '>' => Node { obstacle: false, direction: Some(Direction::E) },
                'v' => Node { obstacle: false, direction: Some(Direction::S) },
                '<' => Node { obstacle: false, direction: Some(Direction::W) },
                _ => Node { obstacle: false, direction: None }
            }            
        }).collect()
    ).collect();

    let mut guard: Option<Guard> = None;
    for (i, row) in grid.iter().enumerate() {
        for (j, node) in row.iter().enumerate() {
            if node.direction.is_some() {
                guard = Some(Guard { row: i, col: j, direction: node.direction.unwrap() });
                break;
            }
        }
    }

    let width = grid[0].len();  
    let height = grid.len();
    (Grid { nodes: grid, width, height }, guard.unwrap())
}

#[allow(dead_code)]
fn print_grid(grid: &Grid) {
    for row in &grid.nodes {
        for node in row {
            let c = if node.obstacle { 
                match node.direction {
                    Some(_) => 'O',
                    None => '#',
                }                
            } else { 
                match node.direction {
                    Some(_) => 'X',
                    None => '.',
                }
            };
            print!("{}", c);
        }
        println!();
    }
}

#[derive(PartialEq)]
enum ExitResult {
    Progress,
    Exit,
    InfiniteLoop,
}

fn move_guard(guard: &mut Guard, grid: &mut Grid) -> ExitResult {
    let original_guard = *guard;
    match guard.direction {
        Direction::N => {
            if guard.row == 0 { return ExitResult::Exit; }
            guard.row -= 1
        }
        Direction::E => {
            if guard.col == grid.width - 1 { return ExitResult::Exit; }
            guard.col += 1
        },
        Direction::S => {
            if guard.row == grid.height - 1 { return ExitResult::Exit; }    
            guard.row += 1
        },
        Direction::W => {
            if guard.col == 0 { return ExitResult::Exit; }    
            guard.col -= 1
        },
    }

    let node = &mut grid.nodes[guard.row][guard.col];
    if node.direction.is_some() && node.direction == Some(guard.direction) {
        return ExitResult::InfiniteLoop;
    }
    
    let direction = guard.direction;
    if node.obstacle {
        *guard = original_guard;
        guard.direction = match guard.direction {
            Direction::N => Direction::E,
            Direction::E => Direction::S,
            Direction::S => Direction::W,
            Direction::W => Direction::N,
        };
        return move_guard(guard, grid);
    }

    node.direction = Some(direction);
    ExitResult::Progress
}

fn part1(guard: &Guard, grid: &Grid) -> usize {
    let mut grid = grid.clone();
    let mut guard = guard.clone();
    while move_guard(&mut guard, &mut grid) == ExitResult::Progress {}
    grid.nodes.iter().map(|row| row.iter().filter(|n| n.direction.is_some()).count()).sum::<usize>()
}

// Very slow, but it works
fn part2(guard: &Guard, grid: &Grid) -> usize {
    let mut count = 0;
    for row in 0..grid.height {
        for col in 0..grid.width {
            if row == guard.row && col == guard.col { continue; }
            let mut grid = grid.clone();
            grid.nodes[row][col].obstacle = true;
            let mut guard = guard.clone();
            let mut status = ExitResult::Progress;
            while status == ExitResult::Progress {
                status = move_guard(&mut guard, &mut grid);
            }
            if status == ExitResult::InfiniteLoop {
                count += 1;
            }
        }
    }
    count
}

fn main() {
    let data = std::fs::read_to_string("input.txt").unwrap();
    // let data = std::fs::read_to_string("sample.txt").unwrap();
    
    let (grid, guard) = parse_data(&data);
    println!("Part 1: {}", part1(&guard, &grid));
    println!("Part 2: {}", part2(&guard, &grid));
}
