import { RadioChannel } from './';

/**
 * This class represents a Radio presence channel.
 */
export class RadioPrivateChannel extends RadioChannel {

    /**
     * Trigger client event on the channel.
     *
     * @param  {string}  eventName
     * @param  {object}  data
     * @return {PusherPrivateChannel}
     */
    whisper(eventName, data) {
        this.socket.emit('client event', {
            channel: this.name,
            event: `client-${eventName}`,
            data: data
        });

        return this;
    }
}
