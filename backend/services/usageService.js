const { User } = require('../models/User');
const { Post } = require('../models/Post');
const { Topic } = require('../models/Topic');
const Article = require('../models/Article');
const Event = require('../models/Event');
const Job = require('../models/Job');

function groupByMonth(docs, dateField = 'createdAt', months = 6) {
  const now = new Date();
  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      label: d.toLocaleString('he-IL', { month: 'short', year: '2-digit' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      count: 0,
    });
  }

  for (const doc of docs) {
    const date = new Date(doc[dateField]);
    const bucket = result.find(
      b => b.year === date.getFullYear() && b.month === date.getMonth()
    );
    if (bucket) bucket.count++;
  }

  return result.map(({ label, count }) => ({ label, count }));
}

function countTags(docs) {
  const freq = {};
  for (const doc of docs) {
    for (const tag of doc.tags || []) {
      freq[tag] = (freq[tag] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));
}

function buildHeatmap(docs, dateField = 'createdAt') {
  const now = new Date();
  const weeks = 12;
  const msPerDay = 86400000;
  const heatmap = {};

  for (const doc of docs) {
    const date = new Date(doc[dateField]);
    const daysAgo = Math.floor((now - date) / msPerDay);
    if (daysAgo > weeks * 7) continue;

    const weekAgo = Math.floor(daysAgo / 7);
    const dayOfWeek = date.getDay();
    const key = `${weekAgo}-${dayOfWeek}`;
    heatmap[key] = (heatmap[key] || 0) + 1;
  }

  const matrix = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const row = [];
    for (let d = 0; d < 7; d++) {
      row.push(heatmap[`${w}-${d}`] || 0);
    }
    matrix.push(row);
  }

  return matrix;
}

async function getMyUsage(userId) {
  const [posts, topics, articles, events, jobs, user] = await Promise.all([
    Post.find({ 'author._id': userId }).lean(),
    Topic.find({ 'author._id': userId }).lean(),
    Article.find({ author: userId }).lean(),
    Event.find({ author: userId }).lean(),
    Job.find({ author: userId }).lean(),
    User.findById(userId).lean(),
  ]);

  const totalLikes =
    articles.reduce((sum, a) => sum + (a.likes?.length || 0), 0) +
    events.reduce((sum, e) => sum + (e.likes?.length || 0), 0) +
    jobs.reduce((sum, j) => sum + (j.likes?.length || 0), 0);

  const totalVotes = posts.reduce((sum, p) => sum + (p.numberOfVotes || 0), 0);
  const challengeTopicIds = new Set(topics.filter(t => (t.tags || []).includes('challenge')).map(t => String(t._id)));
  const challengesSolved = posts.reduce((count, p) => {
    if (p.isSolution && challengeTopicIds.has(String(p.topicId))) return count + 1;
    return count;
  }, 0);

  const allActivity = [
    ...posts.map(p => ({ createdAt: p.createdAt })),
    ...topics.map(t => ({ createdAt: t.createdAt })),
  ];

  return {
    stats: {
      posts: posts.length,
      topics: topics.length,
      articles: articles.length,
      events: events.length,
      jobs: jobs.length,
      totalLikes,
      totalVotes,
      totalViews: topics.reduce((sum, t) => sum + (t.views || 0), 0),
      challengesSolved,
    },
    activityOverTime: groupByMonth(allActivity, 'createdAt', 6),
    postsOverTime: groupByMonth(posts, 'createdAt', 6),
    topicsOverTime: groupByMonth(topics, 'createdAt', 6),
    myTags: countTags([...topics, ...articles, ...events, ...jobs]),
    heatmap: buildHeatmap(allActivity, 'createdAt'),
    memberSince: user?.createdAt || null,
    lastLogin: user?.lastLogin || null,
  };
}

async function getGlobalUsage() {
  const [allUsers, allPosts, allTopics, allArticles, allEvents, allJobs] = await Promise.all([
    User.find().lean(),
    Post.find().lean(),
    Topic.find().lean(),
    Article.find().lean(),
    Event.find().lean(),
    Job.find().lean(),
  ]);

  const jobTypes = { fulltime: 0, parttime: 0, freelance: 0, internship: 0 };
  for (const job of allJobs) {
    if (jobTypes[job.type] !== undefined) jobTypes[job.type]++;
  }

  const topTopics = allTopics
    .sort((a, b) => (b.posts?.length || 0) - (a.posts?.length || 0))
    .slice(0, 5)
    .map(t => ({ _id: t._id, title: t.title?.slice(0, 30) || 'ללא כותרת', posts: t.posts?.length || 0, views: t.views || 0 }));

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const challengeTopicIds = new Set(allTopics.filter(t => (t.tags || []).includes('challenge')).map(t => String(t._id)));
  const leaderboardMap = {};

  allPosts.forEach(post => {
    if (!post.isSolution || !post.createdAt || new Date(post.createdAt) < oneWeekAgo) return;
    if (!challengeTopicIds.has(String(post.topicId))) return;
    const author = post.author || {};
    const authorId = String(author._id || author.id || author);
    const authorName = (author.firstName && author.lastName)
      ? `${author.firstName} ${author.lastName}`
      : author.firstName || author.lastName || 'משתמש אנונימי';

    leaderboardMap[authorId] = leaderboardMap[authorId] || { userId: authorId, name: authorName, count: 0 };
    leaderboardMap[authorId].count += 1;
  });

  const challengeLeaderboard = Object.values(leaderboardMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    stats: {
      users: allUsers.length,
      posts: allPosts.length,
      topics: allTopics.length,
      articles: allArticles.length,
      events: allEvents.length,
      jobs: allJobs.length,
      totalLikes:
        allArticles.reduce((sum, a) => sum + (a.likes?.length || 0), 0) +
        allEvents.reduce((sum, e) => sum + (e.likes?.length || 0), 0) +
        allJobs.reduce((sum, j) => sum + (j.likes?.length || 0), 0),
    },
    usersOverTime: groupByMonth(allUsers, 'createdAt', 6),
    postsOverTime: groupByMonth(allPosts, 'createdAt', 6),
    topicsOverTime: groupByMonth(allTopics, 'createdAt', 6),
    globalTags: countTags([...allTopics, ...allArticles, ...allEvents, ...allJobs]),
    jobTypeData: Object.entries(jobTypes).map(([type, count]) => ({ type, count })),
    topTopics,
    challengeLeaderboard,
  };
}

module.exports = {
  getMyUsage,
  getGlobalUsage,
};