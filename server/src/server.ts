/// <reference path='../../typings/main.d.ts' />

import WebSocket = require('ws');
import {ServerGame} from "../../models/game";
import {Message, MessageType, MoveMessage, NewGameMessage, JoinGameMessage} from "../../models/message";

const port: number = process.env.PORT || 3000;
const WebSocketServer = WebSocket.Server;
const server = new WebSocketServer({ port: port });

const state: ServerGame[] = [];
let gameId = 0;

server.on('connection', ws => {
    ws.on('message', message => {
        handleMessage(message, ws);
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
    })
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
                broadcast(newGame, ws);
                break;
            case MessageType.Join:
                const joinGameMessage = <JoinGameMessage>message;
                const joinGames = state.filter(game => game.id == joinGameMessage.gameId);
                if (joinGames.length === 1) {
                    const game = joinGames[0];
                    if (game.clients.indexOf(ws) === -1) {
                        game.clients.push(ws);
                    }
                    broadcast(game, ws);
                }
                break;
            case MessageType.Move:
                const moveMessage = <MoveMessage>message;
                const games = state.filter(game => game.id === moveMessage.gameId);
                if (games.length === 1) {
                    const game = games[0];
                    game.move(moveMessage.move);
                    broadcast(game, ws);
                }
                break;
        }
    } catch (e) {
        console.error(e.message);
    }
}

function broadcast(game: ServerGame, ws: WebSocket): void {
    game.clients.forEach(client => {
        client.send(game.stringify());
    })
}

console.log('Server is running on port', port);