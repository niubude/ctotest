import { CommitData } from '../types';

export class SVNService {
  async getCommits(commitIds: string[]): Promise<CommitData[]> {
    const commits: CommitData[] = [];

    for (const commitId of commitIds) {
      const commit = await this.getCommit(commitId);
      if (commit) {
        commits.push(commit);
      }
    }

    return commits;
  }

  async getCommit(commitId: string): Promise<CommitData | null> {
    return {
      id: commitId,
      message: `Sample commit message for ${commitId}`,
      author: 'developer@example.com',
      timestamp: new Date(),
      diff: `diff --git a/file.ts b/file.ts
index 1234567..abcdefg 100644
--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,5 @@
+import { newFunction } from './utils';
+
 export function main() {
-  console.log('Hello');
+  console.log('Hello World');
+  newFunction();
 }`
    };
  }
}
