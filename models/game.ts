import {Board} from "./board";
import WebSocket = require('ws');
import {Stats} from "./stats";
import {Piece} from "./piece";
import {PiecePosition} from "./piecePosition";

export interface GameState {
    game?: ClientGame;
}

class Game {
    id: number;
    turn: boolean;
    board: Board;
    stats: Stats;
    lastMove: PiecePosition;

    constructor(id: number, size: number) {
        this.id = id;
        this.turn = true;
        this.board = new Board(size);
        this.stats = new Stats();
        this.lastMove = null;
    }

    move(move: PiecePosition): boolean {
        if (this.board.move(move, this.turn)) {
            const captured1 = this.board.takeCapturedStones(this.turn ? Piece.Black : Piece.White);
            this.stats.white += captured1.white;
            this.stats.black += captured1.black;
            const captured2 = this.board.takeCapturedStones(this.turn ? Piece.White : Piece.Black);
            this.stats.white += captured2.white;
            this.stats.black += captured2.black;
            this.turn = !this.turn;
            this.lastMove = move;
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
            board: this.board,
            stats: this.stats,
            lastMove: this.lastMove
        });
    }
}