import * as React from 'react';
import * as classnames from 'classnames';

import {Board} from "../../../models/board";
import {Piece} from "../../../models/piece";
import {ClientGame} from "../../../models/game";

interface BoardElementProps {
    game: ClientGame;
    actions: any;
}

class BoardElement extends React.Component<BoardElementProps, any> {

    constructor(props, context) {
        super(props, context);
    }

    handleMove(x, y) {
        this.props.actions.move({ x, y });
    }

    isLastMove(x, y) {
        const lastMove = this.props.game.lastMove;
        if (lastMove === null) {
            return false;
        } else {
            return lastMove.x === x && lastMove.y === y;
        }
    }

    renderRow(row: Piece[], y: number) {
        const rowElements = row.map((piece: Piece, x: number) => {
            const cn = classnames({
                'field': true,
                'field-black': piece === Piece.Black,
                'field-white': piece === Piece.White,
                'field-lastmove': this.isLastMove(x, y)
            });
            return <a className={cn} onClick={this.handleMove.bind(this, x, y)} />
        });
        return <div className="row">{rowElements}</div>;
    }

    render() {
        if (this.props.game === null) return <div id="board" />;
        return (<div id="board">{this.props.game.board.squares.map((row, y) => this.renderRow(row, y))}</div>);
    }
}

export default BoardElement;