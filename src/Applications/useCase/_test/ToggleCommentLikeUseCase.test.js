const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/threads/comments/CommentRepository');
const ToggleCommentLikeUseCase = require('../ToggleCommentLikeUseCase');

describe('ToggleCommentLikeUseCase', () => {
    it('should orchestrating the like toggle correctly if user wants to like comments', async () => {
        // Arrange
        const mockOwner = 'user-123';
        const mockThread = 'thread-123';
        const mockComment = 'comment-123';

        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();

        mockThreadRepository.verifyThreadExists = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyCommentExists = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.isLiked = jest.fn()
            .mockImplementation(() => Promise.resolve(false));
        mockCommentRepository.addLikes = jest.fn()
            .mockImplementation(() => Promise.resolve());

        const toggleCommentLike = new ToggleCommentLikeUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        await toggleCommentLike.execute(mockThread, mockComment, mockOwner);

        // Assert
        expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(mockThread);
        expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(mockComment);
        expect(mockCommentRepository.isLiked).toBeCalledWith(mockComment, mockOwner);
        expect(mockCommentRepository.addLikes).toBeCalledWith(mockComment, mockOwner);
    });

    it('should orchestrating the like toggle correctly if user wants to unlike comments', async () => {
        // Arrange
        const mockOwner = 'user-456';
        const mockThread = 'thread-123';
        const mockComment = 'comment-123';

        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();

        mockThreadRepository.verifyThreadExists = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyCommentExists = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.isLiked = jest.fn()
            .mockImplementation(() => Promise.resolve(true));
        mockCommentRepository.deleteLikes = jest.fn()
            .mockImplementation(() => Promise.resolve());

        const toggleCommentLike = new ToggleCommentLikeUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        await toggleCommentLike.execute(mockThread, mockComment, mockOwner);

        // Assert
        expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(mockComment);
        expect(mockCommentRepository.isLiked).toBeCalledWith(mockComment, mockOwner);
        expect(mockCommentRepository.deleteLikes).toBeCalledWith(mockComment, mockOwner);
    });
});
