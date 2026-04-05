const mazeEl = document.getElementById('maze');
const resultEl = document.getElementById('result');
const generateBtn = document.getElementById('generateBtn');
const solveBtn = document.getElementById('solveBtn');
const instantBtn = document.getElementById('instantBtn');
const resetBtn = document.getElementById('resetBtn');
const speedSlider = document.getElementById('speedSlider');

// Settings elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const languageSelect = document.getElementById('languageSelect');
const themeSelect = document.getElementById('themeSelect');

let maze = [];
let isRunning = false;
let animationTimer = null;


// ===============================
// MAZE GENERATION
// ===============================

function generateMaze() {
    const sizes = [9, 11, 13, 15, 17];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    maze = Array.from({ length: size }, () => Array(size).fill('1'));

    carve(1, 1);

    maze[1][1] = 'S';
    maze[size - 2][size - 2] = 'E';

    // 30% chance to block the exit
    if (Math.random() < 0.3) {
        maze[size - 3][size - 2] = '1';
        maze[size - 2][size - 3] = '1';
    }

    drawMaze();
    resultEl.innerHTML = '';
}

// DFS carving
function carve(r, c) {
    maze[r][c] = '0';
    const directions = [[-2, 0], [2, 0], [0, -2], [0, 2]].sort(() => Math.random() - 0.5);

    for (const [dr, dc] of directions) {
        const nr = r + dr, nc = c + dc;
        if (
            nr > 0 && nr < maze.length - 1 &&
            nc > 0 && nc < maze[0].length - 1 &&
            maze[nr][nc] === '1'
        ) {
            maze[r + dr / 2][c + dc / 2] = '0';
            carve(nr, nc);
        }
    }
}


// ===============================
// DRAW MAZE
// ===============================
function drawMaze() {
    mazeEl.style.gridTemplateColumns = `repeat(${maze[0].length}, 28px)`;
    mazeEl.innerHTML = '';

    maze.forEach((row, r) => {
        row.forEach((cell, c) => {
            const div = document.createElement('div');
            div.id = `cell-${r}-${c}`;
            div.className =
                'cell ' +
                (cell === '1'
                    ? 'wall'
                    : cell === 'S'
                    ? 'start'
                    : cell === 'E'
                    ? 'end'
                    : 'path');

            div.textContent = cell === 'S' ? '▶' : cell === 'E' ? '★' : '';
            mazeEl.appendChild(div);
        });
    });
}


// ===============================
// SOLVER (DFS)
// ===============================
function solveMaze() {
    const start = findCell('S');
    const end = findCell('E');

    const visited = {};
    const path = [];
    const steps = [];

    function dfs(r, c) {
        if (r === end.row && c === end.col) {
            path.push({ r, c });
            return true;
        }

        const key = r + ',' + c;
        visited[key] = true;

        path.push({ r, c });
        steps.push({ r, c, action: 'visit' });

        for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
            const nr = r + dr, nc = c + dc;

            if (
                nr >= 0 && nr < maze.length &&
                nc >= 0 && nc < maze[0].length &&
                maze[nr][nc] !== '1' &&
                !visited[nr + ',' + nc]
            ) {
                if (dfs(nr, nc)) return true;
            }
        }

        path.pop();
        steps.push({ r, c, action: 'backtrack' });
        return false;
    }

    const solved = dfs(start.row, start.col);
    return { solved, path, steps };
}

function findCell(val) {
    for (let r = 0; r < maze.length; r++)
        for (let c = 0; c < maze[r].length; c++)
            if (maze[r][c] === val) return { row: r, col: c };
}
