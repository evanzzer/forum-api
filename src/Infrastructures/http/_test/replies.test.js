const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const { getAccessToken, getThreadId, getCommentId, getReplyId } = require('./_threadTestLibrary');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        // Also truncate replies, comments, and threads as they are dependent
        await UsersTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
    });

    describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
        it('should response 401 when no token has been given', async () => {
            // Arrange
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments/comment-123/replies',
            });

            // Assert
            expect(response.statusCode).toEqual(401);
        });

        it('should respond 404 when thread is not found', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken();

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments/comment-123/replies',
                headers: { Authorization: `Bearer ${accessToken}` },
                payload: {
                    content: 'a new content',
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should respond 404 when comment is not found', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken();
            const threadId = await getThreadId();

            // Action
            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadId}/comments/comment-123/replies`,
                headers: { Authorization: `Bearer ${accessToken}` },
                payload: {
                    content: 'a new content',
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should response 400 when request payload not contain valid property', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken();
            const threadId = await getThreadId();
            const commentId = await getCommentId();

            // Action
            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadId}/comments/${commentId}/replies`,
                headers: { Authorization: `Bearer ${accessToken}` },
                payload: {
                    invalid_params: 'not so valid payload',
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
        });

        it('should response 400 when request payload not meet data type specification', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken();
            const threadId = await getThreadId();
            const commentId = await getCommentId();

            // Action
            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadId}/comments/${commentId}/replies`,
                headers: { Authorization: `Bearer ${accessToken}` },
                payload: {
                    content: 1230,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
        });

        it('should response 201 and reply created', async () => {
            // Arrange
            const requestPayload = {
                content: 'a whole new discussion',
            };

            const server = await createServer(container);
            const accessToken = await getAccessToken();
            const threadId = await getThreadId();
            const commentId = await getCommentId();

            // Action
            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadId}/comments/${commentId}/replies`,
                headers: { Authorization: `Bearer ${accessToken}` },
                payload: requestPayload,
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.addedReply).toBeDefined();
        });
    });

    describe('when DELETE /threads/{threadId}/comments/{commentId}/reply/{replyId}', () => {
        it('should response 401 when no token has been given', async () => {
            // Arrange
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123/replies/reply-123',
            });

            // Assert
            expect(response.statusCode).toEqual(401);
        });

        it('should respond 404 when thread is not found', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken();

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123/replies/reply-123',
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should respond 404 when comment is not found', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken();
            const threadId = await getThreadId();

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadId}/comments/comment-123/replies/reply-123`,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should respond 404 when reply is not found', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken();
            const threadId = await getThreadId();
            const commentId = await getCommentId();

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadId}/comments/${commentId}/replies/reply-123`,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should respond 403 when owner reply mismatch', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', thread: 'thread-123', owner: 'user-123' });
            await RepliesTableTestHelper.addReply({
                id: 'reply-123', thread: 'thread-123', comment: 'comment-123', owner: 'user-123',
            });

            const server = await createServer(container);
            const accessToken = await getAccessToken();

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123/replies/reply-123',
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should response 201 and threads created', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken();
            const threadId = await getThreadId();
            const commentId = await getCommentId();
            const replyId = await getReplyId();

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.message).toBeDefined();
        });
    });
});
