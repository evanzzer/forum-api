const DetailThread = require('../DetailThread');

describe('DetailThread entities', () => {
    it('should throw error when payload does not contain valid property', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            title: 'sample comment',
            username: 'user-123',
        };

        // Action and Assert
        expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload does not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            title: 'a title',
            body: 'a body',
            date: '2021-08-08T07:19:09.775Z',
            username: 1,
        };

        // Action and Assert
        expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create thread entities correctly', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            title: 'a title',
            body: 'a body',
            date: '2021-08-08T07:19:09.775Z',
            username: 'user-123',
        };

        // Action
        const thread = new DetailThread(payload);

        // Assert
        expect(thread).toBeInstanceOf(DetailThread);
        expect(thread.id).toEqual(payload.id);
        expect(thread.title).toEqual(payload.title);
        expect(thread.body).toEqual(payload.body);
        expect(thread.date).toEqual(payload.date);
        expect(thread.username).toEqual(payload.username);
    });
});
