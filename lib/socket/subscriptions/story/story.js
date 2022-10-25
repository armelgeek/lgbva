const { story } = require('../../methods/story');
const { internalError } = require('../../errors');

module.exports = {
    eventName: 'changeStory',
    handler: async (context, { taskId }) => {
        try {
            const task = await story(context, { taskId });
            console.log('Nouvelle story a estimé', { task });
            return task;
        } catch (err) {
            console.log('Error on story retreive', err);
            throw internalError(err);
        }
    },
};
