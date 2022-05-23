const NewComment = require('../NewComment');

describe('NewComment entities', () => {
    it('should throw error when payload does not contain valid property', () => {
        // Arrange
        const payload = {
            notValidPayload: 'not a valid payload',
        };

        // Action and Assert
        expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload does not meet data type specification', () => {
        // Arrange
        const payload = {
            content: true,
        };

        // Action and Assert
        expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create Comment entities correctly', () => {
        // Arrange
        const payload = {
            content: 'new sample content',
        };

        // Action
        const comment = new NewComment(payload);

        // Assert
        expect(comment).toBeInstanceOf(NewComment);
        expect(comment.content).toEqual(payload.content);
    });
});
