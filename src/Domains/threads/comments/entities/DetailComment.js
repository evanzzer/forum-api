class DetailComment {
    constructor(payload) {
        this._verifyPayload(payload);

        const { id, content, date, username, isDeleted } = payload;

        this.id = id;
        this.content = isDeleted ? '**komentar telah dihapus**' : content;
        this.date = date;
        this.username = username;
    }

    _verifyPayload(payload) {
        const { id, content, date, username, isDeleted } = payload;

        if (!id || !content || !date || !username
            || isDeleted === undefined || isDeleted === null) {
            throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof content !== 'string'
            || typeof date !== 'string' || typeof username !== 'string'
            || typeof isDeleted !== 'boolean') {
            throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = DetailComment;
