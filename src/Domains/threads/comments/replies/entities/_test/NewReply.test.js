const NewReply = require('../NewReply');

describe('NewReply entities', () => {
    it('should throw error when payload does not contain valid property', () => {
        // Arrange
        const payload = {
            notValidPayload: 'not a valid payload',
        };

        // Action and Assert
        expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload does not meet data type specification', () => {
        // Arrange
        const payload = {
            content: true,
        };

        // Action and Assert
        expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create reply entities correctly', () => {
        // Arrange
        const payload = {
            content: 'new sample content',
        };

        // Action
        const reply = new NewReply(payload);

        // Assert
        expect(reply).toBeInstanceOf(NewReply);
        expect(reply.content).toEqual(payload.content);
    });
});
