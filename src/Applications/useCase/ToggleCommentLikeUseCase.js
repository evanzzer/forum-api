class ToggleCommentLikeUseCase {
    constructor({ threadRepository, commentRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
    }

    async execute(threadId, commentId, userId) {
        await this._threadRepository.verifyThreadExists(threadId);
        await this._commentRepository.verifyCommentExists(commentId);
        const isLiked = await this._commentRepository.isLiked(commentId, userId);
        if (isLiked) await this._commentRepository.deleteLikes(commentId, userId);
        else await this._commentRepository.addLikes(commentId, userId);
    }
}

module.exports = ToggleCommentLikeUseCase;
