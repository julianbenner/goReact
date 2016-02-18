import {Board} from "./board";
import WebSocket = require('ws');
import {Stats} from "./stats";

export interface GameState {
    game?: ClientGame;
}

class Game {
    id: number;
    turn: boolean;
    board: Board;
    stats: Stats;

    constructor(id: number, size: number) {
        this.id = id;
        this.turn = true;
        this.board = new Board(size);
        this.stats = new Stats();
    }

    move(move: {x:number,y:number}): boolean {
        if (this.board.move(move, this.turn)) {
            const captured = this.board.takeCapturedStones();
            this.stats.white += captured.white;
            this.stats.black += captured.black;
            this.turn = !this.turn;
            return true;
        }
        return false;
    }
}

export class ClientGame extends Game {

}

export class ServerGame extends Game {
    clients: WebSocket[];

    constructor(id: number, size: number) {
        super(id, size);
        this.clients = [];
    }

    stringify(): string {
        return JSON.stringify({
            id: this.id,
            turn: this.turn,
            board: this.board
        });
    }
}