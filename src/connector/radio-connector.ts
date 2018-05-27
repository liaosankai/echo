import {Connector} from './connector';
import {RadioChannel, RadioPresenceChannel, RadioPrivateChannel} from './../channel';

const events = require('events');

/**
 * This class creates a connnector to a Radio server.
 */
export class RadioConnector extends Connector {

    /**
     * The Radio connection instance.
     *
     * @type {object}
     */
    socket: any;

    /**
     * All of the subscribed channel names.
     *
     * @type {any}
     */
    channels: any = {};

    /**
     * Event emitter
     *
     * @type {EventEmitter}
     */
    eventEmitter: any = new events.EventEmitter();

    /**
     * Create a fresh Radio connection.
     *
     * @return void
     */
    connect(): void {
        if (this.options['protocol']) {
            this.socket = new WebSocket(this.options.host, this.options['protocols']);
        } else {
            this.socket = new WebSocket(this.options.host);
        }

        this.extendSocket();

        return this.socket;
    }

    /**
     * Attach event handlers to the socket.
     *
     * @return {void}
     */
    extendSocket(): void {
        // Extend the socket with a queue for events
        this.socket.queue = [];

        // Extend the socket with an emit function (mimic SocketIO API)
        this.socket.emit = (event: string, message: object) => {
            return this.emit(event, message);
        };

        // Add main event handlers
        this.socket.addEventListener('open', () => {
            this.open();
        });

        this.socket.addEventListener('message', (message) => {
            this.receive(message);
        });
    }

    /**
     * Send a packet over the connection.
     *
     * @param  {string} event
     * @param  {object} message
     * @return {void}
     */
    emit(event: string, message: object): void {
        // Stringify the event
        let packet = JSON.stringify({"event": event, "message": message});

        // Queue the packet if the connection isn't ready
        // if (this.socket.readyState !== this.socket.OPEN) {
        // if (isUndefined(this.socket.id)) {
        if (this.socket.id === undefined) {
            this.socket['queue'].push(packet);
            return;
        }

        // Otherwise send immediately
        this.socket.send(packet);
    }

    /**
     * @return {void}
     */
    open(): void {

    }

    /**
     * Handle when the connection is set up successfully.
     *
     * @return {void}
     */
    connection(): void {
        // Send any queued events
        let socket = this.socket;

        // socket['queue'].forEach(function (packet) {
        //     packet = JSON.parse(packet);
        //     packet['message']['socket_id'] = socket.id;
        //     socket.send(JSON.stringify(packet));
        // });

        // Reset the queue
        this.socket.queue = [];

        let eventEmitter = this.eventEmitter;
        eventEmitter.emit('connection');
    }

    /**
     * Handle a message received from the server.
     *
     * @param  {MessageEvent} message
     * @return {void}
     */
    receive(message: MessageEvent): void {
        let connector = this;
        // Pick apart the message to determine where it should go
        let packet = JSON.parse(message.data);

        if (packet.event === 'connection') {
            connector.socket.id = packet['client_id'];
            connector.connection()
        } else if (packet.event === 'subscribe') {

        } else if (packet.event === 'ping') {
            this.emit('pong', {});
        } else {
            throw 'Invalid message received via socket.';
        }
    }

    /**
     * Listen for an event on a channel instance.
     *
     * @param {string} name
     * @param {string} event
     * @param {Function} callback
     * @return {Channel}
     */
    listen(name: string, event: string, callback: Function) {
        return this.channel(name).listen(event, callback);
    }

    /**
     * Get a channel instance by name.
     *
     * @param  {string} name
     * @promise {Promise<RadioChannel>}
     */
    channel(name: string): any {
        let self = this;
        let socket = this.socket;
        let options = this.options;
        let channels = this.channels;
        let eventEmitter = this.eventEmitter;

        return new Promise(function (resolve, reject) {
            if (self.socketId()) {
                if (!channels[name]) {
                    channels[name] = new RadioChannel(
                        socket,
                        name,
                        options
                    );
                }
                channels[name].then(function (response) {
                    resolve(channels[name])
                }).catch(function (response) {
                    reject(response)
                });
            } else {
                eventEmitter.on('connection', function () {
                    channels[name] = new RadioChannel(
                        socket,
                        name,
                        options
                    );
                    channels[name].then(function (response) {
                        resolve(channels[name])
                    }).catch(function (response) {
                        reject(response)
                    });
                })
            }
        });
    }

    /**
     * Get a private channel instance by name.
     *
     * @param {string} name
     * @return {Promise<RadioPrivateChannel>}
     */
    privateChannel(name: string): any {
        let self = this;
        let socket = this.socket;
        let options = this.options;
        let channels = this.channels;
        let eventEmitter = this.eventEmitter;

        return new Promise(function (resolve, reject) {
            if (self.socketId()) {
                if (!channels['private-' + name]) {
                    channels['private-' + name] = new RadioChannel(
                        socket,
                        'private-' + name,
                        options
                    );
                }
                channels['private-' + name].then(function (response) {
                    resolve(channels['private-' + name])
                }).catch(function (response) {
                    reject(response)
                });
            } else {
                eventEmitter.on('connection', function () {
                    channels['private-' + name] = new RadioChannel(
                        socket,
                        'private-' + name,
                        options
                    );
                    channels['private-' + name].then(function (response) {
                        resolve(channels['private-' + name])
                    }).catch(function (response) {
                        reject(response)
                    });
                })
            }
        });
    }

    /**
     * Get a presence channel instance by name.
     *
     * @param {string} name
     * @return {Promise<RadioPresenceChannel>}
     */
    presenceChannel(name: string): any {
        let self = this;
        let socket = this.socket;
        let options = this.options;
        let channels = this.channels;
        let eventEmitter = this.eventEmitter;

        return new Promise(function (resolve, reject) {
            if (self.socketId()) {
                if (!channels['presence-' + name]) {
                    channels['presence-' + name] = new RadioChannel(
                        socket,
                        'presence-' + name,
                        options
                    );
                }
                channels['presence-' + name].then(function (response) {
                    resolve(channels[name])
                }).catch(function (response) {
                    reject(response)
                });
            } else {
                eventEmitter.on('connection', function () {
                    channels['presence-' + name] = new RadioChannel(
                        socket,
                        'presence-' + name,
                        options
                    );
                    channels['presence-' + name].then(function (response) {
                        resolve(channels[name])
                    }).catch(function (response) {
                        reject(response)
                    });
                })
            }
        });
    }

    /**
     * Leave the given channel.
     *
     * @param  {string} name
     * @return {void}
     */
    leave(name: string): void {
        let channels = [name, 'private-' + name, 'presence-' + name];

        channels.forEach(name => {
            if (this.channels[name]) {
                this.channels[name].unsubscribe();

                delete this.channels[name];
            }
        });
    }

    /**
     * Get the socket ID for the connection.
     *
     * @return {string}
     */
    socketId(): string {
        return this.socket.id;
    }

    /**
     * Disconnect radio connection.
     *
     * @return void
     */
    disconnect(): void {
        this.socket.close();
    }
}
