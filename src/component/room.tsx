import { useState, useEffect } from 'react'
import { Typography, Space, Radio, Form, Input, Button, message } from 'antd'
import { countPiece, copy2dArray, download, getPromptDict, PromptDict, escapeHtml } from '../utils'
import Board from './board'

const { Title, Text } = Typography

interface RoomType {
    id: number,
    name: string,
    isReady: boolean
}

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

function Room() {

    // 房间列表
    const [roomList, setRoomList] = useState([{
        id: 0,
        name: '第一个房间',
        isReady: true
    }] as RoomType[])

    // 新建房间
    const [newRoomName, setNewRoomName] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    function handleNewRoomClick() {
        if (newRoomName.trim() === '') {
            setErrorMessage('请输入房间名!')
            return
        } else if (newRoomName.length > 20) {
            setErrorMessage('房间名过长!')
            return
        } else {
            setErrorMessage('')
            // TODO: 处理创建房间的逻辑
            setTimeout(() => {
                const newRoom: RoomType = {
                    id: roomList[roomList.length - 1].id + 1,
                    name: escapeHtml(newRoomName.trim()),
                    isReady: false
                }
                receiveNewRoomMessage(newRoom.id, [...roomList, newRoom])
            }, 200)
        }
    }
    function receiveNewRoomMessage(newRoomId: number, newRoomList: RoomType[]) {
        newRoomList = newRoomList.sort((a, b) => a.id - b.id)
        setRoomList(newRoomList)
        setRoomId(newRoomId)
        setIsOwner(true)

        if (newRoomId !== -1) {
            // TODO: 处理对手加入的逻辑
            setTimeout(() => {
                message.success('有玩家加入游戏了!')
                setIsReady(true)
            }, 2000)
    
            // TODO: 处理对手突然退出的逻辑
            setTimeout(() => {
                message.warn('对面玩家退出了游戏!')
                initiate()
                setIsRivalRunning(false)
                setIsOwner(false)
                setIsReady(false)
                setIsBystander(false)
                setPlayerPiece(1)
                setPlayerRadio(1)
            }, 10000)
        }
    }

    // 在房间内的逻辑
    // 当前房间 ID
    const [roomId, setRoomId] = useState(-1)
    // TODO: 是否观战
    const [isBystander, setIsBystander] = useState(false)
    // 是否有参赛者
    const [isReady, setIsReady] = useState(false)
    // 是否房主
    const [isOwner, setIsOwner] = useState(false)

    // 设定谁先走
    const [playerPiece, setPlayerPiece] = useState(1)
    const [playerRadio, setPlayerRadio] = useState(1)
    function handleSetPlayerRadio(value: number) {
        if (isOwner) {
            setPlayerRadio(value)
        } else {
            message.warn('只有房主才可以选择谁先下棋!')
        }
    }

    // 非常麻烦的异步判断是否该对手下棋了
    const [lastOne, setLastOne] = useState(-1)
    const [isRivalRunning, setIsRivalRunning] = useState(false)

    const [newest, setNewest] = useState([-1, -1])
    const [reversal, setReversal] = useState([] as number[][])
    const [currentPiece, setCurrentPiece] = useState(1)

    const [endCount, setEndCount] = useState(0)

    const [board, setBoard] = useState(initBoard)

    function emitMessageForRival(prompt?: PromptDict) {
        if (!prompt) {
            prompt = getPromptDict(board, currentPiece)
        }
        // TODO: 处理发送信息的逻辑
        setTimeout(() => {
            if (!prompt) {
                return
            }
            if (prompt.list.length === 0) {
                setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
                setEndCount((endCount) => endCount + 1)
                setIsRivalRunning(false)
                return
            }
            // 随机
            const _newest = prompt.list[Math.floor(Math.random() * prompt.list.length)]
            if (prompt) {
                updateBoard(_newest, prompt[_newest.toString()])
                setIsRivalRunning(false)
                setLastOne(lastOne === 1 ? 2 : 1)
            }
        }, 500)
    }

    useEffect(() => {
        // 说明玩家已经执行完毕了
        if (!isRivalRunning && lastOne === playerPiece) {
            setIsRivalRunning(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [board])

    useEffect(() => {
        if (isRivalRunning) {
            emitMessageForRival()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRivalRunning])

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
        setEndCount(0)
    }


    function handleClickPrompt(_newest: number[], _reversal: number[][]) {
        if (!isReady) {
            message.warn('游戏暂未开始, 请耐心等待对手进入房间!')
            return
        }
        if (_reversal.length !== 0) {
            // 正常情况
            if (playerPiece === currentPiece && !isRivalRunning) {
                // 轮到玩家下
                updateBoard(_newest, _reversal)
                setLastOne(playerPiece)
            }
        } else {
            // 有一方无棋可下
            setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
            setEndCount((endCount) => endCount + 1)
        }
    }

    // 进行初始化
    function initiate() {
        history = []
        historyForNewest = []
        historyForReversal = []
        setNewest([-1, -1])
        setReversal([])
        setCurrentPiece(1)
        setEndCount(0)
        setPlayerPiece(playerRadio)
        setBoard(initBoard)
        setLastOne(-1)
    }

    function restart() {
        if (!isOwner) {
            message.warn('只有房主可以重新开始!')
            return
        }
        initiate()
        if (playerRadio === 1) {
            setIsRivalRunning(false)
        } else {
            setIsRivalRunning(true)
        }
    }

    // 退出
    function exit() {
        // TODO: 处理退出逻辑
        setTimeout(() => {
            initiate()
            setIsRivalRunning(false)
            setIsOwner(false)
            setIsReady(false)
            setIsBystander(false)
            setPlayerPiece(1)
            setPlayerRadio(1)
            receiveNewRoomMessage(-1, roomList.filter((room) => room.id !== roomId))
        }, 200)
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
        roomId === -1 ? <>
            {/* 新建房间 */}
            <div className="site-layout-background" style={{ padding: 24, marginBottom: 16 }}>
                <Title level={4}>新建房间</Title>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Form layout="inline">
                        <Form.Item>
                            <Input placeholder="新建房间名" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} size="large" style={{ minWidth: 240, display: "inline" }} />
                        </Form.Item>
                        <Form.Item>
                            <Text type="danger">{errorMessage}</Text>
                        </Form.Item>
                    </Form>
                    <div>
                        <Button onClick={handleNewRoomClick} size="large">新建房间</Button>
                    </div>
                </div>
            </div>
            {(roomList.length === 0 ? (
                // 房间列表为空时
                <div className="site-layout-background" style={{ padding: 24, marginBottom: 16 }}>
                    <Title level={4}>当前无房间</Title>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text style={{ marginTop: 8 }}>当前没有任何房间, 您可以新建一个自己的房间哦!</Text>
                        <div>
                            <Button size="large">刷新房间</Button>
                        </div>
                    </div>
                </div>

                // 房间不为空时, 渲染房间列表
            ) : (<>
                {roomList.map((room) => (
                    <div className="site-layout-background" key={room.id} style={{ padding: 24, marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Title level={4}>{room.name}</Title>
                            <div>
                                <Text type={room.isReady ? "secondary" : "success"}>{room.isReady ? "游戏中" : "等待中"}</Text>
                                <Button size="large" style={{ marginLeft: 16 }}>进入观战</Button>
                                <Button size="large" style={{ marginLeft: 16 }} disabled={room.isReady}>加入房间</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </>))
                // 游戏中
            }</> : (
            <div className="site-layout-background" style={{ padding: 24 }}>
                <Space size="large" wrap style={{ paddingBottom: 24 }}>
                    <Button onClick={restart} size="large" style={{ minWidth: 80 }} disabled={!isReady || isBystander}>
                        开始
                    </Button>
                    <Radio.Group defaultValue={1} value={playerRadio} size="large" disabled={!isReady || isBystander}>
                        <Radio.Button value={1} onClick={() => handleSetPlayerRadio(1)} style={{ minWidth: 96 }}>自己先走</Radio.Button>
                        <Radio.Button value={2} onClick={() => handleSetPlayerRadio(2)} style={{ minWidth: 96 }}>对方先走</Radio.Button>
                    </Radio.Group>
                    <Button onClick={downloadData} size="large" style={{ minWidth: 80 }} disabled={!isReady || isBystander}>
                        保存对局数据
                    </Button>
                    <Button onClick={exit} size="large" style={{ minWidth: 80 }}>
                        退出
                    </Button>
                    <Radio.Group defaultValue="black" value={currentPiece === 1 ? "black" : "white"} size="large">
                        <Radio.Button value="black" style={{ minWidth: 80 }}>{`⚫ ${countPiece(board, 1)}`}</Radio.Button>
                        <Radio.Button value="white" style={{ minWidth: 80 }}>{`⚪ ${countPiece(board, 2)}`}</Radio.Button>
                    </Radio.Group>
                    {isBystander ? <Text type="success">观战中...</Text> : null}
                    {!isReady ? <Text type="secondary">请耐心等待他人进入房间...</Text> : null}
                    {isReady && !isBystander ? (isRivalRunning ? <Text type="secondary">对方正在下棋, 请耐心等待...</Text> : <Text type="secondary">轮到你下棋, 请尽快决定哦~</Text>) : null}
                    {(() => {
                        if (endCount >= 2) {
                            const black = countPiece(board, 1)
                            const white = countPiece(board, 2)
                            if (black === white) {
                                return <Text type="success">平局!</Text>
                            } else {
                                return <Text type="success">{(black > white && playerPiece === 1) || (black < white && playerPiece === 2) ? '玩家' : '对手'}胜利!</Text>
                            }
                        }
                    })()}
                </Space>
                <Board board={board} current={currentPiece} reversal={reversal} newest={newest}
                    isEnd={endCount >= 2}
                    onClickPrompt={handleClickPrompt} />
            </div>
        )
    )
}

export default Room