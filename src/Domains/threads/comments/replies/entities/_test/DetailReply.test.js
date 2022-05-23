const DetailReply = require('../DetailReply');

describe('DetailReply entities', () => {
    it('should throw error when payload does not contain valid property', () => {
        // Arrange
        const payload = {
            id: 'reply-123',
            content: 'sample reply',
            username: 'user-123',
        };

        // Action and Assert
        expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload does not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 'reply-123',
            content: 'sample reply',
            date: 123,
            username: 'user-123',
            isDeleted: true,
        };

        // Action and Assert
        expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create reply entities correctly when isDeleted is true', () => {
        // Arrange
        const payload = {
            id: 'reply-123',
            content: 'sample reply',
            date: '2021-08-08T07:19:09.775Z',
            username: 'user-123',
            isDeleted: true,
        };

        // Action
        const reply = new DetailReply(payload);

        // Assert
        expect(reply).toBeInstanceOf(DetailReply);
        expect(reply.id).toEqual(payload.id);
        expect(reply.content).toEqual('**balasan telah dihapus**');
        expect(reply.date).toEqual(payload.date);
        expect(reply.username).toEqual(payload.username);
    });

    it('should create reply entities correctly when isDeleted is false', () => {
        // Arrange
        const payload = {
            id: 'reply-123',
            content: 'sample reply',
            date: '2021-08-08T07:19:09.775Z',
            username: 'user-123',
            isDeleted: false,
        };

        // Action
        const reply = new DetailReply(payload);

        // Assert
        expect(reply).toBeInstanceOf(DetailReply);
        expect(reply.id).toEqual(payload.id);
        expect(reply.content).toEqual(payload.content);
        expect(reply.date).toEqual(payload.date);
        expect(reply.username).toEqual(payload.username);
    });
});
