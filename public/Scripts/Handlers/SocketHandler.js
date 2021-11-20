import DataBuffer from "Classes/DataBuffer.js";

function init() {
    const socket = io();
    let buffer = new DataBuffer();
    socket.on('frameData',(data)=>{
        buffer.enqueue(data);
    });
}

export default {
    init
}