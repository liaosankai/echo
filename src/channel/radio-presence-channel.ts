import { PresenceChannel, RadioPrivateChannel } from './';

/**
 * This class represents a Radio presence channel.
 */
export class RadioPresenceChannel extends RadioPrivateChannel implements PresenceChannel {

    /**
     * Register a callback to be called anytime the member list changes.
     *
     * @param  {Function} callback
     * @return {object} RadioPresenceChannel
     */
    here(callback: Function): RadioPresenceChannel {
        this.on('presence:subscribed', (members) => {
            callback(members.map(m => m['user_info']));
        });

        return this;
    }

    /**
     * Listen for someone joining the channel.
     *
     * @param  {Function} callback
     * @return {RadioPresenceChannel}
     */
    joining(callback: Function): RadioPresenceChannel {
        this.on('presence:joining', (member) => callback(member['user_info']));

        return this;
    }

    /**
     * Listen for someone leaving the channel.
     *
     * @param  {Function}  callback
     * @return {RadioPresenceChannel}
     */
    leaving(callback: Function): RadioPresenceChannel {
        this.on('presence:leaving', (member) => callback(member['user_info']));

        return this;
    }
}
