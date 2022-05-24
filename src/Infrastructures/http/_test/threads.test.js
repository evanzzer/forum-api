const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        // Also truncate replies, comments, and threads as they are dependent
        await UsersTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
    });

    // Supporting Functions
    const getAccessToken = async (server) => {
        await server.inject({
            method: 'POST',
            url: '/users',
            payload: {
                username: 'dicoding',
                password: 'secret',
                fullname: 'Dicoding Indonesia',
            },
        });
        const response = await server.inject({
            method: 'POST',
            url: '/authentications',
            payload: {
                username: 'dicoding',
                password: 'secret',
            },
        });
        const { accessToken } = JSON.parse(response.payload).data;

        return accessToken;
    };

    const getThreadId = async (server, accessToken) => {
        const response = await server.inject({
            method: 'POST',
            url: '/threads',
            headers: { Authorization: `Bearer ${accessToken}` },
            payload: {
                title: 'a new thread',
                body: 'a new body',
            },
        });
        const { id: threadId } = JSON.parse(response.payload).data.addedThread;

        return threadId;
    };

    const getCommentId = async (server, accessToken, threadId) => {
        const response = await server.inject({
            method: 'POST',
            url: `/threads/${threadId}/comments`,
            headers: { Authorization: `Bearer ${accessToken}` },
            payload: {
                content: 'a new comment',
            },
        });
        const { id: commentId } = JSON.parse(response.payload).data.addedComment;

        return commentId;
    };

    const getReplyId = async (server, accessToken, threadId, commentId) => {
        const response = await server.inject({
            method: 'POST',
            url: `/threads/${threadId}/comments/${commentId}/replies`,
            headers: { Authorization: `Bearer ${accessToken}` },
            payload: {
                content: 'a new reply',
            },
        });
        const { id: replyId } = JSON.parse(response.payload).data.addedReply;

        return replyId;
    };

    const insertLikes = async (server, accessToken, threadId, commentId) => {
        await server.inject({
            method: 'PUT',
            url: `/threads/${threadId}/comments/${commentId}/likes`,
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    };

    describe('when POST /threads', () => {
        it('should response 401 when no token has been given', async () => {
            // Arrange
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
            });

            // Assert
            expect(response.statusCode).toEqual(401);
        });

        it('should response 400 when request payload not contain valid property', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken(server);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                headers: { Authorization: `Bearer ${accessToken}` },
                payload: {
                    title: 'a new title',
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should response 400 when request payload not meet data type specification', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken(server);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                headers: { Authorization: `Bearer ${accessToken}` },
                payload: {
                    title: 'a new title',
                    body: true,
                },
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should response 201 and thread created', async () => {
            // Arrange
            const requestPayload = {
                title: 'a new title',
                body: 'a new description',
            };

            const server = await createServer(container);
            const accessToken = await getAccessToken(server);

            // Action
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                headers: { Authorization: `Bearer ${accessToken}` },
                payload: requestPayload,
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.addedThread).toBeDefined();
        });
    });

    describe('when GET /threads/{threadId}', () => {
        it('should respond 404 when thread is not found', async () => {
            // Arrange
            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'GET',
                url: '/threads/thread-123',
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should response 201 when everything is set up', async () => {
            // Arrange
            await UsersTableTestHelper.addUser({ id: 'user-123' });
            await UsersTableTestHelper.addUser({ id: 'user-456', username: 'users' });
            await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-123', thread: 'thread-123' });
            await CommentsTableTestHelper.addComment({ id: 'comment-456', thread: 'thread-123', isDelete: true });
            await RepliesTableTestHelper.addReply({ id: 'reply-123', thread: 'thread-123', comment: 'comment-123' });
            await RepliesTableTestHelper.addReply({
                id: 'reply-456', thread: 'thread-123', comment: 'comment-123', isDelete: true,
            });
            await LikesTableTestHelper.addLikes({ id: 'likes-123', owner: 'user-123', comment: 'comment-456' });
            await LikesTableTestHelper.addLikes({ id: 'likes-456', owner: 'user-456', comment: 'comment-456' });

            const server = await createServer(container);

            // Action
            const response = await server.inject({
                method: 'GET',
                url: '/threads/thread-123',
            });

            // Assert
            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.thread).toBeDefined();
            expect(responseJson.data.thread.comments).toBeDefined();
            expect(responseJson.data.thread.comments[0].replies).toBeDefined();
            expect(responseJson.data.thread.comments[1].likeCount).toEqual(2);
        });
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
            const accessToken = await getAccessToken(server);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);

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
            const accessToken = await getAccessToken(server);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);

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
            const accessToken = await getAccessToken(server);

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

        it('should response 201 and threads created', async () => {
            // Arrange
            const server = await createServer(container);
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);
            const commentId = await getCommentId(server, accessToken, threadId);

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
            const accessToken = await getAccessToken(server);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);
            const commentId = await getCommentId(server, accessToken, threadId);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);
            const commentId = await getCommentId(server, accessToken, threadId);
            await insertLikes(server, accessToken, threadId, commentId);

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
            const accessToken = await getAccessToken(server);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);
            const commentId = await getCommentId(server, accessToken, threadId);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);
            const commentId = await getCommentId(server, accessToken, threadId);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);
            const commentId = await getCommentId(server, accessToken, threadId);

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
            const accessToken = await getAccessToken(server);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);
            const commentId = await getCommentId(server, accessToken, threadId);

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
            const accessToken = await getAccessToken(server);

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
            const accessToken = await getAccessToken(server);
            const threadId = await getThreadId(server, accessToken);
            const commentId = await getCommentId(server, accessToken, threadId);
            const replyId = await getReplyId(server, accessToken, threadId, commentId);

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
