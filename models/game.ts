import {ServerBoard, ClientBoard, Board} from "./board";
import WebSocket = require('ws');
import {Stats} from "./stats";
import {Piece} from "./piece";
import {PiecePosition} from "./piecePosition";
import {Square} from "./square";
import {EndType} from "./endType";

export interface GameState {
    game?: ClientGame;
}

class Game {
    id: number;
    turn: boolean;
    board: Board;
    stats: Stats;
    territory: Stats;
    lastMove: PiecePosition;
    endType: EndType;

    constructor(id: number, size: number) {
        this.id = id;
        this.turn = false;
        this.board = new ServerBoard(size);
        this.stats = new Stats();
        this.territory = new Stats();
        this.lastMove = null;
        this.endType = EndType.None;
    }
}

export class ClientGame extends Game {
    board: ClientBoard;
    color: Piece;
}

export class ServerGame extends Game {
    board: ServerBoard;
    clients: WebSocket[];
    clientWhite: WebSocket;
    clientBlack: WebSocket;
    boardLastHalfMove: Square[][];
    boardLastMove: Square[][];
    boardLastMoveTemp: Square[][];
    subsequentPassCount: number;

    constructor(id: number, size: number) {
        super(id, size);
        this.clients = [];
        this.clientWhite = null;
        this.clientBlack = null;
        this.boardLastHalfMove = null;
        this.boardLastMove = null;
        this.subsequentPassCount = 0;
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
        return JSON.stringify(<ClientGame>{
            id: this.id,
            turn: this.turn,
            board: this.board.getClientBoard(),
            stats: this.stats,
            territory: this.territory,
            lastMove: this.lastMove,
            color: this.clientWhite === ws ? Piece.White : this.clientBlack === ws ? Piece.Black : Piece.Empty,
            endType: this.endType
        });
    }

    private addScores(stats: Stats, remove: boolean = false): void {
        const sign = remove ? -1 : 1;
        this.stats.white += stats.white * sign;
        this.stats.black += stats.black * sign;
    }
    
    public resign(): void {
        this.endType = this.turn ? EndType.WhiteResigns : EndType.BlackResigns;
    }

    /**
     * Performs the move, takes captured stones, checks if KO/suicide situation and returns true if valid move
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
            if (this.board.equals(this.boardLastMove) || this.board.equals(this.boardLastHalfMove)) {
                // undo adding captured score
                this.addScores(captured1, true);
                this.addScores(captured2, true);
                // restore last boards
                this.board.squares = this.boardLastHalfMove;
                this.boardLastHalfMove = this.boardLastMove;
                this.boardLastMove = this.boardLastMoveTemp;
                return false;
            }
            
            this.subsequentPassCount = 0;
            this.turn = !this.turn;
            this.lastMove = move;
            this.territory = this.board.getTerritory();
            return true;
        }
        return false;
    }

    pass() {
        this.subsequentPassCount++;
        if (this.subsequentPassCount === 2) {
            this.endType = EndType.DoublePass;
        } else {
            this.turn = !this.turn;
        }
    }
}