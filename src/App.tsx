import { Layout, Menu, Typography, Button, Space, Select, Radio } from 'antd'
import { UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import Board from './component/board'
import 'antd/dist/antd.css'
import './css/App.css'

const { Header, Content, Sider } = Layout
const { Title, Paragraph } = Typography
const { Option } = Select

const board = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
]

function App() {
    return (
        <Layout className="layout">
            <Sider breakpoint="lg" collapsedWidth="0">
                <div className="logo" />
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['0']}>
                    <Menu.Item key="0" icon={<UserOutlined />}>
                        人机对战
                    </Menu.Item>
                    <Menu.Item key="1" icon={<VideoCameraOutlined />}>
                        双人对战
                    </Menu.Item>
                    <Menu.Item key="2" icon={<UploadOutlined />}>
                        AI 对战
                    </Menu.Item>
                    <Menu.Item key="3" icon={<UserOutlined />}>
                        说明
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Header className="site-layout-sub-header-background" style={{ padding: 16 }}>
                    <Title level={4}>人机对战</Title>
                </Header>
                <Content style={{ margin: '24px 16px 0' }}>
                    <div className="site-layout-background" style={{ padding: 24 }}>
                        <Space size="large" wrap style={{ paddingBottom: 24 }}>
                            <Button size="large" style={{ minWidth: 80 }}>
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
                                <Radio.Button value="black" style={{ minWidth: 80 }}>⚫ 0</Radio.Button>
                                <Radio.Button value="white" style={{ minWidth: 80 }}>⚪ 0</Radio.Button>
                            </Radio.Group>
                        </Space>
                        <br />
                        <br />
                        <Paragraph>
                            小迷糊什么都不知道, 所以他只会在可以下的地方随便下一个棋子.
                        </Paragraph>
                        <Board board={board} current={1} reversal={[[4, 4]]} newest={[3, 4]} />
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}

export default App