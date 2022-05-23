class DeleteCommentUseCase {
    constructor({ threadRepository, commentRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
    }

    async execute(userId, threadId, commentId) {
        await this._threadRepository.verifyThreadExists(threadId);
        await this._commentRepository.verifyCommentOwner(commentId, userId);
        await this._commentRepository.deleteCommentById(commentId, userId);
    }
}

module.exports = DeleteCommentUseCase;
