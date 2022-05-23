exports.up = (pgm) => {
    pgm.createTable('comments', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        content: {
            type: 'TEXT',
            notNull: true,
        },
        thread: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'threads(id)',
            referencesConstraintName: 'FK_THREADS.ID',
            onDelete: 'CASCADE',
        },
        owner: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'users(id)',
            referencesConstraintName: 'FK_USERS.ID',
            onDelete: 'CASCADE',
        },
        is_delete: {
            type: 'BOOLEAN',
            default: false,
        },
        date: {
            type: 'TIMESTAMP',
            default: pgm.func('NOW()'),
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('comments');
};
