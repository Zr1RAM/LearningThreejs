
function init() {
    const socket = io();
    socket.on('MapLanes',(data)=>console.log('row data is ' + data));
}

export default {
    init
}