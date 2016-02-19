import { combineReducers } from 'redux';

import game from './game';

const rootReducer = combineReducers({
    game: game,
    lastAction: (state=null, action) => action
});

export { rootReducer };