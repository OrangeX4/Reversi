import webSocket from 'socket.io-client'


// 用于判断一个坐标是否在一个坐标列表里
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

// 获取可放置位置列表
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
            || isFeasibleByStep(i, j, 1, 1)
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

// 可放置位置数据结构
export interface PromptDict {
    [piece: string]: number[][]
}

// 获取可放置位置的数据
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
        result = result.concat(getFeasibleByStep(i, j, 1, 1))
        return result
    }

    const result = { list: [] } as PromptDict
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

// 计算棋盘中一种棋子的个数
export function countPiece(board: number[][], piece: number) {
    let count = 0
    board.forEach((line) => line.forEach((item) => {
        if (item === piece) {
            count++
        }
    }))
    return count
}

// 二维数组的深复制, 用于复制新棋盘
export function copy2dArray(arr: number[][]): number[][] {
    let re = []
    for (let i = 0; i < arr.length; i++) {
        let [...arr1] = arr[i]
        re.push(arr1)
    }
    return re
}

// 浏览器端让用户下载数据
export function download(str: string) {
    var elementA = document.createElement('a')

    // 文件的名称为时间戳加文件名后缀
    elementA.download = + new Date() + ".json"
    elementA.style.display = 'none'

    // 生成一个blob二进制数据，内容为json数据
    var blob = new Blob([str])

    //生成一个指向blob的URL地址，并赋值给a标签的href属性
    elementA.href = URL.createObjectURL(blob)
    document.body.appendChild(elementA)
    elementA.click()
    document.body.removeChild(elementA)
}

// 应对 XSS 的过滤函数
export function escapeHtml(value: string) {
    if (typeof value !== 'string') {
        return value
    }
    return value.replace(/[&<>`"'/]/g, function (result) {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '`': '&#x60;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2f;',
        } as { [key: string]: string }
        if (escapeMap[result]) {
            return escapeMap[result]
        } else {
            return ''
        }
    })
}

// AI 算法映射
export const aiMapForJs = [
    {
        name: "小迷糊",
        description: "小迷糊什么都不知道, 他只会在可以下的地方随便下一个棋子.",
        fn: function (board: number[][], current: number, newest: number[], reversal: number[][], prompt: PromptDict, callback: (piece: number[]) => void) {
            callback(prompt.list[Math.floor(Math.random() * prompt.list.length)])
        }
    },
    {
        name: "贪心鬼",
        description: "贪心鬼很贪婪, 他每次只会下翻转最多棋子的地方.",
        fn: function (board: number[][], current: number, newest: number[], reversal: number[][], prompt: PromptDict, callback: (piece: number[]) => void) {
            let max = 0
            let index = 0
            for (let i = 0; i < prompt.list.length; i++) {
                if (prompt[prompt.list[i].toString()].length > max) {
                    max = prompt[prompt.list[i].toString()].length
                    index = i
                }
            }
            callback(prompt.list[index])
        }
    }
]

// export const initBoard = [
//   [0, 1, 1, 1, 1, 1, 0, 0],
//   [2, 2, 1, 1, 2, 2, 0, 0],
//   [2, 2, 1, 1, 2, 2, 2, 2],
//   [2, 1, 1, 2, 2, 2, 2, 2],
//   [1, 1, 1, 2, 2, 0, 0, 2],
//   [2, 2, 2, 2, 2, 2, 2, 2],
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0],
// ]

export const initBoard = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

// export const initBoard = [
//     [0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 2, 0],
//     [0, 0, 0, 0, 0, 0, 0, 2],
//     [0, 0, 0, 0, 0, 1, 2, 0],
// ]



export function GET(url: string, onSuccess?: (data: any) => void) {
    const httpRequest = new XMLHttpRequest()
    httpRequest.open('GET', url, true)
    httpRequest.send()
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            const json = httpRequest.responseText
            const data = JSON.parse(json)
            if (onSuccess) {
                onSuccess(data)
            }
        }
    }
}

export function POST(url: string, data: any, onSuccess?: (data: any) => void) {
    const httpRequest = new XMLHttpRequest()
    httpRequest.open('POST', url, true)
    httpRequest.setRequestHeader("Content-type", "application/json")
    httpRequest.send(JSON.stringify(data))
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            const json = httpRequest.responseText
            const data = JSON.parse(json)
            if (onSuccess) {
                onSuccess(data)
            }
        }
    }
}

// 获取 Python AI list 的网址
export const pythonAiListUrl = 'http://127.0.0.1:7685/ai_list'

// Python AI 的 API
export function runPythonAi(aiIndex: number, board: number[][], current: number, newest: number[], reversal: number[][], prompt: PromptDict, callback: (piece: number[]) => void) {
    POST('http://127.0.0.1:7685/ai_api',
        { aiIndex, board, current, newest, reversal, prompt },
        (data) => callback(data)
    )
}

// 加载 socket.io
export const io = webSocket('http://127.0.0.1:7686')
