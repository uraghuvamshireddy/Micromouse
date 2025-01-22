let gridSize = 10;
let startCell = null;
let endCell = null;
let walls = [];

document.getElementById("generateGrid").addEventListener("click", generateGrid);
document.getElementById("findPath").addEventListener("click", findShortestPath);
document.getElementById("gridSize").addEventListener("change", () => {
    gridSize = parseInt(document.getElementById("gridSize").value);
    generateGrid();
});

function generateGrid() {
    const gridContainer = document.getElementById("grid");
    gridContainer.innerHTML = "";

    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 30px)`;
    gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 30px)`;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            const numberLabel = document.createElement("span");
            numberLabel.classList.add("cell-number");
            numberLabel.textContent = ''; // Empty text initially
            cell.appendChild(numberLabel);
            gridContainer.appendChild(cell);

            cell.addEventListener("click", () => handleCellClick(cell, row, col));
        }
    }

    walls = [];
    startCell = null;
    endCell = null;
}

function handleCellClick(cell, row, col) {
    if (startCell && cell === startCell) {
        cell.classList.remove("start");
        startCell = null;
    } else if (endCell && cell === endCell) {
        cell.classList.remove("end");
        endCell = null;
    } else if (cell.classList.contains("wall")) {
        cell.classList.remove("wall");
        walls = walls.filter(w => w.row !== row || w.col !== col);
    } else {
        if (!startCell) {
            cell.classList.add("start");
            startCell = cell;
        } else if (!endCell) {
            cell.classList.add("end");
            endCell = cell;
        } else {
            cell.classList.add("wall");
            walls.push({ row, col });
        }
    }
}

function findShortestPath() {
    if (!startCell || !endCell) return;

    const start = { row: parseInt(startCell.dataset.row), col: parseInt(startCell.dataset.col) };
    const end = { row: parseInt(endCell.dataset.row), col: parseInt(endCell.dataset.col) };

    const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
    const parent = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    const distances = Array.from({ length: gridSize }, () => Array(gridSize).fill(Infinity));

    const queue = [start];
    visited[start.row][start.col] = true;
    distances[start.row][start.col] = 0;

    const directions = [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 },
    ];
    while (queue.length > 0) {
        const current = queue.shift();
        for (let dir of directions) {
            const nextRow = current.row + dir.row;
            const nextCol = current.col + dir.col;

            if (nextRow >= 0 && nextRow < gridSize && nextCol >= 0 && nextCol < gridSize &&
                !visited[nextRow][nextCol] && !isWall(nextRow, nextCol)) {

                visited[nextRow][nextCol] = true;
                distances[nextRow][nextCol] = distances[current.row][current.col] + 1;
                parent[nextRow][nextCol] = current;
                queue.push({ row: nextRow, col: nextCol });
            }
        }
    }

    updateGridWithDistances(distances);  
    let path = [];
    let current = end;
    while (current) {
        path.push(current);
        current = parent[current.row][current.col];
    }

    path.reverse();

    animatePath(path);
}

function isWall(row, col) {
    return walls.some(wall => wall.row === row && wall.col === col);
}

function updateGridWithDistances(distances) {
    const gridCells = document.querySelectorAll('.cell');
    gridCells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        const numberLabel = cell.querySelector('.cell-number');
        const distance = distances[row][col];

        if (distance === Infinity) {
            numberLabel.textContent = ''; 
        } else {
            numberLabel.textContent = distance; 
        }

        if (cell.classList.contains('start')) {
            numberLabel.textContent = 'S'; 
        }

        if (cell.classList.contains('end')) {
            numberLabel.textContent = 'E';
        }
    });
}

function animatePath(path) {
    let index = 0;
    const interval = setInterval(() => {
        const cell = document.querySelector(`[data-row="${path[index].row}"][data-col="${path[index].col}"]`);
        cell.classList.add("visited");
        index++;

        if (index >= path.length) {
            clearInterval(interval);
        }
    }, 200);
}
