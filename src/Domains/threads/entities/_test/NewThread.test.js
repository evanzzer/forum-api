const NewThread = require('../NewThread');

describe('NewThread entities', () => {
    it('should throw error when payload does not contain valid property', () => {
        // Arrange
        const payload = {
            title: 'sample thread',
        };

        // Action and Assert
        expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload does not meet data type specification', () => {
        // Arrange
        const payload = {
            title: 'sample thread',
            body: true,
        };

        // Action and Assert
        expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create Thread entities correctly', () => {
        // Arrange
        const payload = {
            title: 'sample thread',
            body: 'new thread body topics',
        };

        // Action
        const thread = new NewThread(payload);

        // Assert
        expect(thread).toBeInstanceOf(NewThread);
        expect(thread.title).toEqual(payload.title);
        expect(thread.body).toEqual(payload.body);
    });
});
