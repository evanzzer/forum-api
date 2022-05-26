const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const { getAccessToken, getThreadId, getCommentId, insertLikes } = require('./_threadTestLibrary');

describe('/threads/{threadId}/comments endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        // Also truncate replies, comments, and threads as they are dependent
        await UsersTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
    });

    describe('when POST /threads/{threadId}/comments', () => {
        it('should response 401 when no token has been given', async () => {
            // Arrange
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments',
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
                url: '/threads/thread-123/comments',
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

            // Action
            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadId}/comments`,
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

            // Action
            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadId}/comments`,
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

            // Action
            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadId}/comments`,
                headers: { Authorization: `Bearer ${accessToken}` },
                payload: requestPayload,
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.addedComment).toBeDefined();
        });
    });

    describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
        it('should response 401 when no token has been given', async () => {
            // Arrange
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123',
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
                url: '/threads/thread-123/comments/comment-123',
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
                url: `/threads/${threadId}/comments/comment-123`,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should respond 403 when owner comment mismatch', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', thread: 'thread-123', owner: 'user-123' });

            const server = await createServer(container);
            const accessToken = await getAccessToken();

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-123/comments/comment-123',
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should response 201 and comment deleted', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken();
            const threadId = await getThreadId();
            const commentId = await getCommentId();

            // Action
            const response = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadId}/comments/${commentId}`,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.message).toBeDefined();
        });
    });

    describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
        it('should response 401 when no token has been given', async () => {
            // Arrange
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'PUT',
                url: '/threads/thread-123/comments/comment-123/likes',
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
                method: 'PUT',
                url: '/threads/thread-123/comments/comment-123/likes',
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
                method: 'PUT',
                url: `/threads/${threadId}/comments/comment-123/likes`,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should response 200 and add likes to the comment', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken();
            const threadId = await getThreadId();
            const commentId = await getCommentId();

            // Action
            const response = await server.inject({
                method: 'PUT',
                url: `/threads/${threadId}/comments/${commentId}/likes`,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
        });

        it('should response 200 and delete likes to the comment', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken();
            const threadId = await getThreadId();
            const commentId = await getCommentId();
            await insertLikes();

            // Action
            const response = await server.inject({
                method: 'PUT',
                url: `/threads/${threadId}/comments/${commentId}/likes`,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
        });
    });
});
