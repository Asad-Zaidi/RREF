document.getElementById('equation-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const equationsInput = document.getElementById('equations-input').value;
    const { matrix, variables } = parseEquations(equationsInput);
    const formattedMatrix = convertToMatrix(matrix, variables);
    const rrefMatrix = calculateRREF(formattedMatrix);
    const solution = getSolution(rrefMatrix, variables);

    displayOutput(rrefMatrix, solution, variables);
});

function parseEquations(input) {
    const equations = input.split('\n').map(equation => equation.replace(/\s+/g, ''));
    const variables = [];
    const matrix = [];

    equations.forEach(eq => {
        const sides = eq.split('=');
        const lhs = sides[0];
        const rhs = parseFloat(sides[1]);

        const row = new Array(variables.length).fill(0);
        lhs.replace(/([+-]?[^-+]+)/g, term => {
            const match = term.match(/([+-]?[0-9]*\.?[0-9]+)?([a-z]+)/i);
            if (match) {
                const coeff = match[1] ? parseFloat(match[1]) : (term[0] === '-' ? -1 : 1);
                const variable = match[2];
                if (!variables.includes(variable)) {
                    variables.push(variable);
                    row.push(0); // Ensure the row length matches the number of variables
                }
                row[variables.indexOf(variable)] = coeff;
            }
        });
        row.push(rhs);
        matrix.push(row);
    });

    return { matrix, variables };
}

function convertToMatrix(matrix, variables) {
    return matrix.map(row => {
        for (let i = 0; i <= variables.length; i++) {
            if (typeof row[i] === 'undefined') {
                row[i] = 0;
            }
        }
        return row;
    });
}

function calculateRREF(matrix) {
    const rowCount = matrix.length;
    const colCount = matrix[0].length;

    let lead = 0;
    for (let r = 0; r < rowCount; r++) {
        if (colCount <= lead) {
            return matrix;
        }
        let i = r;
        while (matrix[i][lead] === 0) {
            i++;
            if (rowCount === i) {
                i = r;
                lead++;
                if (colCount === lead) {
                    return matrix;
                }
            }
        }
        [matrix[i], matrix[r]] = [matrix[r], matrix[i]];
        const lv = matrix[r][lead];
        matrix[r] = matrix[r].map(x => x / lv);
        for (let i = 0; i < rowCount; i++) {
            if (i !== r) {
                const lv = matrix[i][lead];
                matrix[i] = matrix[i].map((x, j) => x - lv * matrix[r][j]);
            }
        }
        lead++;
    }
    return matrix.map(row => row.map(value => Math.round(value * 1000) / 1000)); // to round to 3 decimal places
}

function getSolution(matrix, variables) {
    const rowCount = matrix.length;
    const colCount = matrix[0].length - 1;
    const solution = {};

    for (let r = 0; r < rowCount; r++) {
        let leadingOneCol = matrix[r].findIndex(val => val === 1);
        if (leadingOneCol >= 0 && leadingOneCol < colCount) {
            solution[variables[leadingOneCol]] = matrix[r][colCount];
        }
    }

    return solution;
}

function displayOutput(matrix, solution, variables) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';

    const matrixDiv = document.createElement('div');
    const formattedMatrix = matrix.map(row => {
        const lastValue = row.pop();
        return row.join(' ') + ' | ' + lastValue;
    }).join('\n');
    matrixDiv.innerHTML = '<h2>RREF Matrix:</h2><pre>' + formattedMatrix + '</pre>';
    outputDiv.appendChild(matrixDiv);

    const solutionDiv = document.createElement('div');
    solutionDiv.innerHTML = '<h2>Solution:</h2><pre>' + JSON.stringify(solution, null, 2) + '</pre>';
    outputDiv.appendChild(solutionDiv);
}