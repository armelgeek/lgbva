const { getRoomResponse } = require('../../utils');
const { notFoundError } = require('../../errors');

module.exports = (context, { taskId }) => {
    const { socket } = context;

    return taskId;
};