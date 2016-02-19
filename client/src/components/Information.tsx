import * as React from 'react';
import * as classnames from 'classnames';

import {Board} from "../../../models/board";
import {Piece} from "../../../models/piece";
import {ClientGame} from "../../../models/game";

interface InformationProps {
    game: ClientGame;
    actions: any;
}

class Information extends React.Component<InformationProps, any> {

    constructor(props, context) {
        super(props, context);
        this.passMove = this.passMove.bind(this);
    }

    passMove() {
        this.props.actions.passMove();
    }

    renderInformation() {
        if (this.props.game === null) return <div>No game loaded</div>;
        return (<div>
            This is game {this.props.game.id}.<br/>
            You are {this.props.game.color === Piece.White ? 'White' : this.props.game.color === Piece.Black ? 'Black' : 'a spectator'}<br />
            {this.props.game.turn ? '○ White' : '● Black'}'s move.<br />
            <button onClick={this.passMove}>Pass</button><br /><br />
            <span id="stats-title">Stats</span><br/>
            <span>Black: {this.props.game.stats.black}</span><br/>
            <span>White: {this.props.game.stats.white}</span><br/>
        </div>);
    }

    render() {
        return (<div id="information">
            {this.renderInformation()}
        </div>);
    }
}

export default Information;