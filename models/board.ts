import {Piece} from "./piece";
import {PiecePosition} from "./piecePosition";
import {Stats} from "./stats";
import {Square} from "./square";

interface TerritoryEvaluation { territoryOf: Piece[]; territorySize: number; }

export abstract class Board {
    public size: number;
}

export class ServerBoard extends Board {
    public squares: Square[][];

    constructor(size: number) {
        super();
        this.size = size;
        this.squares = [];
        for (let i = 0; i < size; i++) {
            this.squares[i] = [];
            for (let j = 0; j < size; j++) {
                this.squares[i][j] = {
                    content: Piece.Empty,
                    visited: false
                };
            }
        }
    }

    /**
     * Resets the visited flag of all intersections, e.g., after territory has been counted
     */
    private resetVisited(): void {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.squares[i][j].visited = false;
            }
        }
    }

    /**
     * Evaluates the current territory of both players
     * @returns {Stats}
     */
    public getTerritory(): Stats {
        const territory = new Stats();

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const square = this.squares[i][j];
                if (!square.visited) {
                    if (square.content === Piece.Empty) {
                        square.visited = true;
                        const territoryEvaluation = this.isPartOfTerritory({x: i, y: j});
                        const territoryColor = ServerBoard.inferTerritory(territoryEvaluation.territoryOf);
                        if (territoryColor === Piece.White) territory.white += territoryEvaluation.territorySize;
                        if (territoryColor === Piece.Black) territory.black += territoryEvaluation.territorySize;
                    }
                }
            }
        }

        this.resetVisited();

        return territory;
    }

    /**
     * Determines whether a territory belongs to a player
     * @param neighborColors
     * @returns {any}
     */
    private static inferTerritory(neighborColors: Piece[]): Piece {
        if (neighborColors.indexOf(Piece.White) !== -1 && neighborColors.indexOf(Piece.Black) === -1) {
            return Piece.White;
        } else if (neighborColors.indexOf(Piece.White) === -1 && neighborColors.indexOf(Piece.Black) !== -1) {
            return Piece.Black;
        }
        return null;
    }

    /**
     * Inspects all yet unvisited neighbors of an intersection and thereby
     * recursively determines the bordering colors of a territory
     * @param piece
     * @returns {{territoryOf: Piece[], territorySize: number}}
     */
    private isPartOfTerritory(piece: PiecePosition): TerritoryEvaluation {
        const neighbors: PiecePosition[] = [{x:piece.x-1, y:piece.y},{x:piece.x+1, y:piece.y},{x:piece.x, y:piece.y-1},{x:piece.x, y:piece.y+1}];
        const neighborColors: Piece[] = [];
        let territorySize = 1;
        neighbors.forEach(neighbor => {
            if (this.isInSizeRange(neighbor)) {
                const square = this.squares[neighbor.x][neighbor.y];
                if (!square.visited) {
                    const content = square.content;
                    if (content !== Piece.Empty) {
                        neighborColors.push(content);
                    } else {
                        square.visited = true;
                        const neighborTerritory = this.isPartOfTerritory(neighbor);
                        neighborTerritory.territoryOf.forEach(a => neighborColors.push(a));
                        territorySize += neighborTerritory.territorySize;
                    }
                }
            }
        });
        return {
            territoryOf: neighborColors,
            territorySize: territorySize
        };
    }

    private isInSizeRange(move: PiecePosition): boolean {
        return (0 <= move.x && move.x < this.size &&
        0 <= move.y && move.y < this.size);
    }

    private getContent(piece: PiecePosition): Piece {
        return this.squares[piece.x][piece.y].content;
    }

    private isEnemy(piece: PiecePosition, color: Piece): boolean {
        if (!this.isInSizeRange(piece)) {
            return false;
        }
        return this.getContent(piece) === Piece.White && color === Piece.Black || this.getContent(piece) === Piece.Black && color === Piece.White;
    }

    private isCaptured(piece: PiecePosition, color: Piece): boolean {
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
                    this.squares[piece.x][piece.y].visited = true;
                    const neighborVisited = this.squares[neighbor.x][neighbor.y].visited;
                    neighborsCaptured[i] = neighborVisited ? true : this.isCaptured(neighbor, color);
                }
            } else {
                neighborsCaptured[i] = true;
            }
        }
        return neighborsCaptured.filter(neighbor => neighbor === true).length === 4;
    }

    /**
     * Removes the stones that are captured
     * @param color Remove only stones of this color
     * @returns {Stats} How many stones were captured
     */
    public takeCapturedStones(color: Piece): Stats {
        const capturedStones = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const position = {x: i, y: j};
                const content = this.getContent(position);
                if (content === color) {
                    if (this.isCaptured(position, content)) {
                        capturedStones.push(position);
                    }
                }
            }
        }
        this.resetVisited();
        const captured = new Stats();
        capturedStones.forEach(stone => {
            if (this.squares[stone.x][stone.y].content === Piece.White) {
                captured.black++;
            } else if (this.squares[stone.x][stone.y].content === Piece.Black) {
                captured.white++;
            }
            this.squares[stone.x][stone.y].content = Piece.Empty;
        });
        return captured;
    }

    public move(move: PiecePosition, color: boolean): boolean {
        if (!this.isInSizeRange(move)) {
            return false;
        }
        if (this.squares[move.y][move.x].content !== Piece.Empty) {
            return false;
        }
        this.squares[move.y][move.x].content = color ? Piece.White : Piece.Black;
        return true;
    }

    public getClone(): Square[][] {
        const clone = [];
        for (let i = 0; i < this.size; i++) {
            clone[i] = [];
            for (let j = 0; j < this.size; j++) {
                clone[i][j] = {};
                clone[i][j].content = this.squares[i][j].content;
            }
        }
        return clone;
    }

    public equals(squares: Square[][]): boolean {
        if (squares === null) {
            return false;
        }
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (squares[i][j].content !== this.squares[i][j].content) {
                    return false;
                }
            }
        }
        return true;
    }

    public getClientBoard(): ClientBoard {
        return {
            squares: this.squares.map((row: Square[]) => row.map((square: Square) => square.content)),
            size: this.size
        };
    }
}

export class ClientBoard extends Board {
    squares: Piece[][];
}