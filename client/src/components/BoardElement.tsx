import * as React from 'react';
import * as classnames from 'classnames';

import {Piece} from "../../../models/piece";
import {ClientGame} from "../../../models/game";
import {EndType} from "../../../models/endType";

interface BoardElementProps {
    game: ClientGame;
    actions: any;
}

class BoardElement extends React.Component<BoardElementProps, any> {

    constructor(props, context) {
        super(props, context);
    }

    handleMove(x, y) {
        if (this.props.game.endType === EndType.None) {
            this.props.actions.move({ x, y });
        }
    }

    isLastMove(x, y) {
        const lastMove = this.props.game.lastMove;
        if (lastMove === null) {
            return false;
        } else {
            return lastMove.x === x && lastMove.y === y;
        }
    }

    renderRow(row: Piece[], y: number, srcY: Piece[][]) {
        const rowElements = row.map((piece: Piece, x: number, srcX: Piece[]) => {
            const isCorner = (y === 0 || y === srcY.length - 1) && (x === 0 || x === srcX.length - 1);
            const isEdge = !isCorner && (y === 0 || y === srcY.length - 1 || x === 0 || x === srcX.length - 1);
            const cn = classnames({
                'field': true,
                'field-standard': !isEdge && !isCorner,
                'field-edge': isEdge,
                'field-corner': isCorner,
                'field-black': piece === Piece.Black,
                'field-white': piece === Piece.White,
                'field-lastmove': this.isLastMove(x, y)
            });
            let background = '';
            if (piece === Piece.Black) background += 'url(circle-black.svg),';
            if (piece === Piece.White) background += 'url(circle-white.svg),';
            if (isEdge) {
                background += 'url(empty-edge.svg)';
            } else if (isCorner) {
                background += 'url(empty-corner.svg)';
            } else {
                background += 'url(empty.svg)';
            }
            let rotationDeg = 0;
            if (x === srcX.length - 1) rotationDeg = 90;
            if (y === srcY.length - 1) rotationDeg = 180;
            if (y > 0 && x === 0) rotationDeg = 270;
            const style =  {
                'backgroundImage': background,
                'transform': 'rotate(' + rotationDeg + 'deg)'
            };
            return <a className={cn} style={style} onClick={this.handleMove.bind(this, x, y)} />
        });
        return <div className="row">{rowElements}</div>;
    }

    render() {
        if (this.props.game === null) return <div id="board" />;
        return (<div id="board">
            {this.props.game.board.squares.map((row, y, src) => this.renderRow(row, y, src))}
        </div>);
    }
}

export default BoardElement;