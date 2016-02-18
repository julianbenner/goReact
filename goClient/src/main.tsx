/// <reference path='../../shared/typings/main.d.ts'/>

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as thunk from 'redux-thunk';

import {
    Store,
    compose,
    createStore,
    bindActionCreators,
    combineReducers,
    applyMiddleware
} from 'redux';
import {
    connect,
    Provider
} from 'react-redux';
import { Action } from 'redux-actions';

import App from './containers/App';
import { rootReducer } from './reducers/rootReducer';
import {NEW_GAME, MOVE, JOIN_GAME} from "./constants/ActionTypes";
import WSInstance from "./util/WSInstance";
import {MessageType, MoveMessage, NewGameMessage, JoinGameMessage} from "../../shared/models/message";
import {receiveGame} from "./actions/game";

const initialState = {};

const finalCreateStore = compose(
    applyMiddleware(thunk)
)(createStore);

const store: Store = finalCreateStore(rootReducer, initialState);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
);

if ('Notification' in window) {
    let _Notification = window['Notification'];
    _Notification.requestPermission();
}

const sock = {
    ws: null,
    URL: 'jbenner.de:3000',
    wsDispatcher: (msg) => {
        const { game } = store.getState();
        return store.dispatch(receiveGame(msg));
    },
    wsListener: () => {
        const { game, lastAction } = store.getState();

        switch (lastAction.type) {
            case NEW_GAME:
                return sock.ws.postMessage({
                    type: MessageType.NewGame,
                    size: lastAction.payload.size
                } as NewGameMessage);
            case JOIN_GAME:
                return sock.ws.postMessage({
                    type: MessageType.Join,
                    gameId: lastAction.payload.id
                } as JoinGameMessage);
            case MOVE:
                return sock.ws.postMessage({
                    type: MessageType.Move,
                    gameId: game.game.id,
                    color: game.game.color,
                    move: lastAction.payload.move
                } as MoveMessage);

            default:
                return;
        }
    },
    startWS: () => {
        if(!!sock.ws){
            sock.ws.close();
        }

        sock.ws = new WSInstance(sock.URL, sock.wsDispatcher);
    }
};

store.subscribe(() => sock.wsListener());

sock.startWS();