const CreatedThread = require('../CreatedThread');

describe('CreatedThread entities', () => {
    it('should throw error when payload does not contain valid property', () => {
        // Arrange
        const payload = {
            title: 'sample thread',
        };

        // Action and Assert
        expect(() => new CreatedThread(payload)).toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload does not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            title: 'sample thread',
            owner: true,
        };

        // Action and Assert
        expect(() => new CreatedThread(payload)).toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create Thread entities correctly', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            title: 'sample thread',
            owner: 'user-123',
        };

        // Action
        const thread = new CreatedThread(payload);

        // Assert
        expect(thread).toBeInstanceOf(CreatedThread);
        expect(thread.id).toEqual(payload.id);
        expect(thread.title).toEqual(payload.title);
        expect(thread.owner).toEqual(payload.owner);
    });
});
