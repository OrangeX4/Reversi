import { useState, useEffect } from 'react'
import { Button, Space, Radio, Typography } from 'antd'
import Board from './board'
import { countPiece, copy2dArray } from '../utils'
const { Text } = Typography

let history = [] as number[][][]
let historyForNewest = [] as number[][]
let historyForReversal = [] as number[][][]

function PlayersGame() {

    const [newest, setNewest] = useState([-1, -1])
    const [reversal, setReversal] = useState([] as number[][])
    const [currentPiece, setCurrentPiece] = useState(1)

    const [endCount, setEndCount] = useState(0)

    const [board, setBoard] = useState([
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 1, 0, 0, 0],
        [0, 0, 0, 1, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ])

    function restart() {
        history = []
        historyForNewest = []
        historyForReversal = []
        setBoard([
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 2, 1, 0, 0, 0],
            [0, 0, 0, 1, 2, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ])
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
        }
    }

    // 记录对局数据
    useEffect(() => {
        history.push(board)
        historyForNewest.push(newest)
        historyForReversal.push(reversal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [board])


    return (
        <div className="site-layout-background" style={{ padding: 24 }}>
            <Space size="large" wrap style={{ paddingBottom: 24 }}>
                <Button onClick={restart} size="large" style={{ minWidth: 80 }}>
                    开始
                </Button>
                <Button onClick={recall} size="large" style={{ minWidth: 80 }}>
                    悔棋
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
                    }
                })()}
            </Space>
            <Board board={board} current={currentPiece} reversal={reversal} newest={newest}
                isEnd={endCount >= 2}
                onClickPrompt={(_newest, _reversal) => {
                    if (_reversal.length !== 0) {
                        // 正常情况
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
                    } else {
                        // 有一方无棋可下
                        setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
                        setEndCount((endCount) => endCount + 1)
                    }
                }} />
        </div>
    )
}

export default PlayersGame