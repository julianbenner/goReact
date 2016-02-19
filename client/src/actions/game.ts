import { createAction } from 'redux-actions';

import {GameState} from '../../../models/game';
import * as types from '../constants/ActionTypes';

const receiveGame = createAction<GameState>(
    types.RECEIVE_GAME,
    (game) => ({game})
);

const newGame = createAction<GameState>(
    types.NEW_GAME,
    (size) => ({ size })
);

const joinGame = createAction<GameState>(
    types.JOIN_GAME,
    (id) => ({ id })
);

const move = createAction<GameState>(
    types.MOVE,
    (move) => ({ move })
);

const passMove = createAction<GameState>(
    types.PASS,
    () => ({ })
);

export {
    newGame,
    joinGame,
    receiveGame,
    move,
    passMove
}