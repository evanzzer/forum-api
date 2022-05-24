/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
    async addLikes({
        id = 'likes-123', owner = 'user-123', comment = 'comment-123',
    }) {
        const query = {
            text: 'INSERT INTO likes VALUES($1, $2, $3)',
            values: [id, owner, comment],
        };

        await pool.query(query);
    },

    async findLikeById(id) {
        const query = {
            text: 'SELECT * FROM likes WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async cleanTable() {
        await pool.query('TRUNCATE TABLE replies');
    },
};

module.exports = RepliesTableTestHelper;
