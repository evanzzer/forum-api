const NewComment = require('../../../Domains/threads/comments/entities/NewComment');
const CreatedComment = require('../../../Domains/threads/comments/entities/CreatedComment');
const CommentRepository = require('../../../Domains/threads/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
    it('should orchestrating the add comment action correctly', async () => {
        // Arrange
        const useCasePayload = {
            content: 'new content',
        };
        const expectedNewComment = new CreatedComment({
            id: 'comment-123',
            content: useCasePayload.content,
            owner: 'user-123',
        });

        const mockOwner = 'user-123';
        const mockThread = 'thread-123';

        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();

        mockThreadRepository.verifyThreadExists = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.addComment = jest.fn()
            .mockImplementation(() => Promise.resolve(new CreatedComment({
                id: 'comment-123',
                content: useCasePayload.content,
                owner: 'user-123',
            })));

        const addCommentUseCase = new AddCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        const comment = await addCommentUseCase.execute(mockOwner, mockThread, useCasePayload);

        // Assert
        expect(comment).toStrictEqual(expectedNewComment);
        expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(mockThread);
        expect(mockCommentRepository.addComment).toBeCalledWith(
            mockOwner, mockThread, new NewComment({
                content: 'new content',
            }),
        );
    });
});
