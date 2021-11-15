
function init() {
    const socket = io();
    socket.on('looBaloo',(data)=>console.log(`${data.objective} ${data.count} ${data.item} pleasee`));
}

export default {
    init
}