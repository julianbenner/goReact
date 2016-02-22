import * as React from 'react';

import BoardElement from './BoardElement.tsx';
import Information from './Information.tsx';

import {GameState} from '../../../models/game';

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

    render() {
        return (
            <section className="main">
                <div id="game">
                    <BoardElement game={this.props.game.game} actions={this.props.actions} />
                    <div id="game-right">
                        <Information game={this.props.game.game} actions={this.props.actions} />
                        <div id="game-inputs">
                            <input placeholder="Board size" ref="size" /><button onClick={this.newGame}>New game</button><br/>
                            <input placeholder="Game ID" ref="gameId" /><button onClick={this.joinGame}>Join game</button>
                        </div>
                    </div>
                </div>
            </section>
    );
    }
}

export default MainSection;