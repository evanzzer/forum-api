// Database Test Helper
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

// Domains
const NewThread = require('../../../Domains/threads/entities/NewThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');

// Exceptions
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

// Misc
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
    beforeEach(async () => {
        await UsersTableTestHelper.addUser({ id: 'user-123', username: 'users' });
    });

    afterEach(async () => {
        // Also truncate replies, comments, and threads as they are dependent
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addThread function', () => {
        it('should add thread correctly', async () => {
            // Arrange
            const newThread = new NewThread({
                title: 'a new title',
                body: 'a description',
            });
            const fakeIdGenerator = () => '123';
            const mockUserId = 'user-123';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            const createdThread = await threadRepositoryPostgres.addThread(mockUserId, newThread);

            // Assert
            const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
            expect(thread).toHaveLength(1);
            expect(createdThread).toStrictEqual(new CreatedThread({
                id: 'thread-123',
                title: 'a new title',
                owner: 'user-123',
            }));
        });
    });

    describe('verifyThreadExists function', () => {
        it('should throw NotFoundError when thread is not exist', async () => {
            // Arrange
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(threadRepositoryPostgres.verifyThreadExists('not-exist-thread')).rejects.toThrowError(NotFoundError);
        });

        it('should not throw NotFoundError when thread exists', async () => {
            // Arrange
            await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(threadRepositoryPostgres.verifyThreadExists('thread-123')).resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('getThreadDetails function', () => {
        it('should throw NotFoundError when thread is not exist', async () => {
            // Arrange
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

            // Action and Assert
            await expect(threadRepositoryPostgres.getThreadDetails('not-exist-thread')).rejects.toThrowError(NotFoundError);
        });

        it('should not throw NotFoundError and gives results when only threads exists', async () => {
            // Arrange
            const thread = {
                id: 'thread-123',
                title: 'a title',
                body: 'a body',
                owner: 'user-123',
            };

            await ThreadsTableTestHelper.addThread(thread);
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

            // Action
            const result = await threadRepositoryPostgres.getThreadDetails(thread.id);

            // Assert
            expect(result).toBeInstanceOf(DetailThread);
            expect(result.id).toEqual(thread.id);
            expect(result.title).toEqual(thread.title);
            expect(result.body).toEqual(thread.body);
            expect(typeof result.date).toEqual('string');
            expect(result.username).toEqual('users');
        });
    });
});
