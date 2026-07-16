/**
 * 匿名上传清理逻辑测试
 * 运行: node tests/cleanup-test.mjs
 * 验证 isExpiredByUploaded 和清理函数逻辑正确
 */

const TMP_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24小时

function isExpiredByUploaded(uploaded) {
  if (!uploaded) return true;
  return Date.now() - uploaded.getTime() > TMP_EXPIRY_MS;
}

let passed = 0, failed = 0;
const ok = (msg) => (console.log(`  ✓ ${msg}`), passed++);
const no = (msg) => (console.log(`  ✗ ${msg}`), failed++);

console.log('\n📋 匿名上传清理逻辑测试\n');

// 1. undefined → 过期
console.log('1️⃣  uploaded = undefined');
try {
  if (isExpiredByUploaded(undefined)) ok('视为过期');
  else no('应视为过期');
} catch (e) {
  no(`异常: ${e.message}`);
}

// 2. null → 过期
console.log('\n2️⃣  uploaded = null');
try {
  if (isExpiredByUploaded(null)) ok('视为过期');
  else no('应视为过期');
} catch (e) {
  no(`异常: ${e.message}`);
}

// 3. 刚刚上传 (0 秒前) → 未过期
console.log('\n3️⃣  刚上传的对象');
try {
  const d = new Date();
  if (!isExpiredByUploaded(d)) ok('未过期');
  else no('不应过期');
} catch (e) {
  no(`异常: ${e.message}`);
}

// 4. 23 小时前 → 未过期 (不足24h)
console.log('\n4️⃣  23小时前上传');
try {
  const d = new Date(Date.now() - 23 * 60 * 60 * 1000);
  if (!isExpiredByUploaded(d)) ok('未过期');
  else no('不应过期');
} catch (e) {
  no(`异常: ${e.message}`);
}

// 5. 25 小时前 → 过期
console.log('\n5️⃣  25小时前上传');
try {
  const d = new Date(Date.now() - 25 * 60 * 60 * 1000);
  if (isExpiredByUploaded(d)) ok('视为过期');
  else no('应视为过期');
} catch (e) {
  no(`异常: ${e.message}`);
}

// 6. 正好 24 小时前 → 未过期 (严格大于)
console.log('\n6️⃣  正好24小时前上传');
try {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (!isExpiredByUploaded(d)) ok('未过期 (边界)');
  else no('边界情况不应过期');
} catch (e) {
  no(`异常: ${e.message}`);
}

// 7. 24小时 + 1ms 前 → 过期
console.log('\n7️⃣  24小时+1ms前上传');
try {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000 - 1);
  if (isExpiredByUploaded(d)) ok('视为过期 (边界)');
  else no('边界情况应过期');
} catch (e) {
  no(`异常: ${e.message}`);
}

// 8. 1 个月前 → 过期
console.log('\n8️⃣  1个月前上传');
try {
  const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (isExpiredByUploaded(d)) ok('视为过期');
  else no('应视为过期');
} catch (e) {
  no(`异常: ${e.message}`);
}

// 9. deleteTmpByBucketId 前缀匹配逻辑
console.log('\n9️⃣  deleteTmpByBucketId 前缀匹配');
function filterTmpKeys(objects, id) {
  const prefix = `tmp/${id}`;
  return objects
    .filter((o) => o.key === `${prefix}.html` || o.key.startsWith(`${prefix}/`))
    .map((o) => o.key);
}
const mockObjects = [
  { key: 'tmp/abc1234.html' },
  { key: 'tmp/abc1234/index.html' },
  { key: 'tmp/abc1234/style.css' },
  { key: 'tmp/abc1234extra.html' },
  { key: 'tmp/xyz9999.html' },
  { key: 'other/file.txt' },
];
const filtered = filterTmpKeys(mockObjects, 'abc1234');
const expected = ['tmp/abc1234.html', 'tmp/abc1234/index.html', 'tmp/abc1234/style.css'];
const match = JSON.stringify(filtered.sort()) === JSON.stringify(expected.sort());
if (match) ok('只匹配正确的前缀文件');
else no(`期望 ${JSON.stringify(expected)}, 得到 ${JSON.stringify(filtered)}`);

// 10. 过滤不应包含无关文件
const noExtra = !filtered.includes('tmp/abc1234extra.html') && !filtered.includes('tmp/xyz9999.html');
if (noExtra) ok('排除无关文件');
else no(`包含了不应匹配的文件: ${JSON.stringify(filtered)}`);

console.log(`\n📊 结果: ${passed} 通过, ${failed} 失败`);
if (failed > 0) process.exit(1);
