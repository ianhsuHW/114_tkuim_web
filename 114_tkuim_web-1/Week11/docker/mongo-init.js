// 建立使用者與 week11 DB
db = db.getSiblingDB('week11');
db.createUser({
  user: 'week11-user',
  pwd: 'week11-pass',
  roles: [{ role: 'readWrite', db: 'week11' }]
});

// 建立 participants 集合與 email 唯一索引
db.createCollection('participants');
db.participants.createIndex({ email: 1 }, { unique: true });
