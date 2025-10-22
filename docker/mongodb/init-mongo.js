// MongoDB初始化脚本
// 创建文件管理数据库和用户

db = db.getSiblingDB('file_management');

// 创建应用用户
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'file_management'
    }
  ]
});

// 创建集合并设置索引
db.createCollection('users');
db.createCollection('files');

// 用户索引
db.users.createIndex({ "phoneNumber": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true, sparse: true });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "createdAt": -1 });

// 文件索引
db.files.createIndex({ "uploadedBy": 1, "isActive": 1 });
db.files.createIndex({ "mimeType": 1 });
db.files.createIndex({ "createdAt": -1 });
db.files.createIndex({ "objectName": 1 }, { unique: true });
db.files.createIndex({ "hash": 1 });
db.files.createIndex({ "tags": 1 });
db.files.createIndex({ "isDeleted": 1 });

// 创建管理员用户（开发环境）
db.users.insertOne({
  phoneNumber: '13888888888',
  username: '系统管理员',
  password: '$2b$10$rQZ8kHWKQGYh9K/KnK/kSOq/HGhKJGhW8Y5n5K8K9K8K5K8K9K8K9', // password: admin123
  role: 'admin',
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('MongoDB初始化完成');
print('数据库: file_management');
print('用户: app_user');
print('管理员账号: 13888888888 / admin123');