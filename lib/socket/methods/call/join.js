const db = require('../../database');
const { getRoomResponse } = require('../../utils/index');
var xss = require("xss");
sanitizeString = (str) => {
    return xss(str)
}

module.exports = (context, { id, guestName }) => {
    const { socket } = context;
    let connections = {};
    let messages = {};
    let timeOnline = {};
    socket.on('join-call', (path) => {
        if (connections[path] === undefined) {
            connections[path] = [];
        }
        connections[path].push(socket.id);
        timeOnline[socket.id] = new Date();
        for (let a = 0; a < connections[path].length; ++a) {
            socket.nsp.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
        }

        if (messages[path] !== undefined) {
            for (let a = 0; a < messages[path].length; ++a) {
                socket.nsp.to(socket.id).emit("chat-message", messages[path][a]['data'],
                    messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
            }
        }
        console.log(path, connections[path])
    })
    socket.on('signal', (toId, message) => {
        socket.nsp.to(toId).emit('signal', socket.id, message)
    })
    socket.on('chat-message', (data, sender) => {
        data = sanitizeString(data)
        sender = sanitizeString(sender)

        var key
        var ok = false
        for (const [k, v] of Object.entries(connections)) {
            for (let a = 0; a < v.length; ++a) {
                if (v[a] === socket.id) {
                    key = k
                    ok = true
                }
            }
        }

        if (ok === true) {
            if (messages[key] === undefined) {
                messages[key] = []
            }
            messages[key].push({ "sender": sender, "data": data, "socket-id-sender": socket.id })
            console.log("message", key, ":", sender, data)

            for (let a = 0; a < connections[key].length; ++a) {
                socket.nsp.to(connections[key][a]).emit("chat-message", data, sender, socket.id)
            }
        }
    })
    socket.on('disconnect', () => {
        var diffTime = Math.abs(timeOnline[socket.id] - new Date())
        var key
        for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
            for (let a = 0; a < v.length; ++a) {
                if (v[a] === socket.id) {
                    key = k

                    for (let a = 0; a < connections[key].length; ++a) {
                        socket.nsp.to(connections[key][a]).emit("user-left", socket.id)
                    }

                    var index = connections[key].indexOf(socket.id)
                    connections[key].splice(index, 1)

                    console.log(key, socket.id, Math.ceil(diffTime / 1000))

                    if (connections[key].length === 0) {
                        delete connections[key]
                    }
                }
            }
        }
    })
    return {
        connections,
        messages,
        timeOnline
    };
};