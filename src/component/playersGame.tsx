import { useState, useEffect } from 'react'
import { Button, Space, Radio, Typography } from 'antd'
import Board from './board'
import { countPiece, copy2dArray, download, initBoard, getPrompt } from '../utils'
const { Text } = Typography

let history = [] as number[][][]
let historyForNewest = [] as number[][]
let historyForReversal = [] as number[][][]

function PlayersGame() {

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

    function restart() {
        history = []
        historyForNewest = []
        historyForReversal = []
        setNewest([-1, -1])
        setReversal([])
        setCurrentPiece(1)
        setEndCount(0)
        setBoard(initBoard)
    }

    function recall() {
        if (history.length > 1) {
            history.pop()
            const _board = history.pop()
            if (_board) {
                setBoard(_board)
            }
            historyForNewest.pop()
            const _newest = historyForNewest.pop()
            if (_newest) {
                setNewest(_newest)
            }
            historyForReversal.pop()
            const _reversal = historyForReversal.pop()
            if (_reversal) {
                setReversal(_reversal)
            }
            setEndCount(0)
            setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
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
                            return <Text type="success">{black > white ? '黑' : '白'}棋胜利!</Text>
                        }
                    } else {
                        return <Text type="success">等待时间: {timeCount} 秒</Text>
                    }
                })()}
            </Space>
            <Board board={board} current={currentPiece} reversal={reversal} newest={newest}
                isEnd={endCount >= 2}
                onClickPrompt={(_newest, _reversal) => {
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
                        } else {
                            // 自己可以下, 直接返回
                            setEndCount(1)
                            return
                        }
                    }
                    setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
                }} />
        </div>
    )
}

export default PlayersGame