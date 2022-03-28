import { useState, useEffect } from 'react'
import { Typography, Button, Space, Select, Radio, message } from 'antd'
import Board from './board'
import { countPiece, copy2dArray, download, getPrompt, getPromptDict, PromptDict, aiMapForJs, GET, pythonAiListUrl, initBoard, runPythonAi } from '../utils'

const { Paragraph, Text } = Typography
const { Option } = Select

let history = [] as number[][][]
let historyForNewest = [] as number[][]
let historyForReversal = [] as number[][][]

let lastOne = -1

// python 的 AI 结构
interface PythonAI {
    name: string
    description: string
}

function PlayerAiGame() {

    // 初始化 AI
    const [aiMapForPython, setAiMapForPython] = useState([] as PythonAI[])

    // 加载 python 的 AI
    useEffect(() => {
        GET(pythonAiListUrl, (data) => {
            setAiMapForPython(data)
        })
    }, [])

    // 设定谁先走
    const [playerPiece, setPlayerPiece] = useState(1)
    const [playerRadio, setPlayerRadio] = useState(1)

    // 非常麻烦的异步判断是否该 AI 下棋了
    const [isAiRunning, setIsAiRunning] = useState(false)

    // 延时时间
    const [delay, setDelay] = useState(500)

    // AI 选择
    const [aiIndex, setAiIndex] = useState(-1)

    const [newest, setNewest] = useState([-1, -1])
    const [reversal, setReversal] = useState([] as number[][])
    const [currentPiece, setCurrentPiece] = useState(1)

    const [endCount, setEndCount] = useState(0)

    const [board, setBoard] = useState(initBoard)

    // 计时器
    const [timeCount, setTimeCount] = useState(0)
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeCount(c => c + 1)
        }, 1000)
        return () => clearInterval(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    // 棋盘更新时更新计数
    useEffect(() => {
        setTimeCount(0)
    }, [board])

    function emitMessageForAi(prompt?: PromptDict) {
        if (!prompt) {
            prompt = getPromptDict(board, currentPiece)
        }
        // 应用 AI 算法
        setTimeout(() => {
            if (!prompt) {
                return
            }
            // 无棋可下, 直接跳过
            if (prompt.list.length === 0) {
                setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
                setEndCount((endCount) => endCount + 1)
                setIsAiRunning(false)
                lastOne = lastOne === 1 ? 2 : 1
                return
            }
            // 只有一个地方可以下, 还计算啥, 直接下就对了
            if (prompt.list.length === 1) {
                updateBoardForAi(prompt.list[0], prompt[prompt.list[0].toString()])
                setIsAiRunning(false)
                lastOne = lastOne === 1 ? 2 : 1
                return
            }
            // 判断是 js 还是 python, 使用不同的策略
            if (aiIndex < 0) {
                // 对 JS 的 AI
                aiMapForJs[-aiIndex - 1].fn(board, currentPiece, newest, reversal, prompt, (_newest) => {
                    if (prompt) {
                        updateBoardForAi(_newest, prompt[_newest.toString()])
                    }
                })
            } else {
                // 对 Python 的 AI
                runPythonAi(aiIndex, board, currentPiece, newest, reversal, prompt, (_newest) => {
                    if (prompt) {
                        updateBoardForAi(_newest, prompt[_newest.toString()])
                    }
                })
            }
        }, delay)
    }

    useEffect(() => {
        // 说明玩家已经执行完毕了
        if (!isAiRunning && lastOne === playerPiece) {
            setIsAiRunning(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [board])

    useEffect(() => {
        if (isAiRunning) {
            emitMessageForAi()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAiRunning])

    function updateBoardForAi(_newest: number[], _reversal: number[][]) {
        if (!_reversal) {
            message.warn('AI 出现 Bug 了!')
            return
        }

        // 正常情况
        const newBoard = copy2dArray(board)
        newBoard[_newest[0]][_newest[1]] = currentPiece
        _reversal.forEach((piece) => {
            newBoard[piece[0]][piece[1]] = currentPiece
        })


        if (getPrompt(newBoard, currentPiece === 1 ? 2 : 1).length === 0) {
            if (getPrompt(newBoard, currentPiece).length === 0) {
                // 自己也无棋可下， 结束
                setEndCount(2)
                setBoard(newBoard)
                setNewest(_newest)
                setReversal(_reversal)
                setEndCount(0)
                return
            } else {
                // 自己可以下, 再次调用
                setEndCount(1)
                lastOne = playerPiece
                setIsAiRunning(false)
                setBoard(newBoard)
                setNewest(_newest)
                setReversal(_reversal)
                setEndCount(0)
                return
            }
        }
        setBoard(newBoard)
        setNewest(_newest)
        setReversal(_reversal)
        setEndCount(0)

        // 对方无棋可下

        setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
        setIsAiRunning(false)
        lastOne = lastOne === 1 ? 2 : 1
    }


    function handleClickPrompt(_newest: number[], _reversal: number[][]) {
        if (playerPiece === currentPiece && !isAiRunning) {
            // 轮到玩家下
            // 正常情况
            const newBoard = copy2dArray(board)
            newBoard[_newest[0]][_newest[1]] = currentPiece
            _reversal.forEach((piece) => {
                newBoard[piece[0]][piece[1]] = currentPiece
            })
            setBoard(newBoard)
            setNewest(_newest)
            setReversal(_reversal)
            setEndCount(0)

            // 对方无棋可下
            if (getPrompt(newBoard, currentPiece === 1 ? 2 : 1).length === 0) {
                if (getPrompt(newBoard, currentPiece).length === 0) {
                    // 自己也无棋可下， 结束
                    setEndCount(2)
                    return
                } else {
                    // 自己可以下, 直接返回
                    setEndCount(1)
                    return
                }
            }
            setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
            lastOne = playerPiece
        }
    }

    function restart() {
        history = []
        historyForNewest = []
        historyForReversal = []
        setNewest([-1, -1])
        setReversal([])
        setCurrentPiece(1)
        setEndCount(0)
        setPlayerPiece(playerRadio)
        setBoard(initBoard)
        lastOne = -1
        if (playerRadio === 1) {
            setIsAiRunning(false)
        } else {
            setIsAiRunning(true)
        }
    }

    function recall() {
        if (history.length > 2) {
            history.pop()
            history.pop()
            const _board = history.pop()
            if (_board) {
                setBoard(_board)
            }
            historyForNewest.pop()
            historyForNewest.pop()
            const _newest = historyForNewest.pop()
            if (_newest) {
                setNewest(_newest)
            }
            historyForReversal.pop()
            historyForReversal.pop()
            const _reversal = historyForReversal.pop()
            if (_reversal) {
                setReversal(_reversal)
            }
            setEndCount(0)
            if (currentPiece !== playerPiece) {
                setCurrentPiece(playerPiece)
            }
        }
    }

    // 记录对局数据
    useEffect(() => {
        history.push(board)
        historyForNewest.push(newest)
        historyForReversal.push(reversal)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [board])

    function downloadData() {
        download(JSON.stringify({
            first: '1',
            history: history,
            newest: historyForNewest,
            reversal: historyForReversal
        }))
    }

    return (
        <div className="site-layout-background" style={{ padding: 24 }}>
            <Space size="large" wrap style={{ paddingBottom: 24 }}>
                <Button onClick={restart} size="large" style={{ minWidth: 80 }}>
                    开始
                </Button>
                <Button onClick={recall} size="large" style={{ minWidth: 80 }}>
                    悔棋
                </Button>
                <Radio.Group defaultValue={1} value={playerRadio} size="large">
                    <Radio.Button value={1} onClick={() => setPlayerRadio(1)} style={{ minWidth: 96 }}>玩家先走</Radio.Button>
                    <Radio.Button value={2} onClick={() => setPlayerRadio(2)} style={{ minWidth: 96 }}>AI 先走</Radio.Button>
                </Radio.Group>
                <Radio.Group defaultValue={500} value={delay} size="large">
                    <Radio.Button value={500} onClick={() => setDelay(500)} style={{ minWidth: 96 }}>有延时</Radio.Button>
                    <Radio.Button value={0} onClick={() => setDelay(0)} style={{ minWidth: 96 }}>无延时</Radio.Button>
                </Radio.Group>
                <Select defaultValue={-1} value={aiIndex} size="large" style={{ width: 120 }} onChange={(value) => setAiIndex(value)}>
                    {aiMapForJs.map((ai, index) => <Option value={-index - 1} key={-index - 1}>{ai.name}</Option>)}
                    {aiMapForPython.map((ai, index) => <Option value={index} key={index}>{ai.name}</Option>)}
                </Select>
                <Button onClick={downloadData} size="large" style={{ minWidth: 80 }}>
                    保存对局数据
                </Button>
                <Radio.Group defaultValue="black" value={currentPiece === 1 ? "black" : "white"} size="large">
                    <Radio.Button value="black" style={{ minWidth: 80 }}>{`⚫ ${countPiece(board, 1)}`}</Radio.Button>
                    <Radio.Button value="white" style={{ minWidth: 80 }}>{`⚪ ${countPiece(board, 2)}`}</Radio.Button>
                </Radio.Group>
                {isAiRunning ? <Text type="secondary">AI 运算中...</Text> : null}
            </Space>
            <br />
            <br />
            {(() => {
                if (endCount >= 2) {
                    const black = countPiece(board, 1)
                    const white = countPiece(board, 2)
                    if (black === white) {
                        return <Text type="success">平局!</Text>
                    } else {
                        return <Text type="success">{(black > white && playerPiece === 1) || (black < white && playerPiece === 2) ? '玩家' : 'AI '}胜利!</Text>
                    }
                } else {
                    return <Text type="success">等待时间: {timeCount} 秒</Text>
                }
            })()}
            <br />
            <br />
            <Paragraph>
                {aiIndex < 0 ? aiMapForJs[-aiIndex - 1].description : aiMapForPython[aiIndex].description}
            </Paragraph>
            <Board board={board} current={currentPiece} reversal={reversal} newest={newest}
                isEnd={endCount >= 2}
                onClickPrompt={handleClickPrompt} />
        </div>
    )
}

export default PlayerAiGame