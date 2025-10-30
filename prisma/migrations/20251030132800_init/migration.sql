-- CreateTable
CREATE TABLE "SvnRepository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReviewRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "configuration" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemPrompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReviewSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repositoryId" TEXT NOT NULL,
    "ruleId" TEXT,
    "promptId" TEXT,
    "svnRevision" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "aiModel" TEXT,
    "totalFiles" INTEGER NOT NULL DEFAULT 0,
    "totalFindings" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReviewSession_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "SvnRepository" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewSession_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "ReviewRule" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReviewSession_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "SystemPrompt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewFinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "lineNumber" INTEGER,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "suggestion" TEXT,
    "codeSnippet" TEXT,
    "aiResponse" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReviewFinding_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ReviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SvnRepository_name_key" ON "SvnRepository"("name");

-- CreateIndex
CREATE INDEX "SvnRepository_name_idx" ON "SvnRepository"("name");

-- CreateIndex
CREATE INDEX "SvnRepository_isActive_idx" ON "SvnRepository"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewRule_name_key" ON "ReviewRule"("name");

-- CreateIndex
CREATE INDEX "ReviewRule_name_idx" ON "ReviewRule"("name");

-- CreateIndex
CREATE INDEX "ReviewRule_ruleType_idx" ON "ReviewRule"("ruleType");

-- CreateIndex
CREATE INDEX "ReviewRule_isEnabled_idx" ON "ReviewRule"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "SystemPrompt_name_key" ON "SystemPrompt"("name");

-- CreateIndex
CREATE INDEX "SystemPrompt_name_idx" ON "SystemPrompt"("name");

-- CreateIndex
CREATE INDEX "SystemPrompt_category_idx" ON "SystemPrompt"("category");

-- CreateIndex
CREATE INDEX "SystemPrompt_isActive_idx" ON "SystemPrompt"("isActive");

-- CreateIndex
CREATE INDEX "ReviewSession_repositoryId_idx" ON "ReviewSession"("repositoryId");

-- CreateIndex
CREATE INDEX "ReviewSession_status_idx" ON "ReviewSession"("status");

-- CreateIndex
CREATE INDEX "ReviewSession_startedAt_idx" ON "ReviewSession"("startedAt");

-- CreateIndex
CREATE INDEX "ReviewFinding_sessionId_idx" ON "ReviewFinding"("sessionId");

-- CreateIndex
CREATE INDEX "ReviewFinding_severity_idx" ON "ReviewFinding"("severity");

-- CreateIndex
CREATE INDEX "ReviewFinding_category_idx" ON "ReviewFinding"("category");

-- CreateIndex
CREATE INDEX "ReviewFinding_status_idx" ON "ReviewFinding"("status");

-- CreateIndex
CREATE INDEX "ReviewFinding_filePath_idx" ON "ReviewFinding"("filePath");
