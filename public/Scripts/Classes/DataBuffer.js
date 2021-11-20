export default class DataBuffer {

    constructor() {
        if (DataBuffer.instance instanceof DataBuffer ) {
            return DataBuffer.instance;
        }
        this.dataBuffer = [];
        Object.freeze(this);
        DataBuffer.instance = this;
    }
    
    enqueue(data) {
        this.dataBuffer.push(data);
        // console.log(this.dataBuffer.length);
    }

    dequeue() {
        return this.dataBuffer.shift();
    }

    isEmpty() {
        return !this.dataBuffer.length;
    }

    getLength() {
        return this.dataBuffer.length;
    }
}