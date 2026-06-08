const Article = require('../models/Article');
const Event = require('../models/Event');
const Job = require('../models/Job');
const { User } = require('../models/User');
const { Topic } = require('../models/Topic');

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Search across all entities (articles, events, jobs, topics, users)
 */
async function search(query, type = 'all', limit = 5) {
    if (!query || query.trim().length < 2) {
        throw new Error('נא להזין לפחות 2 תווים');
    }

    const regex = { $regex: escapeRegex(query.trim()), $options: 'i' };
    const lim = Math.min(Number(limit), 20);
    const results = {};

    /**
     * Helper to run search on model with error handling
     */
    const searchModel = async (key, model, searchQuery, select, populate) => {
        if (type !== 'all' && type !== key) return;
        if (!model) return;

        try {
            let dbQuery = model.find(searchQuery).select(select).limit(lim);
            if (populate) {
                dbQuery = dbQuery.populate(...populate);
            }
            results[key] = await dbQuery;
        } catch (error) {
            results[key] = [];
        }
    };

    // Run all searches in parallel
    await Promise.all([
        searchModel(
            'articles',
            Article,
            { $or: [{ title: regex }, { content: regex }, { tags: regex }] },
            'title category tags createdAt',
            ['author', 'username firstName lastName']
        ),
        searchModel(
            'events',
            Event,
            { $or: [{ title: regex }, { description: regex }, { location: regex }, { tags: regex }] },
            'title date location tags',
            ['author', 'username firstName lastName']
        ),
        searchModel(
            'jobs',
            Job,
            { $or: [{ title: regex }, { company: regex }, { description: regex }, { tags: regex }] },
            'title company location type tags',
            ['author', 'username']
        ),
        searchModel(
            'topics',
            Topic,
            { $or: [{ title: regex }, { content: regex }, { tags: regex }] },
            'title createdAt votes',
            ['author', 'username firstName lastName']
        ),
        searchModel(
            'users',
            User,
            { $or: [{ username: regex }, { firstName: regex }, { lastName: regex }] },
            'username firstName lastName icon avatar',
            null
        )
    ]);

    const total = Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0);

    return {
        results,
        total,
        query
    };
}

module.exports = {
    search
};
