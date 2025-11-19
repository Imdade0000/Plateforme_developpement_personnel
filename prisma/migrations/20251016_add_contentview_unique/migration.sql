-- Migration: add unique constraint on content_views(userId, contentId)
ALTER TABLE `content_views`
  ADD CONSTRAINT `content_views_userId_contentId_unique` UNIQUE (`userId`, `contentId`);
