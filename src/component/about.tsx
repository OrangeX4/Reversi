import { Typography } from 'antd'

const { Title, Paragraph, Text, Link } = Typography

function About() {

    return (
        <div className="site-layout-background" style={{ padding: 24 }}>
            <Title level={2}>黑白棋说明</Title>
            <Paragraph>
                <Text strong>黑白棋</Text> 是一种棋类游戏.
            </Paragraph>
            <Paragraph>
                <Link href="https://zh.wikipedia.org/wiki/%E9%BB%91%E7%99%BD%E6%A3%8B">维基百科上的介绍</Link>
            </Paragraph>
        </div>
    )
}

export default About