const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CreatedThread = require('../../Domains/threads/entities/CreatedThread');
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addThread(userId, newThread) {
        const { title, body } = newThread;
        const id = `thread-${this._idGenerator()}`;

        const query = {
            text: 'INSERT INTO threads VALUES ($1, $2, $3, $4, NOW()) RETURNING id, title, owner',
            values: [id, title, body, userId],
        };
        const result = await this._pool.query(query);

        return new CreatedThread({ ...result.rows[0] });
    }

    async verifyThreadExists(threadId) {
        const query = {
            text: 'SELECT id FROM threads WHERE id = $1',
            values: [threadId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) throw new NotFoundError('thread tidak ditemukan');
    }

    async getThreadDetails(threadId) {
        const query = {
            text: `SELECT t.id, title, body, TO_CHAR(date, 'YYYY/MM/dd HH24:MI:SS') AS date, username 
                    FROM threads t INNER JOIN users u ON t.owner = u.id WHERE t.id = $1 ORDER BY t.date`,
            values: [threadId],
        };

        const threadResult = await this._pool.query(query);
        if (!threadResult.rowCount) throw new NotFoundError('thread tidak ditemukan');

        return new DetailThread({ ...threadResult.rows[0] });
    }
}

module.exports = ThreadRepositoryPostgres;
