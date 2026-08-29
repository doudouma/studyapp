-- 添加链接上限奖励字段：每花10积分增加1个永久最大链接数
ALTER TABLE user ADD COLUMN links_limit_bonus INTEGER NOT NULL DEFAULT 0;
