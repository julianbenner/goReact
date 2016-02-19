import {PiecePosition} from "./piecePosition";
export enum MessageType {
    NewGame = 1,
    Move = 2,
    Join = 3
}

interface MessageInterface {
    type: MessageType;
}

export class Message implements MessageInterface {
    type: MessageType;
}

export class JoinGameMessage extends Message {
    gameId: number;
}

export class NewGameMessage extends Message {
    size: number;
}

export class PlayerMessage extends Message {
    gameId: number;
    color: boolean;
}

export class MoveMessage extends PlayerMessage {
    move: PiecePosition;
}