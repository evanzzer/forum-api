// Entities
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/threads/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/threads/comments/replies/entities/DetailReply');

// Repostiories
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/threads/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/threads/comments/replies/ReplyRepository');

// Use Case
const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase');

describe('GetThreadDetailsUseCase', () => {
    it('should orchestrating the get thread details correctly', async () => {
        // Arrange
        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();
        const mockReplyRepository = new ReplyRepository();

        mockThreadRepository.getThreadDetails = jest.fn()
            .mockImplementation(() => Promise.resolve(new DetailThread({
                id: 'thread-123',
                title: 'title',
                body: 'body',
                date: '2021/05/05 15:00:00',
                username: 'user',
            })));
        mockCommentRepository.getCommentDetails = jest.fn()
            .mockImplementation(() => Promise.resolve([
                new DetailComment({
                    id: 'comment-123',
                    content: 'content',
                    date: '2021/05/05 15:00:00',
                    username: 'user',
                    isDeleted: false,
                }),
                new DetailComment({
                    id: 'comment-456',
                    content: 'another content',
                    date: '2021/05/05 15:00:00',
                    username: 'user',
                    isDeleted: true,
                }),
            ]));
        mockReplyRepository.getReplyDetails = jest.fn()
            .mockImplementation(() => Promise.resolve([
                new DetailReply({
                    id: 'reply-123',
                    content: 'content',
                    date: '2021/05/05 15:00:00',
                    username: 'user',
                    isDeleted: false,
                }),
                new DetailReply({
                    id: 'reply-456',
                    content: 'another content',
                    date: '2021/05/05 15:00:00',
                    username: 'user',
                    isDeleted: true,
                }),
            ]));

        const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });

        // Action
        const threadDetails = await getThreadDetailsUseCase.execute('thread-123');

        // Assert
        expect(threadDetails).toBeInstanceOf(DetailThread);
        expect(threadDetails.comments).toBeDefined();
        threadDetails.comments.forEach((c) => {
            expect(c).toBeInstanceOf(DetailComment);
            expect(c.replies).toBeDefined();
            c.replies.forEach((r) => expect(r).toBeInstanceOf(DetailReply));
        });
        expect(mockThreadRepository.getThreadDetails).toBeCalledWith('thread-123');
        expect(mockCommentRepository.getCommentDetails).toBeCalledWith('thread-123');
        expect(mockReplyRepository.getReplyDetails).toBeCalledWith('thread-123', 'comment-123');
        expect(mockReplyRepository.getReplyDetails).toBeCalledWith('thread-123', 'comment-456');
    });
});
