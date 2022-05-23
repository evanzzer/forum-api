const DetailComment = require('../DetailComment');

describe('DetailComment entities', () => {
    it('should throw error when payload does not contain valid property', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            content: 'sample comment',
            username: 'user-123',
        };

        // Action and Assert
        expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload does not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            content: 'sample comment',
            date: '2021-08-08T07:19:09.775Z',
            username: 'user-123',
            replies: 'some replies',
            isDeleted: 1,
        };

        // Action and Assert
        expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create comment entities correctly when isDeleted is true', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            content: 'sample comment',
            date: '2021-08-08T07:19:09.775Z',
            username: 'user-123',
            isDeleted: true,
        };

        // Action
        const comment = new DetailComment(payload);

        // Assert
        expect(comment).toBeInstanceOf(DetailComment);
        expect(comment.id).toEqual(payload.id);
        expect(comment.content).toEqual('**komentar telah dihapus**');
        expect(comment.date).toEqual(payload.date);
        expect(comment.username).toEqual(payload.username);
    });

    it('should create comment entities correctly when isDeleted is false', () => {
        // Arrange
        const payload = {
            id: 'comment-123',
            content: 'sample comment',
            date: '2021-08-08T07:19:09.775Z',
            username: 'user-123',
            isDeleted: false,
        };

        // Action
        const comment = new DetailComment(payload);

        // Assert
        expect(comment).toBeInstanceOf(DetailComment);
        expect(comment.id).toEqual(payload.id);
        expect(comment.content).toEqual(payload.content);
        expect(comment.date).toEqual(payload.date);
        expect(comment.username).toEqual(payload.username);
    });
});
