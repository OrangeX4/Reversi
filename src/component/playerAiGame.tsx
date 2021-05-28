import { useState, useEffect } from 'react'
import { Typography, Button, Space, Select, Radio } from 'antd'
import Board from './board'
import { countPiece, copy2dArray, download, getPromptDict, PromptDict, aiMapForJs, aiMapForPython, initBoard, runPythonAi } from '../utils'

const { Paragraph, Text } = Typography
const { Option } = Select

let history = [] as number[][][]
let historyForNewest = [] as number[][]
let historyForReversal = [] as number[][][]

function PlayerAiGame() {

    // 设定谁先走
    const [playerPiece, setPlayerPiece] = useState(1)
    const [playerRadio, setPlayerRadio] = useState(1)

    // 非常麻烦的异步判断是否该 AI 下棋了
    const [lastOne, setLastOne] = useState(-1)
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

    function emitMessageForAi(prompt?: PromptDict) {
        if (!prompt) {
            prompt = getPromptDict(board, currentPiece)
        }
        // 应用 AI 算法
        setTimeout(() => {
            if (!prompt) {
                return
            }
            // 直接跳过
            if (prompt.list.length === 0) {
                setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
                setEndCount((endCount) => endCount + 1)
                setIsAiRunning(false)
                return
            }
            // 判断是 js 还是 python, 使用不同的策略
            if (aiIndex < 0) {
                // 对 JS 的 AI
                aiMapForJs[-aiIndex-1].fn(board, currentPiece, newest, reversal, prompt, (_newest) => {
                    if (prompt) {
                        updateBoard(_newest, prompt[_newest.toString()])
                        setIsAiRunning(false)
                        setLastOne(lastOne === 1 ? 2 : 1)
                    }
                })
            } else {
                // 对 Python 的 AI
                runPythonAi(aiIndex, board, currentPiece, newest, reversal, prompt, (_newest) => {
                    if (prompt) {
                        updateBoard(_newest, prompt[_newest.toString()])
                        setIsAiRunning(false)
                        setLastOne(lastOne === 1 ? 2 : 1)
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

    function updateBoard(_newest: number[], _reversal: number[][]) {
        const newBoard = copy2dArray(board)
        newBoard[_newest[0]][_newest[1]] = currentPiece
        _reversal.forEach((piece) => {
            newBoard[piece[0]][piece[1]] = currentPiece
        })
        setBoard(newBoard)
        setNewest(_newest)
        setReversal(_reversal)
        setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
        setEndCount(0)
    }


    function handleClickPrompt(_newest: number[], _reversal: number[][]) {
        if (_reversal.length !== 0) {
            // 正常情况
            if (playerPiece === currentPiece && !isAiRunning) {
                // 轮到玩家下
                updateBoard(_newest, _reversal)
                setLastOne(playerPiece)
            }
        } else {
            // 有一方无棋可下
            setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
            setEndCount((endCount) => endCount + 1)
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
        setLastOne(-1)
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
                    {aiMapForJs.map((ai, index) => <Option value={-index-1} key={-index-1}>{ai.name}</Option>)}
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
                {(() => {
                    if (endCount >= 2) {
                        const black = countPiece(board, 1)
                        const white = countPiece(board, 2)
                        if (black === white) {
                            return <Text type="success">平局!</Text>
                        } else {
                            return <Text type="success">{(black > white && playerPiece === 1) || (black < white && playerPiece === 2) ? '玩家' : 'AI '}胜利!</Text>
                        }
                    }
                })()}
            </Space>
            <br />
            <br />
            <Paragraph>
                {aiIndex < 0 ? aiMapForJs[-aiIndex-1].description : aiMapForPython[aiIndex].description}
            </Paragraph>
            <Board board={board} current={currentPiece} reversal={reversal} newest={newest}
                isEnd={endCount >= 2}
                onClickPrompt={handleClickPrompt} />
        </div>
    )
}

export default PlayerAiGame