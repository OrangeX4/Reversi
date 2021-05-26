import { useState } from 'react'
import { isIn, getPromptDict } from '../utils'
import '../css/board.css'

interface Props {
    board: number[][],
    current: number,
    newest?: number[],
    reversal?: number[][],
    isEnd?: boolean,
    onClickPrompt?: (newest: number[], reversal: number[][]) => void
}

function Board(props: Props) {
    // 可翻转预测
    const [predictReversal, setPredictReversal] = useState([] as number[][])

    // Get class of piece
    function getClass(i: number, j: number) {
        return (props.reversal && isIn([i, j], props.reversal) ? 'reversal' : '')
            + ' ' + (props.newest && i === props.newest[0] && j === props.newest[1] ? 'newest' : '')
            + ' ' + (predictReversal && isIn([i, j], predictReversal) ? 'predict' : '')
    }

    const prompt = getPromptDict(props.board, props.current)

    if (!props.isEnd && prompt.list.length === 0) {
        if (props.onClickPrompt) {
            props.onClickPrompt([-1, -1], [])
        }
    }

    function handleClick(i: number, j: number) {
        if (isIn([i, j], prompt.list) && props.onClickPrompt) {
            props.onClickPrompt([i, j], prompt[[i, j].toString()])
            if (predictReversal.length > 0) {
                setPredictReversal([])
            }
        }
    }

    function handleMouseEnter(i: number, j: number) {
        if (isIn([i, j], prompt.list)) {
            setPredictReversal(prompt[[i, j].toString()])
        }
    }

    function handleMouseLeave() {
        if (predictReversal.length > 0) {
            setPredictReversal([])
        }
    }

    const board = props.board.map((line, i) => <tr key={i}>
        {
            line.map((piece, j) => {
                switch (piece) {
                    case 1:
                        return (
                            <td className={"bg" + (i + j) % 2} key={j}>
                                <div className={`black ${getClass(i, j)}`} />
                            </td>
                        )
                    case 2:
                        return (
                            <td className={"bg" + (i + j) % 2} key={j}>
                                <div className={`white ${getClass(i, j)}`} />
                            </td>
                        )
                    default:
                        return (
                            <td className={"bg" + (i + j) % 2} key={j}
                                onMouseEnter={() => handleMouseEnter(i, j)}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => handleClick(i, j)}>
                                <div className={isIn([i, j], prompt.list) ? 'prompt' : ''}></div>
                            </td>
                        )
                }
            })
        }
    </tr>)


    return (
        <div id="chessboard">
            <table>
                <tbody>
                    {board}
                </tbody>
            </table>
        </div>
    )
}

export default Board