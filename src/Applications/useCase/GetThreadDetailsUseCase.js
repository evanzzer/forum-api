class GetThreadDetailsUseCase {
    constructor({ threadRepository, commentRepository, replyRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }

    async execute(threadId) {
        const threadResults = await this._threadRepository.getThreadDetails(threadId);
        const commentResults = await this._commentRepository.getCommentDetails(threadId);

        threadResults.comments = await Promise.all(commentResults.map(async (comment) => {
            const newComment = comment;
            newComment.replies = await this._replyRepository.getReplyDetails(threadId, comment.id);
            return newComment;
        }));

        return threadResults;
    }
}

module.exports = GetThreadDetailsUseCase;
