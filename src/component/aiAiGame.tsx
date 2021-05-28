import { useState, useEffect } from 'react'
import { Typography, Button, Space, Select, Radio, message } from 'antd'
import Board from './board'
import { countPiece, copy2dArray, download, getPromptDict, PromptDict } from '../utils'

const { Paragraph, Text } = Typography
const { Option } = Select

// AI 算法映射
const aiMap = [
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

let history = [] as number[][][]
let historyForNewest = [] as number[][]
let historyForReversal = [] as number[][][]

let initBoard = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

let endCount = 0

function AiAiGame() {

    // 是否开始游戏
    const [isStart, setIsStart] = useState(false)

    // 延时时间
    const [delay, setDelay] = useState(500)

    // AI 选择
    const [firstAiIndex, setFirstAiIndex] = useState(0)
    const [secondAiIndex, setSecondAiIndex] = useState(0)

    const [newest, setNewest] = useState([-1, -1])
    const [reversal, setReversal] = useState([] as number[][])
    // 当前是谁下
    const [currentPiece, setCurrentPiece] = useState(1)

    const [board, setBoard] = useState(initBoard)

    function emitMessageForAi() {
        // 应用 AI 算法
        setTimeout(() => {
            const prompt = getPromptDict(board, currentPiece)
            if (!prompt) {
                return
            }
            if (prompt.list.length === 0) {
                endCount += 1
                console.log("endCount: " + endCount)
                if (endCount >= 2) {
                    message.success(((countPiece(board, 1) > countPiece(board, 2)) ? '黑' : '白') + '棋子胜利!')
                    return
                }
                setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
                return
            }
            // AI 选择
            aiMap[currentPiece === 1 ? firstAiIndex : secondAiIndex]
                .fn(board, currentPiece, newest, reversal, prompt, (_newest) => {
                    if (prompt) {
                        updateBoard(_newest, prompt[_newest.toString()])
                    }
                })
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
                <Button onClick={restart} size="large" style={{ minWidth: 80 }}>
                    开始
                </Button>
                <Radio.Group defaultValue={500} value={delay} size="large">
                    <Radio.Button value={500} onClick={() => setDelay(500)} style={{ minWidth: 96 }}>有延时</Radio.Button>
                    <Radio.Button value={0} onClick={() => setDelay(0)} style={{ minWidth: 96 }}>无延时</Radio.Button>
                </Radio.Group>
                <Select defaultValue={0} value={firstAiIndex} size="large" style={{ width: 120 }} onChange={(value) => setFirstAiIndex(value)}>
                    <Option value={0}>小迷糊</Option>
                    <Option value={1}>贪心鬼</Option>
                </Select>
                <Text>Vs</Text>
                <Select defaultValue={0} value={secondAiIndex} size="large" style={{ width: 120 }} onChange={(value) => setSecondAiIndex(value)}>
                    <Option value={0}>小迷糊</Option>
                    <Option value={1}>贪心鬼</Option>
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
                        setIsStart(false)
                        const black = countPiece(board, 1)
                        const white = countPiece(board, 2)
                        if (black === white) {
                            return <Text type="success">平局!</Text>
                        } else {
                            return <Text type="success">{(black > white) ? '玩家' : 'AI '}胜利!</Text>
                        }
                    }
                })()}
            </Space>
            <br />
            <br />
            <Paragraph>
                {aiMap[firstAiIndex].description}
            </Paragraph>
            <Paragraph>
                {aiMap[secondAiIndex].description}
            </Paragraph>
            <Board board={board} current={currentPiece} reversal={reversal} newest={newest}
                isEnd={endCount >= 2} />
        </div>
    )
}

export default AiAiGame