const CreatedComment = require('../CreatedComment');

describe('CreatedComment entities', () => {
    it('should throw error when payload does not contain valid property', () => {
        // Arrange
        const payload = {
            content: 'sample comment',
        };

        // Action and Assert
        expect(() => new CreatedComment(payload)).toThrowError('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload does not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            content: 'sample comment',
            owner: true,
        };

        // Action and Assert
        expect(() => new CreatedComment(payload)).toThrowError('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create Comment entities correctly', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            content: 'sample comment',
            owner: 'user-123',
        };

        // Action
        const comment = new CreatedComment(payload);

        // Assert
        expect(comment).toBeInstanceOf(CreatedComment);
        expect(comment.id).toEqual(payload.id);
        expect(comment.content).toEqual(payload.content);
        expect(comment.owner).toEqual(payload.owner);
    });
});
