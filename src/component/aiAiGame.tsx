import { useState, useEffect } from 'react'
import { Typography, Button, Space, Select, Radio, message } from 'antd'
import Board from './board'
import { countPiece, copy2dArray, download, getPromptDict, aiMapForJs, GET, pythonAiListUrl, initBoard, runPythonAi } from '../utils'

const { Paragraph, Text } = Typography
const { Option } = Select

let history = [] as number[][][]
let historyForNewest = [] as number[][]
let historyForReversal = [] as number[][][]

let endCount = 0

// python 的 AI 结构
interface PythonAI {
    name: string
    description: string
}

function AiAiGame() {


    // 初始化 AI
    const [aiMapForPython, setAiMapForPython] = useState([] as PythonAI[])

    // 加载 python 的 AI
    useEffect(() => {
        GET(pythonAiListUrl, (data) => {
            setAiMapForPython(data)
        })
    }, [])

    // 是否开始游戏
    const [isStart, setIsStart] = useState(false)

    // 延时时间
    const [delay, setDelay] = useState(500)

    // AI 选择
    const [firstAiIndex, setFirstAiIndex] = useState(-1)
    const [secondAiIndex, setSecondAiIndex] = useState(-1)

    const [newest, setNewest] = useState([-1, -1])
    const [reversal, setReversal] = useState([] as number[][])
    // 当前是谁下
    const [currentPiece, setCurrentPiece] = useState(1)

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

    function emitMessageForAi() {
        // 应用 AI 算法
        setTimeout(() => {
            const prompt = getPromptDict(board, currentPiece)
            if (!prompt) {
                return
            }
            // 无棋可下, 直接跳过
            if (prompt.list.length === 0) {
                endCount += 1
                if (endCount >= 2) {
                    setIsStart(false)
                    return
                }
                setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
                return
            }
            // 只有一个地方可以下, 还计算啥, 直接下就对了
            if (prompt.list.length === 1) {
                updateBoard(prompt.list[0], prompt[prompt.list[0].toString()])
                return
            }
            // AI 选择
            const aiIndex = currentPiece === 1 ? firstAiIndex : secondAiIndex
            if (aiIndex < 0) {
                // 对 JS 的 AI
                aiMapForJs[-aiIndex - 1].fn(board, currentPiece, newest, reversal, prompt, (_newest) => {
                    if (prompt) {
                        updateBoard(_newest, prompt[_newest.toString()])
                    }
                })
            } else {
                // 对 Python 的 AI
                runPythonAi(aiIndex, board, currentPiece, newest, reversal, prompt, (_newest) => {
                    if (prompt) {
                        updateBoard(_newest, prompt[_newest.toString()])
                    }
                })
            }
        }, delay)
    }

    // 在棋盘更新的时候给 AI 发送消息
    useEffect(() => {
        if (isStart) {
            emitMessageForAi()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPiece, isStart])


    function updateBoard(_newest: number[], _reversal: number[][]) {
        const newBoard = copy2dArray(board)
        if (!_reversal) {
            console.log('newest:' + _newest.toString())
            message.warn('AI 出现 Bug 了! AI 想下 ' + _newest.toString() + '位置.')
            return
        }
        newBoard[_newest[0]][_newest[1]] = currentPiece
        _reversal.forEach((piece) => {
            newBoard[piece[0]][piece[1]] = currentPiece
        })
        setBoard(newBoard)
        setNewest(_newest)
        setReversal(_reversal)
        setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
        endCount = 0
    }


    function restart() {
        history = []
        historyForNewest = []
        historyForReversal = []
        setNewest([-1, -1])
        setReversal([])
        setCurrentPiece(1)
        endCount = 0
        setBoard(initBoard)
        setIsStart(true)
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
                <Button onClick={restart} size="large" style={{ minWidth: 80 }} disabled={isStart}>
                    开始
                </Button>
                <Radio.Group defaultValue={500} value={delay} size="large">
                    <Radio.Button value={500} onClick={() => setDelay(500)} style={{ minWidth: 96 }}>有延时</Radio.Button>
                    <Radio.Button value={0} onClick={() => setDelay(0)} style={{ minWidth: 96 }}>无延时</Radio.Button>
                </Radio.Group>
                <Select defaultValue={0} value={firstAiIndex} size="large" style={{ width: 120 }} onChange={(value) => setFirstAiIndex(value)}>
                    {aiMapForJs.map((ai, index) => <Option value={-index - 1} key={-index - 1}>{ai.name}</Option>)}
                    {aiMapForPython.map((ai, index) => <Option value={index} key={index}>{ai.name}</Option>)}
                </Select>
                <Text>Vs</Text>
                <Select defaultValue={0} value={secondAiIndex} size="large" style={{ width: 120 }} onChange={(value) => setSecondAiIndex(value)}>
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
                {(() => {
                    if (endCount >= 2) {

                        const black = countPiece(board, 1)
                        const white = countPiece(board, 2)
                        if (black === white) {
                            return <Text type="success">平局!</Text>
                        } else {
                            return <Text type="success">{(black > white) ? '黑' : '白'}棋胜利!</Text>
                        }
                    } else {
                        return <Text type="success">等待时间: {timeCount} 秒</Text>
                    }
                })()}
            </Space>
            <br />
            <br />
            <Paragraph>
                {firstAiIndex < 0 ? aiMapForJs[-firstAiIndex - 1].description : aiMapForPython[firstAiIndex].description}
            </Paragraph>
            <Paragraph>
                {secondAiIndex < 0 ? aiMapForJs[-secondAiIndex - 1].description : aiMapForPython[secondAiIndex].description}
            </Paragraph>
            <Board board={board} current={currentPiece} reversal={reversal} newest={newest}
                isEnd={endCount >= 2} />
        </div>
    )
}

export default AiAiGame