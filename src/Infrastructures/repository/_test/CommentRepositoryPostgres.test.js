// Database Test Helpers
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

// Domains
const NewComment = require('../../../Domains/threads/comments/entities/NewComment');
const CreatedComment = require('../../../Domains/threads/comments/entities/CreatedComment');
const DetailComment = require('../../../Domains/threads/comments/entities/DetailComment');

// Exceptions
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

// Misc
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
    beforeEach(async () => {
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    });

    afterEach(async () => {
        // Also truncate replies, comments, and threads as they are dependent
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addComment function', () => {
        it('should add comment correctly', async () => {
            // Arrange
            const newComment = new NewComment({
                content: 'some content',
            });
            const fakeIdGenerator = () => '123';
            const mockUserId = 'user-123';
            const mockThreadId = 'thread-123';
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            const createdComment = await commentRepositoryPostgres.addComment(
                mockUserId, mockThreadId, newComment,
            );

            // Assert
            const comment = await CommentsTableTestHelper.findCommentById('comment-123');
            expect(comment).toHaveLength(1);
            expect(createdComment).toStrictEqual(new CreatedComment({
                id: 'comment-123',
                content: 'some content',
                owner: 'user-123',
            }));
        });
    });

    describe('addLikes function', () => {
        it('should add likes correctly', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({
                id: 'comment-123', thread: 'thread-123', owner: 'user-123',
            });
            const fakeIdGenerator = () => '123';
            const mockUserId = 'user-123';
            const mockCommentId = 'comment-123';
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            await commentRepositoryPostgres.addLikes(mockCommentId, mockUserId);

            // Assert
            const comment = await LikesTableTestHelper.findLikeById('likes-123');
            expect(comment).toHaveLength(1);
        });
    });

    describe('verifyCommentExists function', () => {
        it('should throw NotFoundError when comment is not exist', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(commentRepositoryPostgres.verifyCommentExists('not-exist')).rejects.toThrowError(NotFoundError);
        });

        it('should not throw NotFoundError when comment is not exist', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({ id: 'comment-123', thread: 'thread-123', owner: 'user-123' });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(commentRepositoryPostgres.verifyCommentExists('comment-123')).resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('verifyCommentOwner function', () => {
        it('should throw NotFoundError when comment is not exist', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(commentRepositoryPostgres.verifyCommentOwner('not-exist', 'not-exist'))
                .rejects.toThrowError(NotFoundError);
        });

        it('should throw AuthorizationError when owner is different', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({ id: 'comment-123', thread: 'thread-123', owner: 'user-123' });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'wrong-owner'))
                .rejects.toThrowError(AuthorizationError);
        });

        it('should not throw error when request is valid', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({ id: 'comment-123', thread: 'thread-123', owner: 'user-123' });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
                .resolves.not.toThrowError(AuthorizationError);
            await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
                .resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('isLiked function', () => {
        it('should return false when like is not exist', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action
            const result = await commentRepositoryPostgres.isLiked('comment-123', 'user-123');

            // Assert
            expect(result).toEqual(false);
        });

        it('should return true when like exists', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({ id: 'comment-123', thread: 'thread-123', owner: 'user-123' });
            await LikesTableTestHelper.addLikes({ id: 'likes-123', comment: 'comment-123', owner: 'user-123' });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action
            const result = await commentRepositoryPostgres.isLiked('comment-123', 'user-123');

            // Assert
            expect(result).toEqual(true);
        });
    });

    describe('getCommentDetails function', () => {
        it('should return correct syntax when thread has no comments', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action
            const result = await commentRepositoryPostgres.getCommentDetails('thread-123');

            // Assert
            expect(result).toHaveLength(0);
        });

        it('should return correct syntax when thread has comments', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({ id: 'comment-123', thread: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({
                id: 'comment-456', thread: 'thread-123', owner: 'user-123', isDelete: true,
            });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action
            const result = await commentRepositoryPostgres.getCommentDetails('thread-123');

            // Assert
            expect(result).toHaveLength(2);
            result.forEach((comment) => {
                expect(comment).toBeInstanceOf(DetailComment);
            });
        });
    });

    describe('getCommentLikes function', () => {
        it('should return 0 when no existing likes were found in the comment', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({ id: 'comment-123', thread: 'thread-123', owner: 'user-123' });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action
            const result = await commentRepositoryPostgres.getCommentLikes('comment-123');

            // Assert
            expect(result).toEqual(0);
        });

        it('should return 2 when there are 2 likes found in the comment', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({ id: 'comment-123', thread: 'thread-123', owner: 'user-123' });
            await UsersTableTestHelper.addUser({ id: 'user-456', username: 'dummy', fullname: 'dummy' });
            await LikesTableTestHelper.addLikes({ id: 'likes-123', comment: 'comment-123', owner: 'user-123' });
            await LikesTableTestHelper.addLikes({ id: 'likes-456', comment: 'comment-123', owner: 'user-456' });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action
            const result = await commentRepositoryPostgres.getCommentLikes('comment-123');

            // Assert
            expect(result).toEqual(2);
        });
    });

    describe('deleteCommentById function', () => {
        it('should successfully update deleted comment', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({ id: 'comment-123', thread: 'thread-123', owner: 'user-123' });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action
            await commentRepositoryPostgres.deleteCommentById('comment-123', 'user-123');

            // Assert
            const comment = await CommentsTableTestHelper.findCommentById('comment-123');
            expect(comment[0].is_delete).toEqual(true);
        });
    });

    describe('deleteLikes function', () => {
        it('should delete likes correctly', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({
                id: 'comment-123', thread: 'thread-123', owner: 'user-123',
            });
            await LikesTableTestHelper.addLikes({
                id: 'likes-123', comment: 'comment-123', owner: 'user-123',
            });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Action
            await commentRepositoryPostgres.deleteLikes('comment-123', 'user-123');

            // Assert
            const comment = await LikesTableTestHelper.findLikeById('likes-123');
            expect(comment).toHaveLength(0);
        });
    });
});
