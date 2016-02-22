import { handleActions, Action } from 'redux-actions';

import {ClientGame, GameState} from '../../../models/game';
import {
    NEW_GAME, RECEIVE_GAME, MOVE, JOIN_GAME
} from '../constants/ActionTypes';
import {Piece} from "../../../models/piece";

const initialState = <GameState>{
    game: null
};

export default handleActions<GameState>({
    [NEW_GAME]: (state: GameState, action: Action): GameState => {
        return state;
    },
    [JOIN_GAME]: (state: GameState, action: Action): GameState => {
        return state;
    },
    [MOVE]: (state: GameState, action: Action): GameState => {
        return state;
    },
    [RECEIVE_GAME]: (state: GameState, action: Action): GameState => {
        const newGame = <ClientGame>action.payload.game;
        if (newGame !== null) {
            if (newGame.turn && newGame.color === Piece.White || !newGame.turn && newGame.color === Piece.Black) {
                if ('Notification' in window) {
                    let _Notification = window['Notification'];
                    if (_Notification.permission === 'granted') {
                        const color = newGame.turn ? './white.png' : './black.png';
                        const options = {
                            body: 'It\'s your turn!',
                            icon: color
                        };
                        const n = new _Notification('Go', options);
                        setTimeout(n.close.bind(n), 5000);
                    }
                }
            }
        }
        return {
            game: <ClientGame>action.payload.game
        };
    }
}, initialState);