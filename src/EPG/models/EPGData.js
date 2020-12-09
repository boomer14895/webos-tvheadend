/**
 * Created by satadru on 3/30/17.
 */
export default class EPGData {

    constructor() {
        this.channelMap = new Map();
        this.channels = [];

        //new MockDataService().getChannels(this.channels);
        //if (this.data) {
            /*this.data.forEach((values, key) => {
                this.channels.push(key);
                values.forEach((value) => {
                    this.events.push(value);
                });
            });*/
            //this.channels = this.data;
            //this.events = Array.from(this.data.values());
        //}
    }

    getChannel(position) {
        return this.channels[position];
    }

    getEvents(channelPosition) {
        let channel = this.channels[channelPosition];
        let events = channel.getEvents();
        return events
    }

    getEventCount(channelPosition) {
        return this.getEvents(channelPosition).length;
    }

    getEvent(channelPosition, programPosition) {
        let channel = this.channels[channelPosition];
        let events = channel.getEvents();
        return events[programPosition];
    }

    getEventPosition(channelPosition, event) {
        let events = this.channels[channelPosition].getEvents();
        for (let i = 0; i < events.length; i++) {
            if (this.isEventSame(event, events[i])) {
                return i;
            }
        }
    }

    getChannelCount() {
        if (this.channels == null) {
            return 0;
        }
        return this.channels.length;
    }

    isEventSame(event1, event2) {
        if (event1.getStart() == event2.getStart() && event1.getEnd() == event2.getEnd()) {
            return true;
        }
        return false;
    }

    hasData() {
        return this.getChannelCount() > 0;
    }

    update(channels) {
        console.log("updated epg data");
        this.channels = channels;
    }
}