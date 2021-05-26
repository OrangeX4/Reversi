import { isIn, getPromptDict } from '../utils'
import '../css/board.css'

interface Props {
    board: number[][],
    current: number,
    newest?: number[],
    reversal?: number[][],
}

function Board(props: Props) {

    // Get class of piece
    function getClass(i: number, j: number) {
        return (props.reversal && isIn([i, j], props.reversal) ? 'reversal' : '')
        + ' ' + (props.newest && i === props.newest[0] && j === props.newest[1] ? 'newest' : '')
    }

    const prompt = getPromptDict(props.board, props.current)
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
                                <div className={`white ${getClass(i, j)}` } />
                            </td>
                        )
                    default:
                        return (
                            <td className={"bg" + (i + j) % 2} key={j}>
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