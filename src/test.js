function getPrompt(board, current) {
    // 对于一个方向是否可以放置, 比如向右边是 dy = 0, dx = 1 的情况
    function isFeasibleByStep(i, j, dy, dx) {
        if (i === 0 && j === 0 && dx === 1 && dy === 1) {
            console.log('break')
        }
        let isFeasible = false
        let isEnd = false
        while (true) {
            i += dy
            j += dx
            if (0 > i || i > 7 || 0 > j || j > 7 || board[i][j] === 0) {
                break
            } else if (board[i][j] === ((current === 1) ? 2 : 1)) {
                isEnd = true
            } else if (board[i][j] === current && isEnd === false) {
                break
            } else if (board[i][j] === current && isEnd === true) {
                isFeasible = true
                break
            }
        }
        return isFeasible
    }

    // 八个不同的方向是否可行
    function isFeasible(i, j) {
        return isFeasibleByStep(i, j, -1, -1)
            || isFeasibleByStep(i, j, -1, 0)
            || isFeasibleByStep(i, j, -1, 1)
            || isFeasibleByStep(i, j, 0, -1)
            || isFeasibleByStep(i, j, 0, 1)
            || isFeasibleByStep(i, j, 1, -1)
            || isFeasibleByStep(i, j, 1, 0)
            || isFeasibleByStep(i, j, 1, 1)
    }

    const result = []
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j] === 0 && isFeasible(i, j)) {
                result.push([i, j])
            }
        }
    }

    return result
}

function getPromptDict(board, current) {
    // 对于一个方向是否可以放置, 比如向右边是 dy = 0, dx = 1 的情况
    function getFeasibleByStep(i, j, dy, dx) {
        let result = []
        let isEnd = false
        while (true) {
            i += dy
            j += dx
            if (0 > i || i > 7 || 0 > j || j > 7 || board[i][j] === 0) {
                break
            } else if (board[i][j] === ((current === 1) ? 2 : 1)) {
                result.push([i, j])
                isEnd = true
            } else if (board[i][j] === current && isEnd === false) {
                break
            } else if (board[i][j] === current && isEnd === true) {
                return result
            }
        }
        return []
    }

    // 八个不同的方向是否可行
    function getFeasible(i, j) {
        let result = []
        result = result.concat(getFeasibleByStep(i, j, -1, -1))
        result = result.concat(getFeasibleByStep(i, j, -1, 0))
        result = result.concat(getFeasibleByStep(i, j, -1, 1))
        result = result.concat(getFeasibleByStep(i, j, 0, -1))
        result = result.concat(getFeasibleByStep(i, j, 0, 1))
        result = result.concat(getFeasibleByStep(i, j, 1, -1))
        result = result.concat(getFeasibleByStep(i, j, 1, 0))
        result = result.concat(getFeasibleByStep(i, j, 1, -1))
        return result
    }

    const result = { list: [] }
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const list = getFeasible(i, j)
            if (board[i][j] === 0 && list.length > 0) {
                result[[i, j].toString()] = list
                result.list.push([i, j])
            }
        }
    }
    return result
}

console.log(
    getPrompt([[0, 0, 2, 2, 2, 2, 2, 0],
    [2, 1, 1, 1, 1, 2, 0, 0],
    [2, 1, 1, 2, 2, 1, 1, 2],
    [2, 2, 2, 1, 2, 2, 1, 2],
    [2, 2, 2, 2, 1, 1, 2, 2],
    [2, 2, 2, 2, 1, 1, 1, 2],
    [0, 0, 2, 2, 2, 1, 1, 1],
    [0, 0, 2, 2, 2, 2, 2, 2]], 2)
)

console.log('end')