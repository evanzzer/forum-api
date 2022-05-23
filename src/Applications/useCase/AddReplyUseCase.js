const NewReply = require('../../Domains/threads/comments/replies/entities/NewReply');

class AddReplyUseCase {
    constructor({ threadRepository, commentRepository, replyRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }

    async execute(userId, threadId, commentId, useCasePayload) {
        const newReply = new NewReply(useCasePayload);
        await this._threadRepository.verifyThreadExists(threadId);
        await this._commentRepository.verifyCommentExists(commentId);
        return this._replyRepository.addReply(userId, threadId, commentId, newReply);
    }
}

module.exports = AddReplyUseCase;
