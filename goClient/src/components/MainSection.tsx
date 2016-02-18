import * as React from 'react';
import * as classnames from 'classnames';

import {GameState} from "../../../shared/models/game";
import {Board} from "../../../shared/models/board";
import {Piece} from "../../../shared/models/piece";

interface MainSectionProps {
    game: GameState;
    actions: any;
}

class MainSection extends React.Component<MainSectionProps, any> {

    refs: {
        [key: string]: (Element);
        gameId: HTMLInputElement;
        size: HTMLInputElement;
    };

    constructor(props, context) {
        super(props, context);
        this.joinGame = this.joinGame.bind(this);
        this.newGame = this.newGame.bind(this);
    }

    handleMove(x, y) {
        this.props.actions.move({ x, y });
    }

    joinGame() {
        const id = parseInt(this.refs.gameId.value);
        if (id >= 0) {
            this.props.actions.joinGame(id);
        } else {
            alert("Invalid id");
        }
    }

    newGame() {
        const size = parseInt(this.refs.size.value);
        if (size >= 3) {
            this.props.actions.newGame(size);
        } else {
            alert("Invalid size");
        }
    }

    renderBoard(board: Board) {
        return board.squares.map((row: Piece[], y: number) => {
            const rowElements = row.map((piece: Piece, x: number) => {
                const cn = classnames({
                    'field': true,
                    'field-black': piece === Piece.Black,
                    'field-white': piece === Piece.White
                });
                return <a className={cn} onClick={this.handleMove.bind(this, x, y)} />
            });
            return <div className="row">{rowElements}</div>;
        })
    }

    renderGame() {
        if (this.props.game.game === null) return;
        const game = this.props.game.game;
        return (<div>
            This is game {game.id} and it is {game.turn ? 'white' : 'black'}'s move.<br />
            {this.renderBoard(game.board)}
        </div>);
    }

    renderStats() {
        if (this.props.game.game === null) return <div>No game loaded</div>;
        return (<div>
            <span id="stats-title">Stats</span><br/>
            <span>Black: {this.props.game.game.stats.black}</span><br/>
            <span>White: {this.props.game.game.stats.white}</span><br/>
        </div>);
    }

    render() {
        return (
            <section className="main">
                <input ref="size" /><button onClick={this.newGame}>New game</button><br/>
                <input ref="gameId" /><button onClick={this.joinGame}>Join game</button>
                {this.renderGame()}
                {this.renderStats()}
            </section>
    );
    }
}

export default MainSection;