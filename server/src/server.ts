/// <reference path='../../typings/main.d.ts' />

import WebSocket = require('ws');
import {ServerGame} from "../../models/game";
import {
    Message, MessageType, MoveMessage, NewGameMessage, JoinGameMessage, PassMessage,
    GameMessageInterface, ResignMessage
} from "../../models/message";

const port: number = process.env.PORT || 3000;
const WebSocketServer = WebSocket.Server;
const server = new WebSocketServer({ port: port });

const state: ServerGame[] = [];
let gameId = 0;

server.on('connection', ws => {
    ws.on('message', message => {
        handleMessage(<string>message, ws);
    });

    ws.on('close', () => {
        removeSocketFromGames(ws);
    });
});

function removeSocketFromGames(ws: WebSocket) {
    state.forEach((game: ServerGame) => {
        const index = game.clients.indexOf(ws);
        if (index > -1) {
            game.clients.splice(index, 1);
        }
        if (game.clientBlack === ws) game.clientBlack = null;
        if (game.clientWhite === ws) game.clientWhite = null;
    })
}

function getGameOfMessage(message: GameMessageInterface): ServerGame {
    const games = state.filter(game => game.id === message.gameId);
    if (games.length === 1) {
        return games[0];
    } else {
        throw "No game found!";
    }
}

function handleMessage(messageString: string, ws: WebSocket) {
    try {
        const message:Message = JSON.parse(messageString);
        switch (message.type) {
            default:
            case MessageType.NewGame:
                const newGameMessage = <NewGameMessage>message;
                const newGame = new ServerGame(gameId++, newGameMessage.size);
                state.push(newGame);
                newGame.clients.push(ws);
                newGame.clientBlack = ws;
                broadcast(newGame, ws);
                break;
            case MessageType.Join:
                const joinGameMessage = <JoinGameMessage>message;
                const joinGame = getGameOfMessage(joinGameMessage);
                if (joinGame.clients.indexOf(ws) === -1) {
                    joinGame.clients.push(ws);
                    if (joinGame.clientBlack === null) {
                        joinGame.clientBlack = ws;
                    } else if (joinGame.clientWhite === null) {
                        joinGame.clientWhite = ws;
                    }
                }
                broadcast(joinGame, ws);
                break;
            case MessageType.Move:
                const moveMessage = <MoveMessage>message;
                const moveGame = getGameOfMessage(moveMessage);
                if (moveGame.isTheirMove(ws)) {
                    moveGame.move(moveMessage.move);
                    broadcast(moveGame, ws);
                }
                break;
            case MessageType.Pass:
                const passMessage = <PassMessage>message;
                const passGame = getGameOfMessage(passMessage);
                if (passGame.isTheirMove(ws)) {
                    passGame.pass();
                    broadcast(passGame, ws);
                }
                break;
            case MessageType.Resign:
                handleResignMessage(<ResignMessage>message, ws);
                break;
        }
    } catch (e) {
        console.error(e.stack);
    }
}

function handleResignMessage(message: ResignMessage, ws: WebSocket): void {
    const game = getGameOfMessage(message);
    if (game.isTheirMove(ws)) {
        game.resign();
        broadcast(game, ws);
    }
}

function broadcast(game: ServerGame, ws: WebSocket): void {
    game.clients.forEach(client => {
        client.send(game.stringify(client));
    })
}

console.log('Server is running on port', port);