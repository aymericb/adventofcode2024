use std::fs::read_to_string;
use std::collections::HashSet;

#[derive(Clone, Debug)]
struct Robot {
    position: [i32; 2],
    velocity: [i32; 2],
}

#[derive(Debug)]
struct Grid {
    robots: Vec<Robot>,
    width: i32,
    height: i32,
}

fn parse_data(text: &str) -> Vec<Robot> {
    text.lines()
        .filter(|line| !line.is_empty())
        .map(|line| {
            let parts: Vec<i32> = line
                .replace("p=", "")
                .replace(" v=", ",")
                .split(',')
                .map(|n| n.parse().unwrap())
                .collect();
            Robot {
                position: [parts[0], parts[1]],
                velocity: [parts[2], parts[3]],
            }
        })
        .collect()
}

fn load_grid(filename: &str) -> Grid {
    let text = read_to_string(filename).unwrap();
    let robots = parse_data(&text);
    let is_sample = filename == "sample.txt";
    let width = if is_sample { 11 } else { 101 };
    let height = if is_sample { 7 } else { 103 };

    Grid { robots, width, height }
}

fn move_robot(robot: &mut Robot, width: i32, height: i32) {
    robot.position[0] += robot.velocity[0];
    robot.position[1] += robot.velocity[1];
    if robot.position[0] < 0 {
        robot.position[0] += width;
    } else if robot.position[0] >= width {
        robot.position[0] -= width;
    }
    if robot.position[1] < 0 {
        robot.position[1] += height;
    } else if robot.position[1] >= height {
        robot.position[1] -= height;
    }
}

fn move_robots(grid: &mut Grid) {
    for robot in &mut grid.robots {
        move_robot(robot, grid.width, grid.height);
    }
}

fn print_grid(grid: &Grid) {
    for y in 0..grid.height {
        let mut line = String::new();
        for x in 0..grid.width {
            let count = grid.robots.iter()
                .filter(|robot| robot.position[0] == x && robot.position[1] == y)
                .count();
            line.push(if count > 0 { 
                char::from_digit(count as u32, 10).unwrap()
            } else {
                '.'
            });
        }
        println!("{}", line);
    }
}

fn count_robots(grid: &Grid, bounds: [i32; 4]) -> usize {
    let [x, y, w, h] = bounds;
    grid.robots.iter()
        .filter(|robot| {
            robot.position[0] >= x && 
            robot.position[0] < x + w && 
            robot.position[1] >= y && 
            robot.position[1] < y + h
        })
        .count()
}

fn count_robots_no_overlap(grid: &Grid, bounds: [i32; 4]) -> usize {
    let [x, y, w, h] = bounds;
    let robots: Vec<_> = grid.robots.iter()
        .filter(|robot| {
            robot.position[0] >= x && 
            robot.position[0] < x + w && 
            robot.position[1] >= y && 
            robot.position[1] < y + h
        })
        .collect();
    
    let unique_robots: HashSet<_> = robots.iter()
        .map(|robot| (robot.position[0], robot.position[1]))
        .collect();
    
    // if robots.len() != unique_robots.len() {
    //     return 0;
    // }
    unique_robots.len()
}

fn safety_score(grid: &Grid) -> usize {
    let w = grid.width / 2;
    let h = grid.height / 2;
    count_robots(grid, [0, 0, w, h]) *
        count_robots(grid, [w+1, 0, w, h]) *
        count_robots(grid, [0, h+1, w, h]) *
        count_robots(grid, [w+1, h+1, w, h])
}

fn xmas_score(grid: &Grid) -> usize {
    let mut best_score = 0;
    let mut current = 0;
    for y in 0..grid.height {
        let count = count_robots_no_overlap(grid, [0, y, grid.width, 1]);
        if count == 0 || (count != current + 1 && count != current + 2 && count != current + 3) {
            best_score = best_score.max(current);
            current = 0;
        } else {
            current = count;
        }
    }
    best_score
}

fn main() {
    let mut data = load_grid("input.txt");
    
    for _ in 0..100 {
        move_robots(&mut data);
    }

    print_grid(&data);
    println!("Part 1: {}", safety_score(&data));

    println!("Looking for xMas trees");
    let mut i = 100;
    loop {
        move_robots(&mut data);
        i += 1;
        if i % 100000 == 0 {
            println!("{} {}", i, xmas_score(&data));
        }
        if xmas_score(&data) >= 18 {
            println!("Part 2: {} {}", i, xmas_score(&data));
            print_grid(&data);
        }
    }
}
