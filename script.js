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

// ===============================
// ANIMATION
// ===============================
function animate(result) {
    isRunning = true;
    let i = 0;
    const speed = parseInt(speedSlider.value);
 
    function step() {
        if (i < result.steps.length) {
            const s = result.steps[i];
            const div = document.getElementById(`cell-${s.r}-${s.c}`);
 
            if (div && maze[s.r][s.c] !== 'S' && maze[s.r][s.c] !== 'E') {
                div.className = 'cell ' + (s.action === 'visit' ? 'visited' : 'backtrack');
            }
 
            i++;
            animationTimer = setTimeout(step, speed);
        } else {
            finish(result);
        }
    }
 
    step();
}
 
function finish(result) {
    result.path.forEach(p => {
        const div = document.getElementById(`cell-${p.r}-${p.c}`);
        if (div && maze[p.r][p.c] !== 'S' && maze[p.r][p.c] !== 'E') {
            div.className = 'cell solution';
        }
    });
 
    resultEl.innerHTML = result.solved
        ? `<div class="result-card success"><div class="result-icon">✓</div>Maze solved in ${result.path.length} steps!</div>`
        : `<div class="result-card failure"><div class="result-icon">✗</div>Maze not solvable!</div>`;
 
    isRunning = false;
}
 
 
// ===============================
// BUTTON HANDLERS
// ===============================
generateBtn.onclick = () => !isRunning && generateMaze();
solveBtn.onclick = () => !isRunning && animate(solveMaze());
instantBtn.onclick = () => !isRunning && finish(solveMaze());
resetBtn.onclick = () => {
    if (animationTimer) clearTimeout(animationTimer);
    drawMaze();
    resultEl.innerHTML = '';
    isRunning = false;
};
 
 
// ===============================
// SETTINGS MENU
// ===============================
settingsBtn.onclick = () => {
    settingsMenu.classList.toggle('hidden');
};
 
 
// ===============================
// LANGUAGE SYSTEM
// ===============================
const translations = {
    en: {
        generate: "New Maze",
        solve: "Solve",
        instant: "Instant",
        reset: "Reset",
        speed: "Animation Speed:",
        fast: "Fast",
        slow: "Slow",
        subtitle: "Maze Solver"
    },
    bg: {
        generate: "Нов лабиринт",
        solve: "Реши",
        instant: "Мигновено",
        reset: "Нулирай",
        speed: "Скорост на анимацията:",
        fast: "Бързо",
        slow: "Бавно",
        subtitle: "Решаване на лабиринт"
    }
};
 
function applyLanguage(lang) {
    const t = translations[lang];
 
    generateBtn.textContent = t.generate;
    solveBtn.textContent = t.solve;
    instantBtn.textContent = t.instant;
    resetBtn.textContent = t.reset;
 
    document.querySelector('.speed-box label').textContent = t.speed;
    document.querySelector('.slider-row span:first-child').textContent = t.fast;
    document.querySelector('.slider-row span:last-child').textContent = t.slow;
 
    document.querySelector('.subtitle').textContent = t.subtitle;
}
 
languageSelect.onchange = () => {
    applyLanguage(languageSelect.value);
};
 
 
// ===============================
// THEME SYSTEM
// ===============================
themeSelect.onchange = () => {
    if (themeSelect.value === "light") {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }
};
 
 
// ===============================
// INITIALIZE
// ===============================
generateMaze();
applyLanguage("en");
themeSelect.value = "dark";
