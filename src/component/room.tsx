import { useState, useEffect } from 'react'
import { Typography, Space, Radio, Form, Input, Button, message } from 'antd'
import { countPiece, copy2dArray, download, getPromptDict, PromptDict, escapeHtml, initBoard, io } from '../utils'
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

function Room() {

    // 房间列表
    const [roomList, setRoomList] = useState([] as RoomType[])

    // 通过 socket.io 更新房间信息

    useEffect(() => {
        io.on('updateRoomList', (newRoomList: RoomType[]) => {
            setRoomList(newRoomList)
        })
    }, [])
    // 第一次启动时获取 roomList
    useEffect(() => {
        io.emit('updateRoomList')
    }, [])


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
            // 创建房间, 发送包含房间名的信息
            io.emit('createRoom', escapeHtml(newRoomName.trim()))
        }
    }
    // 接收到成功新建房间的信息时
    useEffect(() => {
        io.on('createRoom', (newRoomList: RoomType[]) => {
            receiveNewRoomMessage(newRoomList[newRoomList.length - 1].id, newRoomList)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    function receiveNewRoomMessage(newRoomId: number, newRoomList: RoomType[]) {
        newRoomList = newRoomList.sort((a, b) => a.id - b.id)
        setRoomList(newRoomList)
        setRoomId(newRoomId)
        setIsOwner(true)
    }


    // 在房间内的逻辑
    // 当前房间 ID
    const [roomId, setRoomId] = useState(-1)
    const [isBystander, setIsBystander] = useState(false)
    function observeRoom(roomId: number) {
        io.emit('observeRoom', roomId)
    }
    // 收到进入消息
    useEffect(() => {
        io.on('observeRoom', (data) => {
            setRoomId(data.id)
            setIsBystander(true)
            setIsReady(data.isReady)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    // 收到房间已经关闭消息
    useEffect(() => {
        io.on('closeRoom', () => {
            setIsBystander((isBystander) => {
                if (isBystander) {
                    message.warn('房主关闭了房间')
                    setRoomId(-1)
                    return false
                } else {
                    return false
                }
            })
        })
    }, [])

    // 接收到更新棋盘的信息
    useEffect(() => {
        io.on('updateBoard', (data) => {
            setIsBystander((isBystander) => {
                if (isBystander) {
                    setBoard(data.board)
                    setNewest(data.newest)
                    setReversal(data.reversal)
                    setCurrentPiece(data.currentPiece)
                    return true
                } else {
                    return false
                }
            })
            setPlayerPiece((playerPiece) => {
                setIsOwner((isOwner) => {
                    if (isOwner) {
                        if (data.currentPiece === playerPiece) {
                            setBoard(data.board)
                            setNewest(data.newest)
                            setReversal(data.reversal)
                            setCurrentPiece(data.currentPiece)
                            setEndCount(0)
                            setIsRivalRunning(false)
                            setLastOne(lastOne === 1 ? 2 : 1)
                        }
                        return true
                    } else {
                        return false
                    }
                })

                setIsRival((isRival) => {
                    if (isRival) {
                        if (data.currentPiece === playerPiece) {
                            setBoard(data.board)
                            setNewest(data.newest)
                            setReversal(data.reversal)
                            setCurrentPiece(data.currentPiece)
                            setEndCount(0)
                            setIsRivalRunning(false)
                            setLastOne(lastOne === 1 ? 2 : 1)
                        }
                        return true
                    } else {
                        return false
                    }
                })
                return playerPiece
            })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 是否有参赛者
    // eslint-disable-next-line
    const [isRival, setIsRival] = useState(false)
    const [isReady, setIsReady] = useState(false)
    // 加入已有房间的逻辑
    function addRoom(roomId: number) {
        io.emit('addRoom', roomId)
        setRoomId(roomId)
        setIsReady(true)
        setIsRival(true)
        setPlayerPiece(2)
        setPlayerRadio(2)
        setIsRivalRunning(true)
    }
    // 房主接收到有人加入房间的信息
    useEffect(() => {
        io.on('addRoom', () => {
            setIsOwner((isOwner) => {
                if (isOwner) {
                    message.success('有玩家加入游戏了!')
                    setIsReady(true)
                    return true
                } else {
                    return false
                }
            })
            setIsBystander((isBystander) => {
                if (isBystander) {
                    message.success('有玩家加入游戏了!')
                    return true
                } else {
                    return false
                }
            })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 是否房主
    const [isOwner, setIsOwner] = useState(false)

    // 设定谁先走
    const [playerPiece, setPlayerPiece] = useState(1)
    const [playerRadio, setPlayerRadio] = useState(1)
    function handleSetPlayerRadio(value: number) {
        if (isOwner) {
            setPlayerRadio(value)
            io.emit('changePriority')
        } else {
            message.warn('只有房主才可以选择谁先下棋!')
        }
    }
    useEffect(() => {
        io.on('setPlayerPiece', (isOwnerFirst) => {
            setIsRival((isRival) => {
                if (isRival) {
                    setPlayerPiece(isOwnerFirst ? 2 : 1)
                    setPlayerRadio(isOwnerFirst ? 2 : 1)
                    if (!isOwnerFirst) {
                        setBoard(initBoard)
                        setCurrentPiece(1)
                        setPlayerPiece(1)
                        setIsRivalRunning(false)
                        message.success('轮到你下棋了!')
                    }
                    return true
                } else {
                    return false
                }
            })
        })
    }, [])

    // 非常麻烦的异步判断是否该对手下棋了
    const [lastOne, setLastOne] = useState(-1)
    const [isRivalRunning, setIsRivalRunning] = useState(false)

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

    function emitMessageForRival(prompt?: PromptDict) {
        if (!prompt) {
            prompt = getPromptDict(board, currentPiece)
        }
        if (!prompt) {
            return
        }
        if (prompt.list.length === 0) {
            setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
            setEndCount((endCount) => endCount + 1)
            setIsRivalRunning(false)
            return
        }
        // setTimeout(() => {
        //     if (!prompt) {
        //         return
        //     }
        //     if (prompt.list.length === 0) {
        //         setCurrentPiece((currentPiece) => currentPiece === 1 ? 2 : 1)
        //         setEndCount((endCount) => endCount + 1)
        //         setIsRivalRunning(false)
        //         return
        //     }
        //     // 随机
        //     const _newest = prompt.list[Math.floor(Math.random() * prompt.list.length)]
        //     if (prompt) {
        //         updateBoard(_newest, prompt[_newest.toString()])
        //         setIsRivalRunning(false)
        //         setLastOne(lastOne === 1 ? 2 : 1)
        //     }
        // }, 500)
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
                const newBoard = copy2dArray(board)
                newBoard[_newest[0]][_newest[1]] = currentPiece
                _reversal.forEach((piece) => {
                    newBoard[piece[0]][piece[1]] = currentPiece
                })
                io.emit('updateBoard', roomId, newBoard, _newest, _reversal, currentPiece === 1 ? 2 : 1)
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
        io.emit('setPlayerPiece', roomId, playerRadio === 1)
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
        // 给服务器发送退出消息
        io.emit('exitRoom', roomId)
        // 各种初始化
        initiate()
        setIsRivalRunning(false)
        setIsOwner(false)
        setIsRival(false)
        setIsReady(false)
        setIsBystander(false)
        setPlayerPiece(1)
        setPlayerRadio(1)
        setRoomId(-1)
    }
    // 接受到退出的消息
    useEffect(() => {
        io.on('exitRoomForOwner', () => {
            setIsOwner((isOwner) => {
                if (isOwner) {
                    message.warn('对面玩家退出了游戏!')
                    initiate()
                    setIsRivalRunning(false)
                    setIsRival(false)
                    setIsReady(false)
                    setPlayerPiece(1)
                    setPlayerRadio(1)
                    io.emit('setPlayerPiece', roomId, true)
                    return true
                } else {
                    return false
                }
            })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => {
        io.on('exitRoomForRival', () => {
            setIsRival((isRival) => {
                if (isRival) {
                    message.warn('对面玩家退出了游戏!')
                    initiate()
                    setIsRivalRunning(false)
                    setIsOwner(true)
                    setIsReady(false)
                    setPlayerPiece(1)
                    setPlayerRadio(1)
                    io.emit('setPlayerPiece', roomId, true)
                    return false
                } else {
                    return false
                }
            })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                            <Button onClick={() => io.emit('updateRoomList')} size="large">刷新房间</Button>
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
                                <Button onClick={() => observeRoom(room.id)} size="large" style={{ marginLeft: 16 }}>进入观战</Button>
                                <Button onClick={() => addRoom(room.id)} size="large" style={{ marginLeft: 16 }} disabled={room.isReady}>加入房间</Button>
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
                    {isReady && !isBystander && endCount < 2 ? (isRivalRunning ? <Text type="secondary">对方正在下棋, 请耐心等待...</Text> : <Text type="success">轮到你下棋, 请尽快决定哦~</Text>) : null}
                    {(() => {
                        if (endCount >= 2 && !isBystander) {
                            const black = countPiece(board, 1)
                            const white = countPiece(board, 2)
                            if (black === white) {
                                return <Text type="success">平局!</Text>
                            } else {
                                return <Text type="success">{(black > white && playerPiece === 1) || (black < white && playerPiece === 2) ? '玩家' : '对手'}胜利!</Text>
                            }
                        } else {
                            return <Text type="success">等待时间: {timeCount} 秒</Text>
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