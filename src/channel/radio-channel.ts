import {EventFormatter} from './../util';
import {Channel} from './channel';

/**
 * This class represents a Radio channel.
 */
export class RadioChannel extends Channel {

    /**
     * The Radio client instance.
     *
     * @type {any}
     */
    socket: any;

    /**
     * The name of the channel.
     *
     * @type {object}
     */
    name: any;

    /**
     * Channel options.
     *
     * @type {any}
     */
    options: any;

    /**
     * The event formatter.
     *
     * @type {EventFormatter}
     */
    eventFormatter: EventFormatter;

    /**
     * The event callbacks applied to the channel.
     *
     * @type {any}
     */
    events: any = {};

    /**
     * Create a new class instance.
     *
     * @param  {any} socket
     * @param  {string} name
     * @param  {any} options
     */
    constructor(socket: any, name: string, options: any) {
        super();

        this.name = name;
        this.socket = socket;
        this.options = options;
        this.eventFormatter = new EventFormatter(this.options.namespace);

        this.configureReconnector();

        return this.subscribe();

    }

    /**
     * Subscribe to a Radio channel.
     *
     * @return {object}
     */
    subscribe(): any {
        let channel = this;

        return axios.post(this.options.authEndpoint, {
            action: 'subscribe',
            channel_name: channel.name
        }).then(function(){
            return channel;
        })
    }

    /**
     * Unsubscribe from channel and ubind event callbacks.
     *
     * @return {void}
     */
    unsubscribe(): void {
        let channel = this;

        axios.post(this.options.authEndpoint, {
            action: 'unsubscribe',
            channel_name: channel.name
        }).then(function (response) {
            channel.unbind();
            return channel;
        })
    }

    /**
     * Listen for an event on the channel instance.
     *
     * @param  {string} event
     * @param  {Function} callback
     * @return {RadioChannel}
     */
    listen(event: string, callback: Function): RadioChannel {
        this.on(this.eventFormatter.format(event), callback);

        return this;
    }

    /**
     * Bind the channel's socket to an event and store the callback.
     *
     * @param  {string} event
     * @param  {Function} callback
     */
    on(event: string, callback: Function): void {
        let listener = (channel, data) => {
            if (this.name == channel) {
                callback(data);
            }
        };

        this.bind(event, listener);
    }

    /**
     * Attach a 'reconnect' listener and bind the event.
     */
    configureReconnector(): void {
        let listener = () => {
            this.subscribe();
        };

        this.bind('reconnect', listener);
    }

    /**
     * Bind the channel's socket to an event and store the callback.
     *
     * @param  {string}   event
     * @param  {Function} callback
     * @return {void}
     */
    bind(event: string, callback: Function): void {
        this.events[event] = this.events[event] || [];

        this.events[event].push(callback);
    }

    /**
     * Unbind the channel's socket from all stored event callbacks.
     *
     * @return {void}
     */
    unbind(): void {
        Object.keys(this.events).forEach(event => {
            this.events[event].forEach(callback => {
                this.socket.removeEventListener(event, callback);
            });

            delete this.events[event];
        });
    }
}
