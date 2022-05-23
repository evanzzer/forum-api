const CreatedReply = require('../CreatedReply');

describe('CreatedReply entities', () => {
    it('should throw error when payload does not contain valid property', () => {
        // Arrange
        const payload = {
            content: 'sample reply',
        };

        // Action and Assert
        expect(() => new CreatedReply(payload)).toThrowError('CREATED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload does not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 'reply-123',
            content: 'sample reply',
            owner: true,
        };

        // Action and Assert
        expect(() => new CreatedReply(payload)).toThrowError('CREATED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create reply entities correctly', () => {
        // Arrange
        const payload = {
            id: 'reply-123',
            content: 'sample reply',
            owner: 'user-123',
        };

        // Action
        const reply = new CreatedReply(payload);

        // Assert
        expect(reply).toBeInstanceOf(CreatedReply);
        expect(reply.id).toEqual(payload.id);
        expect(reply.content).toEqual(payload.content);
        expect(reply.owner).toEqual(payload.owner);
    });
});
