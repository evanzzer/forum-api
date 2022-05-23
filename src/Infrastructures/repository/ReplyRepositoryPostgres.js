const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/threads/comments/replies/ReplyRepository');
const CreatedReply = require('../../Domains/threads/comments/replies/entities/CreatedReply');
const DetailReply = require('../../Domains/threads/comments/replies/entities/DetailReply');

class ReplyRepositoryPostgres extends ReplyRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addReply(userId, threadId, commentId, newReply) {
        const { content } = newReply;
        const id = `reply-${this._idGenerator()}`;

        const query = {
            text: 'INSERT INTO replies VALUES ($1, $2, $3, $4, $5, FALSE, NOW()) RETURNING id, content, owner',
            values: [id, content, threadId, commentId, userId],
        };
        const result = await this._pool.query(query);

        return new CreatedReply({ ...result.rows[0] });
    }

    async verifyReplyExists(replyId) {
        const query = {
            text: 'SELECT id FROM replies WHERE id = $1',
            values: [replyId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new NotFoundError('reply tidak ditemukan');
    }

    async verifyReplyOwner(replyId, userId) {
        const query = {
            text: 'SELECT id, owner FROM replies WHERE id = $1',
            values: [replyId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new NotFoundError('reply tidak ditemukan');

        if (result.rows[0].owner !== userId) throw new AuthorizationError('Anda tidak berhak mengakses bagian ini!');
    }

    async getReplyDetails(threadId, commentId) {
        const query = {
            text: `SELECT r.id, content, TO_CHAR(date, 'YYYY/MM/dd HH24:MI:SS') AS date, username, is_delete as "isDeleted"
                    FROM replies r INNER JOIN users u ON r.owner = u.id
                    WHERE thread = $1 AND comment = $2 ORDER BY r.date`,
            values: [threadId, commentId],
        };

        const result = await this._pool.query(query);
        return result.rows.map((r) => new DetailReply({ ...r }));
    }

    async deleteReplyById(replyId, userId) {
        const query = {
            text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1 AND owner = $2',
            values: [replyId, userId],
        };

        await this._pool.query(query);
    }
}

module.exports = ReplyRepositoryPostgres;
