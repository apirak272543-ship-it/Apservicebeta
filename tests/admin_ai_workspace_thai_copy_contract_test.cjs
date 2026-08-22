const fs = require('fs');
const source = fs.readFileSync('admin/admin-ai-workspace-thai-copy-patch.js', 'utf8');
const entrypoint = fs.readFileSync('admin/ai-workspace.html', 'utf8');
const css = fs.readFileSync('admin/admin-ai-workspace-mobile-fix.css', 'utf8');
for (const snippet of ['ศูนย์บริบทงาน AI', 'ศูนย์ผู้ดูแล', "['open', 'เปิดอยู่']", "['draft', 'ฉบับร่าง']"]) {
  if (!source.includes(snippet)) throw new Error(`Missing AI Workspace Thai copy: ${snippet}`);
}
if (!css.includes('white-space:nowrap')) throw new Error('Thread status must not wrap on mobile');
if (!entrypoint.includes('admin-ai-workspace-thai-copy-patch.js?v=ai-workspace-thai-v1')) throw new Error('AI Workspace entrypoint must load Thai copy patch');
console.log('admin_ai_workspace_thai_copy_contract_test: PASS');
