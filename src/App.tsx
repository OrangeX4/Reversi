import { useState } from 'react'
import { Layout, Menu, Typography } from 'antd'
import { UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import PlayersGame from './component/playersGame'
import PlayerAiGame from './component/playerAiGame'
import About from './component/about'
import 'antd/dist/antd.css'
import './css/App.css'

const { Header, Content, Sider } = Layout
const { Title } = Typography

const gameMap = ['双人对战', '人机对战', '联机对战', 'AI 对战', '说明']

function App() {
    const [currentGame, setCurrentGame] = useState(0)

    return (
        <Layout className="layout">
            <Sider breakpoint="lg" collapsedWidth="0">
                <div className="logo">⚫<span style={{color: 'black'}}>黑</span><span style={{color: 'white'}}>⚪白</span>⚫棋⚪</div>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['0']}>
                    <Menu.Item key="0" onClick={() => { setCurrentGame(0) }} icon={<VideoCameraOutlined />}>
                        {gameMap[0]}
                    </Menu.Item>
                    <Menu.Item key="1" onClick={() => { setCurrentGame(1) }} icon={<UserOutlined />}>
                        {gameMap[1]}
                    </Menu.Item>
                    <Menu.Item key="2" onClick={() => { setCurrentGame(2) }} icon={<VideoCameraOutlined />}>
                        {gameMap[2]}
                    </Menu.Item>
                    <Menu.Item key="3" onClick={() => { setCurrentGame(3) }} icon={<UploadOutlined />}>
                        {gameMap[3]}
                    </Menu.Item>
                    <Menu.Item key="4" onClick={() => { setCurrentGame(4) }} icon={<UserOutlined />}>
                        {gameMap[4]}
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Header className="site-layout-sub-header-background" style={{ padding: 16 }}>
                    <Title level={4}>{gameMap[currentGame]}</Title>
                </Header>
                <Content style={{ margin: '24px 16px 0' }}>
                    {(() => {
                        switch (currentGame) {
                            case 0:
                                return <PlayersGame />
                            case 1:
                                return <PlayerAiGame />
                            case 2:
                                return <p>建设中</p>
                            case 3:
                                return <p>建设中</p>
                            case 4:
                                return <About />
                        }
                    })()}
                </Content>
            </Layout>
        </Layout>
    )
}

export default App