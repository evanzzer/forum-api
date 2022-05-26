const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const { getAccessToken } = require('./_threadTestLibrary');

describe('/threads endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        // Also truncate replies, comments, and threads as they are dependent
        await UsersTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
    });

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
            const accessToken = await getAccessToken();

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
            const accessToken = await getAccessToken();

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
            const accessToken = await getAccessToken();

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
});
