export function isIn(piece: number[], pieces: number[][]) {
    let result = false
    for (let i = 0; i < pieces.length; i++) {
        if (piece[0] === pieces[i][0] && piece[1] === pieces[i][1]) {
            result = true
            break
        }
    }
    return result
}

export function getPrompt(board: number[][], current: number): number[][] {
    // 对于一个方向是否可以放置, 比如向右边是 dy = 0, dx = 1 的情况
    function isFeasibleByStep(i: number, j: number, dy: number, dx: number) {
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
    function isFeasible(i: number, j: number) {
        return isFeasibleByStep(i, j, -1, -1)
            || isFeasibleByStep(i, j, -1, 0)
            || isFeasibleByStep(i, j, -1, 1)
            || isFeasibleByStep(i, j, 0, -1)
            || isFeasibleByStep(i, j, 0, 1)
            || isFeasibleByStep(i, j, 1, -1)
            || isFeasibleByStep(i, j, 1, 0)
            || isFeasibleByStep(i, j, 1, -1)
    }

    const result = [] as number[][]
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j] === 0 && isFeasible(i, j)) {
                result.push([i, j])
            }
        }
    }

    return result
}

export interface PromptDict {
    [piece: string]: number[][]
}

export function getPromptDict(board: number[][], current: number) {
    // 对于一个方向是否可以放置, 比如向右边是 dy = 0, dx = 1 的情况
    function getFeasibleByStep(i: number, j: number, dy: number, dx: number) {
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
    function getFeasible(i: number, j: number) {
        let result = [] as number[][]
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

    const result = {list: []} as PromptDict
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

