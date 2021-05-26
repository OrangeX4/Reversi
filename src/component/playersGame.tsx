import { useState } from 'react'
import { Button, Space, Radio } from 'antd'
import PlayersBoard from './playersBoard'
import 'antd/dist/antd.css'

function PlayersGame() {
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
                <Radio.Group defaultValue="black" value="black" size="large">
                    <Radio.Button value="black" style={{ minWidth: 80 }}>⚫ 2</Radio.Button>
                    <Radio.Button value="white" style={{ minWidth: 80 }}>⚪ 2</Radio.Button>
                </Radio.Group>
            </Space>
            <PlayersBoard isStart={isStart} isStartCallback={() => { setIsStart(false) }} />
        </div>
    )
}

export default PlayersGame