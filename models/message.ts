import {PiecePosition} from "./piecePosition";
export enum MessageType {
    NewGame = 1,
    Move = 2,
    Join = 3,
    Pass = 4,
    Resign = 5
}

interface MessageInterface {
    type: MessageType;
}

export interface GameMessageInterface {
    gameId: number;
}

export class Message implements MessageInterface {
    type: MessageType;
}

export class JoinGameMessage extends Message implements GameMessageInterface {
    gameId: number;
}

export class NewGameMessage extends Message {
    size: number;
}

export class PlayerMessage extends Message implements GameMessageInterface {
    gameId: number;
}

export class PassMessage extends PlayerMessage {

}

export class MoveMessage extends PlayerMessage {
    move: PiecePosition;
}

export class ResignMessage extends PlayerMessage {
    
}