// Database Test Helpers
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

// Domains
const NewReply = require('../../../Domains/threads/comments/replies/entities/NewReply');
const CreatedReply = require('../../../Domains/threads/comments/replies/entities/CreatedReply');
const DetailReply = require('../../../Domains/threads/comments/replies/entities/DetailReply');

// Exceptions
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

// Misc
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
    beforeEach(async () => {
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
        await CommentsTableTestHelper.addComment({ id: 'comment-123', thread: 'thread-123', owner: 'user-123' });
    });

    afterEach(async () => {
        // Also truncate replies, comments, and threads as they are dependent
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addReply function', () => {
        it('should add reply correctly', async () => {
            // Arrange
            const newReply = new NewReply({
                content: 'some content',
            });
            const fakeIdGenerator = () => '123';
            const mockUserId = 'user-123';
            const mockThreadId = 'thread-123';
            const mockCommentId = 'comment-123';
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            const createdReply = await replyRepositoryPostgres.addReply(
                mockUserId, mockThreadId, mockCommentId, newReply,
            );

            // Assert
            const reply = await RepliesTableTestHelper.findReplyById('reply-123');
            expect(reply).toHaveLength(1);
            expect(createdReply).toStrictEqual(new CreatedReply({
                id: 'reply-123',
                content: 'some content',
                owner: 'user-123',
            }));
        });
    });

    describe('verifyReplyExists function', () => {
        it('should throw NotFoundError when reply is not exist', async () => {
            // Arrange
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(replyRepositoryPostgres.verifyReplyExists('not-exist')).rejects.toThrowError(NotFoundError);
        });

        it('should not throw NotFoundError when reply is not exist', async () => {
            // Arrange
            await RepliesTableTestHelper.addReply({
                id: 'reply-123', thread: 'thread-123', comment: 'comment-123', user: 'user-123',
            });
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(replyRepositoryPostgres.verifyReplyExists('reply-123')).resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('verifyReplyOwner function', () => {
        it('should throw NotFoundError when reply is not exist', async () => {
            // Arrange
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(replyRepositoryPostgres.verifyReplyOwner('not-exist', 'not-exist'))
                .rejects.toThrowError(NotFoundError);
        });

        it('should throw AuthorizationError when owner is different', async () => {
            // Arrange
            await RepliesTableTestHelper.addReply({
                id: 'reply-123', thread: 'thread-123', comment: 'comment-123', user: 'user-123',
            });
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'wrong-owner'))
                .rejects.toThrowError(AuthorizationError);
        });

        it('should not throw error when request is valid', async () => {
            // Arrange
            await RepliesTableTestHelper.addReply({
                id: 'reply-123', thread: 'thread-123', comment: 'comment-123', user: 'user-123',
            });
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
                .resolves.not.toThrowError(AuthorizationError);
            await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
                .resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('getReplyFunction function', () => {
        it('should return correct syntax when comment has no replies', async () => {
            // Arrange
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            // Action
            const result = await replyRepositoryPostgres.getReplyDetails('thread-123', 'comment-123');

            // Assert
            expect(result).toHaveLength(0);
        });

        it('should return correct syntax when comment has replies', async () => {
            // Arrange
            await RepliesTableTestHelper.addReply({
                id: 'reply-123', thread: 'thread-123', comment: 'comment-123', owner: 'user-123',
            });
            await RepliesTableTestHelper.addReply({
                id: 'reply-456', thread: 'thread-123', comment: 'comment-123', owner: 'user-123', isDelete: true,
            });
            // Arrange
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            // Action
            const result = await replyRepositoryPostgres.getReplyDetails('thread-123', 'comment-123');

            // Assert
            expect(result).toHaveLength(2);
            result.forEach((reply) => {
                expect(reply).toBeInstanceOf(DetailReply);
            });
        });
    });

    describe('deleteReplyById function', () => {
        it('should successfully update deleted reply', async () => {
            // Arrange
            await RepliesTableTestHelper.addReply({
                id: 'reply-123', thread: 'thread-123', comment: 'comment-123', user: 'user-123',
            });
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            // Action
            await replyRepositoryPostgres.deleteReplyById('reply-123', 'user-123');

            // Assert
            const reply = await RepliesTableTestHelper.findReplyById('reply-123');
            expect(reply[0].is_delete).toEqual(true);
        });
    });
});
