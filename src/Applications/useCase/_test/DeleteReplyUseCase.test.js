const ReplyRepository = require('../../../Domains/threads/comments/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/threads/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
    it('should orchestrating the delete reply action correctly', async () => {
        // Arrange
        const mockOwner = 'user-123';
        const mockThread = 'thread-123';
        const mockComment = 'comment-123';
        const mockReply = 'reply-123';

        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();
        const mockReplyRepository = new ReplyRepository();

        mockThreadRepository.verifyThreadExists = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyCommentExists = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockReplyRepository.verifyReplyOwner = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockReplyRepository.deleteReplyById = jest.fn()
            .mockImplementation(() => Promise.resolve());

        const deleteReplyUseCase = new DeleteReplyUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });

        // Action
        await deleteReplyUseCase.execute(mockOwner, mockThread, mockComment, mockReply);

        // Assert
        expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(mockThread);
        expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(mockComment);
        expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(mockReply, mockOwner);
        expect(mockReplyRepository.deleteReplyById).toBeCalledWith(mockReply, mockOwner);
    });
});
