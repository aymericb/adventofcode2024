use std::collections::HashMap;

struct Node {
    freq: Option<char>,
    anti: bool,
}
struct Grid {
    nodes: Vec<Vec<Node>>,
    width: usize,
    height: usize,
}

fn parse_data(data: &str) -> Grid {
    let nodes: Vec<Vec<Node>> = data
        .lines()
        .filter(|line| !line.is_empty())
        .map(|line| line.chars().map(|c| {
            match c {
                '.' => Node { freq: None, anti: false },
                _ => Node { freq: Some(c), anti: false },
            }
        }).collect())
        .collect();
    let width = nodes[0].len();
    let height = nodes.len();
    Grid { nodes, width, height }
}

#[allow(dead_code)]
fn print_grid(grid: &Grid) {
    for row in &grid.nodes {
        for node in row {
            let c = if node.anti { '#' } else if let Some(freq) = node.freq {
                freq
            } else {
                '.'
            };
            print!("{}", c);
        }
        println!();
    }
}

fn find_frequencies(grid: &Grid) -> HashMap<char, Vec<(usize, usize)>> {
    let mut frequencies = HashMap::new();
    for (i, row) in grid.nodes.iter().enumerate() {
        for (j, node) in row.iter().enumerate() {
            if let Some(freq) = node.freq {
                frequencies.entry(freq).or_insert_with(Vec::new).push((i, j));
            }
        }
    }
    frequencies
}

fn mark_part1(grid: &mut Grid, positions: &Vec<(usize, usize)>) {
    for i in 0..positions.len() {
        for j in i+1..positions.len() {
            let (x1, y1) = positions[i];
            let (x2, y2) = positions[j];

            let (dx1, dy1) = (x1 as i32 - x2 as i32, y1 as i32 - y2 as i32);
            let (dx2, dy2) = (x2 as i32 - x1 as i32, y2 as i32 - y1 as i32);
            let (xa1, ya1) = (x1 as i32 + dx1, y1 as i32 + dy1);
            let (xa2, ya2) = (x2 as i32 + dx2, y2 as i32 + dy2);

            if xa1 >= 0 && xa1 < grid.width as i32 && ya1 >= 0 && ya1 < grid.height as i32 {
                grid.nodes[xa1 as usize][ya1 as usize].anti = true;
            }
            if xa2 >= 0 && xa2 < grid.width as i32 && ya2 >= 0 && ya2 < grid.height as i32 {
                grid.nodes[xa2 as usize][ya2 as usize].anti = true;
            }
        }
    }
}

fn mark_part2(grid: &mut Grid, positions: &Vec<(usize, usize)>) {
    for i in 0..positions.len() {
        for j in i+1..positions.len() {
            let (x1, y1) = positions[i];
            let (x2, y2) = positions[j];
            let (x1, y1) = (x1 as i32, y1 as i32);
            let (x2, y2) = (x2 as i32, y2 as i32);

            let (ox1, oy1) = (x1 - x2, y1 - y2);
            let (ox2, oy2) = (x2 - x1, y2 - y1);
         
            let (mut dx1, mut dy1) = (ox1, oy1);
            let (mut dx2, mut dy2) = (ox2, oy2);

            let mut found = true;
            while found {
                found = false;
                let (xa1, ya1) = (x1 + dx1, y1 + dy1);
                let (xa2, ya2) = (x2 + dx2, y2 + dy2);

                if xa1 >= 0 && xa1 < grid.width as i32 && ya1 >= 0 && ya1 < grid.height as i32 {
                    grid.nodes[xa1 as usize][ya1 as usize].anti = true;
                    found = true;
                }
                if xa2 >= 0 && xa2 < grid.width as i32 && ya2 >= 0 && ya2 < grid.height as i32 {
                    grid.nodes[xa2 as usize][ya2 as usize].anti = true;
                    found = true;
                }

                (dx1, dy1) = (dx1 + ox1, dy1 + oy1);
                (dx2, dy2) = (dx2 + ox2, dy2 + oy2);
            }
        }
    }
}

fn main() {
    // let data = std::fs::read_to_string("sample.txt").unwrap();
    let data = std::fs::read_to_string("input.txt").unwrap();

    let mut grid = parse_data(&data);
    // print_grid(&grid);
    
    let frequencies = find_frequencies(&grid);
    // println!("{:?}", frequencies);

    for (_, positions) in frequencies.clone() {
        mark_part1(&mut grid, &positions);
    }
    
    println!("Part1: {}", grid.nodes.iter().flatten().filter(|n| n.anti).count());

    for (_, positions) in frequencies {
        mark_part2(&mut grid, &positions);
    }    
    println!("Part2: {}", grid.nodes.iter().flatten().filter(|n| n.anti || n.freq.is_some()).count());
}
