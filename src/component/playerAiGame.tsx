import { useState } from 'react'
import { Typography, Button, Space, Select, Radio } from 'antd'
import PlayersBoard from './playersBoard'
import 'antd/dist/antd.css'

const { Paragraph } = Typography
const { Option } = Select

function PlayerAiGame() {
    // 处理重新开始的逻辑
    const [isStart, setIsStart] = useState(true)

    return (
        <div className="site-layout-background" style={{ padding: 24 }}>
            <Space size="large" wrap style={{ paddingBottom: 24 }}>
                <Button onClick={() => { setIsStart(true) }} size="large" style={{ minWidth: 80 }}>
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
                    <Radio.Button value="black" style={{ minWidth: 80 }}>⚫ 2</Radio.Button>
                    <Radio.Button value="white" style={{ minWidth: 80 }}>⚪ 2</Radio.Button>
                </Radio.Group>
            </Space>
            <br />
            <br />
            <Paragraph>
                小迷糊什么都不知道, 所以他只会在可以下的地方随便下一个棋子.
            </Paragraph>
            <PlayersBoard isStart={isStart} isStartCallback={() => { setIsStart(false) }} />
        </div>
    )
}

export default PlayerAiGame