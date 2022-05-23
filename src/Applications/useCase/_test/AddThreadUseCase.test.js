const NewThread = require('../../../Domains/threads/entities/NewThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
    it('should orchestrating the add thread action correctly', async () => {
        // Arrange
        const useCasePayload = {
            title: 'a title',
            body: 'a description',
        };
        const expectedNewThread = new CreatedThread({
            id: 'thread-123',
            title: useCasePayload.title,
            body: useCasePayload.body,
            owner: 'user-123',
        });

        const mockThreadRepository = new ThreadRepository();

        mockThreadRepository.addThread = jest.fn()
            .mockImplementation(() => Promise.resolve(new CreatedThread({
                id: 'thread-123',
                title: useCasePayload.title,
                body: useCasePayload.body,
                owner: 'user-123',
            })));

        const addThreadUseCase = new AddThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        // Action
        const thread = await addThreadUseCase.execute('user-123', useCasePayload);

        // Assert
        expect(thread).toStrictEqual(expectedNewThread);
        expect(mockThreadRepository.addThread).toBeCalledWith(
            expectedNewThread.owner,
            new NewThread({
                title: useCasePayload.title,
                body: useCasePayload.body,
            }),
        );
    });
});
