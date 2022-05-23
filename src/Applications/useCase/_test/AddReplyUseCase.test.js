const NewReply = require('../../../Domains/threads/comments/replies/entities/NewReply');
const CreatedReply = require('../../../Domains/threads/comments/replies/entities/CreatedReply');
const ReplyRepository = require('../../../Domains/threads/comments/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/threads/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
    it('should orchestrating the add reply action correctly', async () => {
        // Arrange
        const useCasePayload = {
            content: 'new content',
        };
        const expectedNewReply = new CreatedReply({
            id: 'reply-123',
            content: useCasePayload.content,
            owner: 'user-123',
        });

        const mockOwner = 'user-123';
        const mockThread = 'thread-123';
        const mockComment = 'comment-123';

        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();
        const mockReplyRepository = new ReplyRepository();

        mockThreadRepository.verifyThreadExists = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyCommentExists = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockReplyRepository.addReply = jest.fn()
            .mockImplementation(() => Promise.resolve(new CreatedReply({
                id: 'reply-123',
                content: useCasePayload.content,
                owner: 'user-123',
            })));

        const addReplyUseCase = new AddReplyUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });

        // Action
        const reply = await addReplyUseCase.execute(
            mockOwner, mockThread, mockComment, useCasePayload,
        );

        // Assert
        expect(reply).toStrictEqual(expectedNewReply);
        expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(mockThread);
        expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(mockComment);
        expect(mockReplyRepository.addReply).toBeCalledWith(
            mockOwner, mockThread, mockComment, new NewReply({
                content: 'new content',
            }),
        );
    });
});
