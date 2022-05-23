class DeleteReplyUseCase {
    constructor({ threadRepository, commentRepository, replyRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }

    async execute(userId, threadId, commentId, replyId) {
        await this._threadRepository.verifyThreadExists(threadId);
        await this._commentRepository.verifyCommentExists(commentId);
        await this._replyRepository.verifyReplyOwner(replyId, userId);
        await this._replyRepository.deleteReplyById(replyId, userId);
    }
}

module.exports = DeleteReplyUseCase;
