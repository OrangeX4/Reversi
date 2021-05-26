import { useState } from 'react'
import { Typography, Button, Space, Select, Radio } from 'antd'
import Board from './board'
import { countPiece } from '../utils'

const { Paragraph } = Typography
const { Option } = Select

function PlayerAiGame() {
    
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

    return (
        <div className="site-layout-background" style={{ padding: 24 }}>
            <Space size="large" wrap style={{ paddingBottom: 24 }}>
                <Button onClick={restart} size="large" style={{ minWidth: 80 }}>
                    开始
                            </Button>
                <Button size="large" style={{ minWidth: 80 }}>
                    悔棋
                            </Button>
                <Radio.Group defaultValue="player" size="large">
                    <Radio.Button value="player" style={{ minWidth: 96 }}>玩家先走</Radio.Button>
                    <Radio.Button value="ai" style={{ minWidth: 96 }}>AI 先走</Radio.Button>
                </Radio.Group>
                <Select defaultValue="0" size="large" style={{ width: 120 }} onChange={(value) => console.log(`selected ${value}`)}>
                    <Option value="0">小迷糊</Option>
                    <Option value="1">贪心鬼</Option>
                </Select>
                <Radio.Group defaultValue="black" value="black" size="large">
                    <Radio.Button value="black" style={{ minWidth: 80 }}>{`⚫ ${countPiece(board, 1)}}`}</Radio.Button>
                    <Radio.Button value="white" style={{ minWidth: 80 }}>{`⚪ ${countPiece(board, 1)}}`}</Radio.Button>
                </Radio.Group>
            </Space>
            <br />
            <br />
            <Paragraph>
                小迷糊什么都不知道, 所以他只会在可以下的地方随便下一个棋子.
            </Paragraph>
            <Board board={board} current={1} reversal={[[4, 4]]} newest={[3, 4]} />
        </div>
    )
}

export default PlayerAiGame