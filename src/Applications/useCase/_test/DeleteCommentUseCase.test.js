const CommentRepository = require('../../../Domains/threads/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
    it('should orchestrating the delete comment action correctly', async () => {
        // Arrange
        const mockOwner = 'user-123';
        const mockThread = 'thread-123';
        const mockComment = 'comment-123';

        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();

        mockThreadRepository.verifyThreadExists = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyCommentOwner = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.deleteCommentById = jest.fn()
            .mockImplementation(() => Promise.resolve());

        const deleteCommentUseCase = new DeleteCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        await deleteCommentUseCase.execute(mockOwner, mockThread, mockComment);

        // Assert
        expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(mockThread);
        expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(mockComment, mockOwner);
        expect(mockCommentRepository.deleteCommentById).toBeCalledWith(mockComment, mockOwner);
    });
});
