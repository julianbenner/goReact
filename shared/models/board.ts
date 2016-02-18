import {Piece} from "./piece";
import {PiecePosition} from "./move";
import {Stats} from "./stats";

export class Board {
    squares: Piece[][];
    size: number;

    constructor(size: number) {
        this.size = size;
        this.squares = [];
        for (let i = 0; i < size; i++) {
            this.squares[i] = [];
            for (let j = 0; j < size; j++) {
                this.squares[i][j] = Piece.Empty;
            }
        }
    }

    private isInSizeRange(move: PiecePosition): boolean {
        return (0 <= move.x && move.x < this.size &&
                0 <= move.y && move.y < this.size);
    }

    private getContent(piece: PiecePosition) {
        return this.squares[piece.x][piece.y];
    }

    private isEnemy(piece: PiecePosition, color: Piece): boolean {
        if (!this.isInSizeRange(piece)) {
            return false;
        }
        return this.getContent(piece) === Piece.White && color === Piece.Black || this.getContent(piece) === Piece.Black && color === Piece.White;
    }

    private isCaptured(piece: PiecePosition, alreadyVisited: PiecePosition[], color: Piece): boolean {
        const neighbors: PiecePosition[] = [{x:piece.x-1, y:piece.y},{x:piece.x+1, y:piece.y},{x:piece.x, y:piece.y-1},{x:piece.x, y:piece.y+1}];
        const neighborsCaptured: boolean[] = [false, false, false, false];
        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];
            if (this.isInSizeRange(neighbor)) {
                const neighborPiece = this.getContent(neighbor);
                if (neighborPiece === Piece.Empty) {
                    return false;
                } else if (this.isEnemy(neighbor, color)) {
                    neighborsCaptured[i] = true;
                } else {
                    alreadyVisited.push(piece);
                    const neighborVisited = alreadyVisited.filter(function (visited) { return visited.x === neighbor.x && visited.y === neighbor.y; }).length > 0;
                    neighborsCaptured[i] = neighborVisited ? true : this.isCaptured(neighbor, alreadyVisited, color);
                }
            } else {
                neighborsCaptured[i] = true;
            }
        }
        return neighborsCaptured.filter(neighbor => neighbor === true).length === 4;
    }

    takeCapturedStones(): Stats {
        const capturedStones = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const position = {x: i, y: j};
                const content = this.getContent(position);
                if (content === Piece.Black || content === Piece.White) {
                    if (this.isCaptured(position, [], content)) {
                        capturedStones.push(position);
                    }
                }
            }
        }
        const captured = new Stats();
        capturedStones.forEach(stone => {
            if (this.squares[stone.x][stone.y] === Piece.White) {
                captured.black++;
            } else if (this.squares[stone.x][stone.y] === Piece.Black) {
                captured.white++;
            }
            this.squares[stone.x][stone.y] = Piece.Empty;
        });
        return captured;
    }

    move(move: PiecePosition, color: boolean): boolean {
        if (!this.isInSizeRange(move)) {
            return false;
        }
        if (this.squares[move.y][move.x] !== Piece.Empty) {
            return false;
        }
        this.squares[move.y][move.x] = color ? Piece.White : Piece.Black;
        return true;
    }
}