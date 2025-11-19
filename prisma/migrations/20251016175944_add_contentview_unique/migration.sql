/*
  Warnings:

  - A unique constraint covering the columns `[userId,contentId]` on the table `content_views` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `content_views_userId_contentId_key` ON `content_views`(`userId`, `contentId`);
