import * as React from 'react';
import * as classnames from 'classnames';

import {Board} from "../../../models/board";
import {Piece} from "../../../models/piece";
import {ClientGame} from "../../../models/game";
import {EndType} from "../../../models/endType";

interface InformationProps {
    game: ClientGame;
    actions: any;
}

class Information extends React.Component<InformationProps, any> {

    constructor(props, context) {
        super(props, context);
        this.passMove = this.passMove.bind(this);
        this.renderCurrentStatus = this.renderCurrentStatus.bind(this);
        this.getScore = this.getScore.bind(this);
        this.resign = this.resign.bind(this);
    }

    passMove() {
        this.props.actions.passMove();
    }

    resign() {
        this.props.actions.resign();
    }
    
    getScore(color: boolean) {
        if (color) {
            return this.props.game.territory.white + this.props.game.stats.white + 6.5;
        } else {
            return this.props.game.territory.black + this.props.game.stats.black;
        }
    }
    
    renderCurrentStatus() {
        switch (this.props.game.endType) {
            case EndType.None:
                return <span>You are {this.props.game.color === Piece.White ? 'White' : this.props.game.color === Piece.Black ? 'Black' : 'a spectator'}<br />
                             {this.props.game.turn ? '○ White' : '● Black'}'s move.<br />
                             <button onClick={this.passMove}>Pass</button><button onClick={this.resign}>Resign</button><br /></span>;
            case EndType.DoublePass:
                return <span>Game ended by both players passing. {this.getScore(true) > this.getScore(false) ? 'White' : 'Black'} wins.</span>;
            case EndType.WhiteResigns:
                return <span>Game ended. Black wins by white resigning.</span>;
            case EndType.BlackResigns:
                return <span>Game ended. White wins by black resigning.</span>;
        }
    }

    renderInformation() {
        if (this.props.game === null) return <div>No game loaded</div>;
        return (<div>
            This is game {this.props.game.id}.<br/>
            {this.renderCurrentStatus()}<br />
            <span id="stats-title">Stats</span><br/>
            <span id="stats-captured">Captured</span><br/>
            <span>Black: {this.props.game.stats.black}</span><br/>
            <span>White: {this.props.game.stats.white}</span><br/><br/>
            <span id="stats-territory">Territory</span><br/>
            <span>Black: {this.props.game.territory.black}</span><br/>
            <span>White: {this.props.game.territory.white}</span><br/><br/>
            <span id="stats-territory">Total</span><br/>
            <span>Black: {this.getScore(false)}</span><br/>
            <span>White: {this.getScore(true)}</span>
        </div>);
    }

    render() {
        return (<div id="information">
            {this.renderInformation()}
        </div>);
    }
}

export default Information;