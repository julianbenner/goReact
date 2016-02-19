export default class WSInstance {
    websocket: WebSocket;

    constructor(url, dispatcher) {
        this.websocket = new WebSocket(`ws://${url}`);

        this.websocket.onmessage = function (event) {
            dispatcher(JSON.parse(event.data));
        }

    }

    postMessage(message) {
        this.websocket.send(
            JSON.stringify(message)
        );
    }

    close() {
        this.websocket.close();
    }

}