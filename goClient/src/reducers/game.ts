import { assign } from 'lodash';
import { handleActions, Action } from 'redux-actions';

import {ClientGame, GameState} from '../../../shared/models/game';
import {
    NEW_GAME, RECEIVE_GAME, MOVE, JOIN_GAME
} from '../constants/ActionTypes';

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
        if('Notification' in window){
            let _Notification = window['Notification'];
            if (_Notification.permission === 'granted') {
                new _Notification('A move has been made!');
            }
        }
        return state;
    },
    [RECEIVE_GAME]: (state: GameState, action: Action): GameState => {
        return {
            game: <ClientGame>action.payload.game
        };
    }
}, initialState);