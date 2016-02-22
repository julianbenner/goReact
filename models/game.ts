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
}

export class ClientGame extends Game {
    color: Piece;
}

export class ServerGame extends Game {
    clients: WebSocket[];
    clientWhite: WebSocket;
    clientBlack: WebSocket;
    boardLastHalfMove: Piece[][];
    boardLastMove: Piece[][];
    boardLastMoveTemp: Piece[][];

    constructor(id: number, size: number) {
        super(id, size);
        this.clients = [];
        this.clientWhite = null;
        this.clientBlack = null;
        this.boardLastHalfMove = null;
        this.boardLastMove = null;
    }

    isTheirMove(ws: WebSocket): boolean {
        if (this.turn && this.clientWhite === ws) {
            return true;
        } else if (!this.turn && this.clientBlack === ws) {
            return true;
        }
        return false;
    }

    stringify(ws: WebSocket): string {
        return JSON.stringify({
            id: this.id,
            turn: this.turn,
            board: this.board,
            stats: this.stats,
            lastMove: this.lastMove,
            color: this.clientWhite === ws ? Piece.White : this.clientBlack === ws ? Piece.Black : Piece.Empty
        });
    }

    private addScores(stats: Stats, remove: boolean = false): void {
        const sign = remove ? -1 : 1;
        this.stats.white += stats.white * sign;
        this.stats.black += stats.black * sign;
    }

    /**
     * Performs the move, takes captured stones, checks if KO situation and returns true if valid move
     * @param move
     * @returns {boolean}
     */
    move(move: PiecePosition): boolean {
        this.boardLastMoveTemp = this.boardLastMove;
        this.boardLastMove = this.boardLastHalfMove;
        this.boardLastHalfMove = this.board.getClone();
        
        if (this.board.move(move, this.turn)) {
            const captured1 = this.board.takeCapturedStones(this.turn ? Piece.Black : Piece.White);
            this.addScores(captured1);
            const captured2 = this.board.takeCapturedStones(this.turn ? Piece.White : Piece.Black);
            this.addScores(captured2);

            // prevent KO situation
            if (this.board.equals(this.boardLastMove)) {
                // undo adding captured score
                this.addScores(captured1, true);
                this.addScores(captured2, true);
                // restore last boards
                this.boardLastHalfMove = this.boardLastMove;
                this.boardLastMove = this.boardLastMoveTemp;
                return false;
            }
            
            this.turn = !this.turn;
            this.lastMove = move;
            return true;
        }
        return false;
    }

    pass() {
        this.turn = !this.turn;
    }
}