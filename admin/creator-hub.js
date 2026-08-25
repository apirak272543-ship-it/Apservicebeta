(() => {
  'use strict';

  const getRuntime = () => window.APServiceAdminRuntime;
  const asArray = value => Array.isArray(value) ? value : [];
  const asText = (value, fallback = '') => String(value ?? fallback).trim();
  const asNumber = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const encode = value => encodeURIComponent(String(value ?? ''));
  const safeDate = value => value ? new Date(value).toLocaleString('th-TH') : 'ยังไม่ระบุ';
  const statusLabel = Object.freeze({ pending: 'รอตรวจสอบ', active: 'ใช้งาน', paused: 'พักใช้งาน', archived: 'เก็บถาวร', draft: 'แบบร่าง', ended: 'สิ้นสุด', pending_qualification: 'รอตรวจสอบยอด', qualified: 'ผ่านเกณฑ์', approved: 'อนุมัติ', paid: 'จ่ายแล้ว', void: 'ยกเลิกสิทธิ์', rejected: 'ไม่อนุมัติ', revoked: 'เพิกถอน', expired: 'หมดอายุ' });
  const statusClass = value => {
    const status = String(value || '').toLowerCase();
    if (['active', 'qualified', 'approved', 'paid'].includes(status)) return 'creator-hub-badge--approved';
    if (['pending', 'draft', 'pending_qualification'].includes(status)) return 'creator-hub-badge--pending';
    if (['paused', 'ended', 'archived', 'void', 'revoked'].includes(status)) return 'creator-hub-badge--paused';
    return 'creator-hub-badge--risk';
  };
  const badge = value => `<span class="creator-hub-badge ${statusClass(value)}">${getRuntime().h(statusLabel[value] || value || 'ไม่ระบุ')}</span>`;
  const empty = (title, detail = '') => `<div class="creator-hub-empty"><strong>${getRuntime().h(title)}</strong><span>${getRuntime().h(detail)}</span></div>`;
  const money = value => getRuntime().M.ui.baht(asNumber(value));
  const option = (value, label, selected = false) => `<option value="${getRuntime().h(value)}"${selected ? ' selected' : ''}>${getRuntime().h(label)}</option>`;
  const selectedValues = select => [...(select?.selectedOptions || [])].map(item => item.value).filter(Boolean);
  const withQuery = (path, key, value) => `${path}${path.includes('?') ? '&' : '?'}${key}=${encode(value)}`;

  const creatorHub = async () => {
    const { M, h, gate, pageScope } = getRuntime();
    const initial = `<div class="creator-hub-hero"><div><p class="creator-hub-kicker">CREATOR COMMUNITY COMMERCE</p><h1>Creator Hub</h1><p>ศูนย์กลาง Admin สำหรับดูแล Creator, Campaign, Content, Attribution และ Commission จากข้อมูลจริงของ AP Service</p></div><div class="creator-hub-actions"><button class="mpa-button mpa-button-secondary" type="button" data-creator-refresh>รีเฟรชข้อมูล</button><button class="mpa-button" type="button" data-creator-new>+ เพิ่ม Creator</button></div></div><section class="creator-hub-metrics" data-creator-metrics>${M.ui.loading('กำลังอ่านข้อมูล Creator…')}</section><section class="creator-hub-panel"><div class="creator-hub-tabs" role="tablist" aria-label="เมนู Creator Hub"><button class="creator-hub-tab" type="button" role="tab" aria-selected="true" data-creator-tab="dashboard">ภาพรวม</button><button class="creator-hub-tab" type="button" role="tab" aria-selected="false" data-creator-tab="creators">Creators</button><button class="creator-hub-tab" type="button" role="tab" aria-selected="false" data-creator-tab="campaigns">Campaigns</button><button class="creator-hub-tab" type="button" role="tab" aria-selected="false" data-creator-tab="content">Content Rights</button><button class="creator-hub-tab" type="button" role="tab" aria-selected="false" data-creator-tab="attributions">Attribution</button><button class="creator-hub-tab" type="button" role="tab" aria-selected="false" data-creator-tab="finance">Commission</button><button class="creator-hub-tab" type="button" role="tab" aria-selected="false" data-creator-tab="fraud">Fraud review</button></div><div data-creator-view>${M.ui.loading('กำลังเตรียม Creator Hub…')}</div></section><div class="creator-hub-modal" data-creator-modal hidden></div>`;
    const access = await gate('creator-hub', initial);
    if (!access) return;

    const scope = pageScope('admin:creator-hub');
    const state = { activeTab: 'dashboard', creators: [], campaigns: [], campaignStores: [], stores: [], attributions: [], commissions: [], contentRights: [], sessions: [], errors: [] };
    const view = document.querySelector('[data-creator-view]');
    const metrics = document.querySelector('[data-creator-metrics]');
    const modal = document.querySelector('[data-creator-modal]');
    const request = (path, options = {}) => scope.request(path, { private: true, ...options });
    const clearCaches = () => { M.network.clearCache(''); };

    const apiRows = async (path, options = {}) => {
      const result = await request(path, { cacheTtlMs: 0, ...options });
      return asArray(result);
    };

    const creatorById = id => state.creators.find(item => String(item.id) === String(id));
    const campaignById = id => state.campaigns.find(item => String(item.id) === String(id));
    const storeById = id => state.stores.find(item => String(item.id) === String(id));
    const storesForCampaign = id => state.campaignStores.filter(item => String(item.campaign_id) === String(id)).map(item => storeById(item.store_id)).filter(Boolean);
    const creatorName = id => creatorById(id)?.display_name || 'ไม่ระบุ Creator';
    const campaignName = id => campaignById(id)?.title || 'ไม่ระบุ Campaign';
    const uniqueOrderCount = rows => new Set(rows.map(item => String(item.order_id || '')).filter(Boolean)).size;
    const pendingCommission = () => state.commissions.filter(item => ['pending_qualification', 'qualified', 'approved'].includes(item.status)).reduce((total, item) => total + asNumber(item.commission_amount), 0);
    const paidCommission = () => state.commissions.filter(item => item.status === 'paid').reduce((total, item) => total + asNumber(item.commission_amount), 0);

    function metric(label, value, caption) {
      return `<article class="creator-hub-metric"><small>${h(label)}</small><strong>${h(value)}</strong><span>${h(caption)}</span></article>`;
    }

    function renderMetrics() {
      const activeCreators = state.creators.filter(item => item.status === 'active').length;
      const activeCampaigns = state.campaigns.filter(item => item.status === 'active').length;
      metrics.innerHTML = [
        metric('Creators ที่ใช้งาน', activeCreators.toLocaleString('th-TH'), `${state.creators.length.toLocaleString('th-TH')} โปรไฟล์ในระบบ`),
        metric('Campaign ที่เปิดอยู่', activeCampaigns.toLocaleString('th-TH'), `${state.campaigns.length.toLocaleString('th-TH')} Campaign ทั้งหมด`),
        metric('ออร์เดอร์ที่มี Attribution', uniqueOrderCount(state.attributions).toLocaleString('th-TH'), `${state.attributions.length.toLocaleString('th-TH')} attribution records`),
        metric('Commission ที่อยู่ระหว่างตรวจ', money(pendingCommission()), `${money(paidCommission())} เป็นรายการที่จ่ายแล้ว`),
      ].join('');
    }

    function renderDashboard() {
      const completed = state.attributions.filter(item => ['completed', 'สำเร็จแล้ว', 'paid'].includes(String(item.order_status_snapshot || '').toLowerCase())).length;
      const commissionRows = state.commissions.slice().sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))).slice(0, 8);
      view.innerHTML = `<div class="creator-hub-layout"><div><section class="creator-hub-panel"><div class="creator-hub-panel-head"><div><h2>ภาพรวม Creator Network</h2><p>แสดงเฉพาะตัวเลขที่มี source จากตาราง Creator ปัจจุบัน ระบบไม่สร้างยอด impressions หรือ clicks จำลอง</p></div><button class="mpa-button mpa-button-secondary" type="button" data-creator-tab-action="creators">จัดการ Creator</button></div><div class="creator-hub-callout"><strong>วงจรที่ระบบติดตามได้ในปัจจุบัน</strong><span>Creator → Campaign → Referral Session → Order Attribution → Commission โดยการสร้างยอดขายจริงยังขึ้นกับ Customer checkout hook และสถานะออร์เดอร์ที่มีอยู่</span></div><div class="creator-hub-funnel" style="margin-top:16px"><div class="creator-hub-funnel-row"><div><div class="creator-hub-funnel-label"><span>Referral sessions</span><b>${state.sessions.length.toLocaleString('th-TH')}</b></div><div class="creator-hub-funnel-bar"><i style="width:${state.sessions.length ? 100 : 0}%"></i></div></div><span class="creator-hub-funnel-count">1</span></div><div class="creator-hub-funnel-row"><div><div class="creator-hub-funnel-label"><span>Order attributions</span><b>${state.attributions.length.toLocaleString('th-TH')}</b></div><div class="creator-hub-funnel-bar"><i style="width:${state.sessions.length ? Math.min(100, state.attributions.length / state.sessions.length * 100) : 0}%"></i></div></div><span class="creator-hub-funnel-count">2</span></div><div class="creator-hub-funnel-row"><div><div class="creator-hub-funnel-label"><span>Completed/status snapshot</span><b>${completed.toLocaleString('th-TH')}</b></div><div class="creator-hub-funnel-bar"><i style="width:${state.attributions.length ? Math.min(100, completed / state.attributions.length * 100) : 0}%"></i></div></div><span class="creator-hub-funnel-count">3</span></div><div class="creator-hub-funnel-row"><div><div class="creator-hub-funnel-label"><span>Commission records</span><b>${state.commissions.length.toLocaleString('th-TH')}</b></div><div class="creator-hub-funnel-bar"><i style="width:${state.attributions.length ? Math.min(100, state.commissions.length / state.attributions.length * 100) : 0}%"></i></div></div><span class="creator-hub-funnel-count">4</span></div></div></section><section class="creator-hub-panel"><div class="creator-hub-panel-head"><div><h2>Commission ล่าสุด</h2><p>รายการจาก creator_commissions ที่ต้องตรวจหรือกระทบยอด</p></div><button class="mpa-button mpa-button-secondary" type="button" data-creator-tab-action="finance">เปิด Commission</button></div>${commissionRows.length ? `<div class="creator-hub-table-wrap"><table class="creator-hub-table"><thead><tr><th>Order</th><th>Creator / Campaign</th><th>ยอด Commission</th><th>สถานะ</th><th>อัปเดต</th></tr></thead><tbody>${commissionRows.map(item => `<tr><td><strong>${h(item.order_id)}</strong><small>${h(item.commission_basis || '')}</small></td><td><strong>${h(creatorName(item.creator_id))}</strong><small>${h(campaignName(item.campaign_id))}</small></td><td class="creator-hub-amount">${h(money(item.commission_amount))}</td><td>${badge(item.status)}</td><td>${h(safeDate(item.updated_at || item.created_at))}</td></tr>`).join('')}</tbody></table></div>` : empty('ยังไม่มี Commission', 'เมื่อมี attribution และยอดที่ระบบคำนวณได้ รายการจะปรากฏที่นี่')}</section></div><aside><section class="creator-hub-panel"><div class="creator-hub-panel-head"><div><h2>ขอบเขต MVP</h2><p>ฟีเจอร์ที่เปิดใช้จาก schema ปัจจุบัน</p></div></div><ul class="creator-hub-list"><li><span>Creator profile</span><strong>${state.creators.length}</strong></li><li><span>Campaign</span><strong>${state.campaigns.length}</strong></li><li><span>Content rights</span><strong>${state.contentRights.length}</strong></li><li><span>Attribution</span><strong>${state.attributions.length}</strong></li><li><span>Commission</span><strong>${state.commissions.length}</strong></li></ul></section><section class="creator-hub-panel"><div class="creator-hub-panel-head"><div><h2>ยังไม่เปิดใช้</h2><p>ยังไม่มี source ที่ปลอดภัยใน schema ปัจจุบัน</p></div></div><div class="creator-hub-callout"><strong>Impressions / Click events / Wallet / Payout / Fraud table</strong><span>ยังไม่แสดงข้อมูลจำลองและยังไม่สร้างตารางใหม่ในรอบนี้ ต้องทำ schema design และ migration แยกก่อน</span></div></section></aside></div>`;
    }

    function creatorTableRows(search = '', status = '') {
      const q = String(search || '').trim().toLowerCase();
      const rows = state.creators.filter(item => (!status || item.status === status) && [item.display_name, item.contact_name, item.local_area, item.platform, item.status].some(value => String(value || '').toLowerCase().includes(q)));
      return rows.length ? rows.map(item => `<tr><td><strong>${h(item.display_name)}</strong><small>${h(item.contact_name || item.contact_email || 'ยังไม่ระบุผู้ติดต่อ')}</small></td><td><strong>${h(item.platform || 'other')}</strong><small>${h(item.local_area || 'ยังไม่ระบุพื้นที่')}</small></td><td class="creator-hub-amount">${asNumber(item.follower_count).toLocaleString('th-TH')}</td><td>${badge(item.status)}</td><td><strong>${h(item.payout_method || 'ยังไม่ระบุ')}</strong><small>${h(item.payout_bank_name || item.payout_account_name || 'ข้อมูลถูกจำกัดใน Admin')}</small></td><td><div class="creator-hub-row-actions"><button class="mpa-button mpa-button-secondary" type="button" data-creator-detail="${h(item.id)}">ดูรายละเอียด</button><button class="mpa-button mpa-button-secondary" type="button" data-creator-status="${h(item.id)}">เปลี่ยนสถานะ</button></div></td></tr>`).join('') : `<tr><td colspan="6">${empty('ไม่พบรายการตามตัวกรอง', 'ลองเปลี่ยนคำค้นหาหรือสถานะ')}</td></tr>`;
    }

    function filterCreatorTable() {
      const search = document.getElementById('creatorSearch')?.value || '';
      const status = document.getElementById('creatorStatusFilter')?.value || '';
      const body = document.querySelector('[data-creator-table-body]');
      if (body) body.innerHTML = creatorTableRows(search, status);
    }

    function renderCreators(search = '', status = '') {
      view.innerHTML = `<div class="creator-hub-panel-head"><div><h2>Creator Master List</h2><p>Admin ตรวจและจัดการข้อมูล Creator ที่ใช้กับ Campaign และ Attribution</p></div><button class="mpa-button" type="button" data-creator-new>+ เพิ่ม Creator</button></div><div class="creator-hub-filter"><label class="creator-hub-sr-only" for="creatorSearch">ค้นหา Creator</label><input id="creatorSearch" type="search" placeholder="ค้นหาชื่อ พื้นที่ แพลตฟอร์ม หรือสถานะ" value="${h(search)}"><select id="creatorStatusFilter"><option value="">ทุกสถานะ</option>${['pending', 'active', 'paused', 'archived'].map(item => option(item, statusLabel[item], status === item)).join('')}</select></div><div class="creator-hub-table-wrap"><table class="creator-hub-table"><thead><tr><th>Creator</th><th>ช่องทาง / พื้นที่</th><th>Followers</th><th>สถานะ</th><th>ข้อมูลการจ่าย</th><th></th></tr></thead><tbody data-creator-table-body>${creatorTableRows(search, status)}</tbody></table></div>`;
      document.getElementById('creatorSearch')?.addEventListener('input', filterCreatorTable);
      document.getElementById('creatorStatusFilter')?.addEventListener('change', filterCreatorTable);
    }

    function campaignTableRows(search = '') {
      const q = String(search || '').trim().toLowerCase();
      const rows = state.campaigns.filter(item => [item.title, item.description, item.referral_code, item.status, creatorName(item.creator_id)].some(value => String(value || '').toLowerCase().includes(q)));
      return rows.length ? rows.map(item => { const stores = storesForCampaign(item.id); return `<tr><td><strong>${h(item.title)}</strong><small>${h(item.referral_code)} · window ${h(item.attribution_window_days)} วัน</small></td><td>${h(creatorName(item.creator_id))}</td><td><strong>${stores.length}</strong><small>${h(stores.slice(0, 2).map(store => store.name).join(', ') || 'ยังไม่ผูกร้าน')}</small></td><td class="creator-hub-amount">${h(asNumber(item.commission_rate))}%<small>${h(item.commission_basis)}</small></td><td><small>${h(safeDate(item.starts_at))}</small><small>ถึง ${h(safeDate(item.ends_at))}</small></td><td>${badge(item.status)}</td><td><div class="creator-hub-row-actions"><button class="mpa-button mpa-button-secondary" type="button" data-campaign-detail="${h(item.id)}">ดูรายละเอียด</button><button class="mpa-button mpa-button-secondary" type="button" data-campaign-toggle="${h(item.id)}">${item.status === 'active' ? 'พัก' : 'เปิด'}</button></div></td></tr>`; }).join('') : `<tr><td colspan="7">${empty('ไม่พบ Campaign', 'ลองเปลี่ยนคำค้นหา')}</td></tr>`;
    }

    function filterCampaignTable() {
      const search = document.getElementById('campaignSearch')?.value || '';
      const body = document.querySelector('[data-campaign-table-body]');
      if (body) body.innerHTML = campaignTableRows(search);
    }

    function renderCampaigns(search = '') {
      view.innerHTML = `<div class="creator-hub-panel-head"><div><h2>Campaign Management</h2><p>สร้าง Campaign ผูกกับ Creator และร้านจากข้อมูลจริง รองรับ referral code และช่วงเวลา</p></div><button class="mpa-button" type="button" data-campaign-new>+ สร้าง Campaign</button></div><div class="creator-hub-filter"><label class="creator-hub-sr-only" for="campaignSearch">ค้นหา Campaign</label><input id="campaignSearch" type="search" placeholder="ค้นหาชื่อ Campaign, code หรือ Creator" value="${h(search)}"></div><div class="creator-hub-table-wrap"><table class="creator-hub-table"><thead><tr><th>Campaign</th><th>Creator</th><th>ร้านที่ผูก</th><th>ค่าตอบแทน</th><th>ช่วงเวลา</th><th>สถานะ</th><th></th></tr></thead><tbody data-campaign-table-body>${campaignTableRows(search)}</tbody></table></div>`;
      document.getElementById('campaignSearch')?.addEventListener('input', filterCampaignTable);
    }
    function renderContent() {
      view.innerHTML = `<div class="creator-hub-panel-head"><div><h2>Content Rights & Moderation</h2><p>ตรวจสิทธิ์การใช้สื่อของ Creator ก่อนนำไปใช้กับร้านหรือ Campaign</p></div><span class="creator-hub-note">ข้อมูลจาก <code>creator_content_rights</code></span></div>${state.contentRights.length ? `<div class="creator-hub-table-wrap"><table class="creator-hub-table"><thead><tr><th>Content</th><th>Creator / Campaign</th><th>Platform</th><th>สิทธิ์การใช้</th><th>สถานะ consent</th><th>อัปเดต</th><th></th></tr></thead><tbody>${state.contentRights.map(item => `<tr><td><strong>${h(item.title)}</strong><small><a href="${h(item.content_url)}" target="_blank" rel="noreferrer noopener">เปิดลิงก์สื่อ</a></small></td><td><strong>${h(creatorName(item.creator_id))}</strong><small>${h(campaignName(item.campaign_id))}</small></td><td>${h(item.platform || 'other')}</td><td><strong>${h(item.usage_scope || 'organic_only')}</strong><small>${h(asArray(item.allowed_channels).join(', ') || 'ไม่ระบุ channel')}</small></td><td>${badge(item.consent_status)}</td><td>${h(safeDate(item.reviewed_at || item.updated_at))}</td><td><button class="mpa-button mpa-button-secondary" type="button" data-content-review="${h(item.id)}">ตรวจสิทธิ์</button></td></tr>`).join('')}</tbody></table></div>` : empty('ยังไม่มี Content Rights', 'เมื่อมี Creator ส่งสื่อหรือสิทธิ์การใช้มา รายการจะปรากฏที่นี่')}</div>`;
    }

    function renderAttributions() {
      view.innerHTML = `<div class="creator-hub-panel-head"><div><h2>Attribution Log</h2><p>ตรวจเส้นทาง Referral Session → Order → Creator โดยไม่แก้ Order engine โดยตรง</p></div><span class="creator-hub-note">แสดงสูงสุด 300 รายการล่าสุด</span></div>${state.attributions.length ? `<div class="creator-hub-table-wrap"><table class="creator-hub-table"><thead><tr><th>Order</th><th>Creator / Campaign</th><th>วิธีระบุแหล่งที่มา</th><th>Code snapshot</th><th>Order status snapshot</th><th>สร้างเมื่อ</th></tr></thead><tbody>${state.attributions.map(item => `<tr><td><strong>${h(item.order_id)}</strong><small>${h(item.id)}</small></td><td><strong>${h(creatorName(item.creator_id))}</strong><small>${h(campaignName(item.campaign_id))}</small></td><td>${h(item.attribution_method || 'ไม่ระบุ')}</td><td><code>${h(item.referral_code_snapshot)}</code></td><td>${h(item.order_status_snapshot || 'ยังไม่มี snapshot')}</td><td>${h(safeDate(item.created_at))}</td></tr>`).join('')}</tbody></table></div>` : empty('ยังไม่มี Attribution', 'เมื่อ Customer เข้าใช้งานผ่าน referral flow และมีการผูกออร์เดอร์ รายการจะปรากฏที่นี่')}</div>`;
    }

    function renderFinance() {
      const rows = state.commissions.slice().sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
      view.innerHTML = `<div class="creator-hub-panel-head"><div><h2>Commission Ledger</h2><p>ตรวจและเปลี่ยนสถานะ Commission ตามข้อมูลที่ระบบมีอยู่จริง โดยยังไม่สร้าง Wallet/Payout schema ใหม่</p></div><div class="creator-hub-callout"><strong>${h(money(pendingCommission()))}</strong><span>อยู่ระหว่าง qualification / approval</span></div></div>${rows.length ? `<div class="creator-hub-table-wrap"><table class="creator-hub-table"><thead><tr><th>Order / Creator</th><th>ฐานคำนวณ</th><th>Commission</th><th>สถานะ</th><th>การอนุมัติ / จ่าย</th><th></th></tr></thead><tbody>${rows.map(item => `<tr><td><strong>${h(item.order_id)}</strong><small>${h(creatorName(item.creator_id))} · ${h(campaignName(item.campaign_id))}</small></td><td>${h(item.commission_basis)}<small>${h(money(item.commissionable_amount))} × ${h(asNumber(item.commission_rate))}%</small></td><td class="creator-hub-amount">${h(money(item.commission_amount))}</td><td>${badge(item.status)}</td><td><small>${item.approved_at ? `อนุมัติ ${h(safeDate(item.approved_at))}` : 'ยังไม่อนุมัติ'}</small><small>${item.paid_at ? `จ่าย ${h(safeDate(item.paid_at))}` : 'ยังไม่จ่าย'}</small></td><td><div class="creator-hub-row-actions">${item.status !== 'paid' && item.status !== 'void' ? `<button class="mpa-button mpa-button-secondary" type="button" data-commission-approve="${h(item.id)}">${item.status === 'approved' ? 'บันทึกจ่าย' : 'อนุมัติ'}</button>` : ''}<button class="mpa-button mpa-button-secondary" type="button" data-commission-detail="${h(item.id)}">รายละเอียด</button></div></td></tr>`).join('')}</tbody></table></div>` : empty('ยังไม่มี Commission', 'ระบบจะแสดงรายการเมื่อมี Order Attribution และ calculation ที่เกี่ยวข้อง')}</div>`;
    }

    function renderFraud() {
      const held = state.commissions.filter(item => ['pending_qualification', 'void'].includes(item.status));
      view.innerHTML = `<div class="creator-hub-panel-head"><div><h2>Fraud & Risk Review</h2><p>พื้นที่ตรวจทานรายการที่ยังไม่ควรจ่ายเงิน โดยอาศัยสถานะ Commission ที่มีอยู่แล้ว</p></div></div><div class="creator-hub-callout"><strong>ยังไม่มี fraud-specific event table ใน schema ที่ตรวจพบ</strong><span>จึงยังไม่แสดงคะแนนความเสี่ยงหรือ click anomaly แบบจำลอง การเพิ่ม self-dealing, duplicate order, spam click และ multi-account detection ต้องออกแบบ schema/event/RLS แยกก่อน</span></div><div style="margin-top:16px">${held.length ? `<div class="creator-hub-table-wrap"><table class="creator-hub-table"><thead><tr><th>Order</th><th>Creator</th><th>ยอด</th><th>สถานะ</th><th>Note</th><th></th></tr></thead><tbody>${held.map(item => `<tr><td>${h(item.order_id)}</td><td>${h(creatorName(item.creator_id))}</td><td class="creator-hub-amount">${h(money(item.commission_amount))}</td><td>${badge(item.status)}</td><td>${h(item.note || 'ยังไม่มีบันทึก')}</td><td><button class="mpa-button mpa-button-secondary" type="button" data-commission-detail="${h(item.id)}">ดูรายละเอียด</button></td></tr>`).join('')}</tbody></table></div>` : empty('ไม่มีรายการที่ต้องเฝ้าระวัง', 'ยังไม่พบ Commission สถานะ pending หรือ void ในข้อมูลที่โหลดมา')}</div>`;
    }

    function render() {
      document.querySelectorAll('[data-creator-tab]').forEach(tab => { const active = tab.dataset.creatorTab === state.activeTab; tab.setAttribute('aria-selected', String(active)); });
      if (state.activeTab === 'dashboard') renderDashboard();
      if (state.activeTab === 'creators') renderCreators();
      if (state.activeTab === 'campaigns') renderCampaigns();
      if (state.activeTab === 'content') renderContent();
      if (state.activeTab === 'attributions') renderAttributions();
      if (state.activeTab === 'finance') renderFinance();
      if (state.activeTab === 'fraud') renderFraud();
    }

    function closeModal() { if (modal) { modal.hidden = true; modal.innerHTML = ''; } }
    function showModal(title, content, onReady) {
      modal.innerHTML = `<section class="creator-hub-modal-card" role="dialog" aria-modal="true" aria-labelledby="creatorHubModalTitle"><div class="creator-hub-modal-head"><div><h2 id="creatorHubModalTitle">${h(title)}</h2></div><button type="button" class="creator-hub-close" data-modal-close aria-label="ปิด">×</button></div>${content}</section>`;
      modal.hidden = false;
      modal.querySelector('[data-modal-close]')?.addEventListener('click', closeModal);
      modal.addEventListener('click', event => { if (event.target === modal) closeModal(); }, { once: true });
      onReady?.(modal.querySelector('.creator-hub-modal-card'));
    }

    function creatorForm(item = {}) {
      return `<form class="creator-hub-form" data-creator-form><label class="creator-hub-field"><span>ชื่อ Creator *</span><input name="display_name" value="${h(item.display_name)}" minlength="2" maxlength="140" required></label><label class="creator-hub-field"><span>ชื่อผู้ติดต่อ</span><input name="contact_name" value="${h(item.contact_name)}" maxlength="160"></label><label class="creator-hub-field"><span>โทรศัพท์</span><input name="contact_phone" value="${h(item.contact_phone)}" maxlength="40"></label><label class="creator-hub-field"><span>อีเมล</span><input name="contact_email" type="email" value="${h(item.contact_email)}" maxlength="180"></label><label class="creator-hub-field"><span>พื้นที่ทำงาน</span><input name="local_area" value="${h(item.local_area)}" maxlength="180" placeholder="จังหวัด / อำเภอ"></label><label class="creator-hub-field"><span>แพลตฟอร์มหลัก</span><select name="platform">${['tiktok', 'facebook', 'instagram', 'youtube', 'other'].map(value => option(value, value, item.platform === value)).join('')}</select></label><label class="creator-hub-field creator-hub-field--full"><span>Channel URL</span><input name="channel_url" type="url" value="${h(item.channel_url)}" maxlength="600" placeholder="https://..."></label><label class="creator-hub-field"><span>จำนวน Followers</span><input name="follower_count" type="number" min="0" step="1" value="${h(item.follower_count ?? 0)}"></label><label class="creator-hub-field"><span>สถานะ</span><select name="status">${['pending', 'active', 'paused', 'archived'].map(value => option(value, statusLabel[value], (item.status || 'pending') === value)).join('')}</select></label><label class="creator-hub-field"><span>วิธีรับเงิน</span><select name="payout_method">${['bank', 'qr', 'cash', 'other'].map(value => option(value, value, (item.payout_method || 'bank') === value)).join('')}</select></label><label class="creator-hub-field"><span>ธนาคาร</span><input name="payout_bank_name" value="${h(item.payout_bank_name)}" maxlength="120"></label><label class="creator-hub-field"><span>ชื่อบัญชี</span><input name="payout_account_name" value="${h(item.payout_account_name)}" maxlength="180"></label><label class="creator-hub-field"><span>เลขบัญชี</span><input name="payout_account_number" value="${h(item.payout_account_number)}" maxlength="80" autocomplete="off"></label><label class="creator-hub-field"><span>QR รับเงิน URL</span><input name="payout_qr_url" type="url" value="${h(item.payout_qr_url)}" maxlength="600"></label><label class="creator-hub-field creator-hub-field--full"><span>หมายเหตุ</span><textarea name="note" maxlength="1000">${h(item.note)}</textarea></label><div class="creator-hub-form-actions"><button type="button" class="mpa-button mpa-button-secondary" data-modal-close>ยกเลิก</button><button type="submit" class="mpa-button">บันทึก Creator</button></div></form>`;
    }

    function openCreatorForm(item = null) {
      showModal(item ? 'แก้ไข Creator' : 'เพิ่ม Creator', creatorForm(item || {}), card => {
        card.querySelector('[data-creator-form]')?.addEventListener('submit', async event => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = Object.fromEntries(new FormData(form).entries());
          const payload = { display_name: asText(data.display_name), contact_name: asText(data.contact_name), contact_phone: asText(data.contact_phone), contact_email: asText(data.contact_email), local_area: asText(data.local_area), platform: asText(data.platform, 'other'), channel_url: asText(data.channel_url), follower_count: Math.max(0, Math.trunc(asNumber(data.follower_count))), status: asText(data.status, 'pending'), payout_method: asText(data.payout_method, 'bank'), payout_bank_name: asText(data.payout_bank_name) || null, payout_account_name: asText(data.payout_account_name) || null, payout_account_number: asText(data.payout_account_number) || null, payout_qr_url: asText(data.payout_qr_url) || null, note: asText(data.note), updated_at: M.ui.nowIso() };
          if (!payload.display_name) return M.ui.setNotice('กรุณาระบุชื่อ Creator', 'error');
          const button = form.querySelector('button[type="submit"]'); button.disabled = true;
          try { if (item?.id) await request(`creators?id=eq.${encode(item.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(payload) }); else { payload.created_at = M.ui.nowIso(); await request('creators', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(payload) }); } M.ui.setNotice(item ? 'แก้ไข Creator แล้ว' : 'เพิ่ม Creator แล้ว'); closeModal(); await load(); } catch (error) { M.ui.setNotice(error.message || 'บันทึก Creator ไม่สำเร็จ', 'error'); } finally { button.disabled = false; }
        });
      });
    }

    function openCreatorDetail(id) {
      const item = creatorById(id); if (!item) return;
      const campaigns = state.campaigns.filter(campaign => String(campaign.creator_id) === String(id));
      const commissions = state.commissions.filter(commission => String(commission.creator_id) === String(id));
      showModal('รายละเอียด Creator', `<div class="creator-hub-detail-grid"><div class="creator-hub-detail"><small>ชื่อ</small><strong>${h(item.display_name)}</strong></div><div class="creator-hub-detail"><small>สถานะ</small><strong>${badge(item.status)}</strong></div><div class="creator-hub-detail"><small>ช่องทาง</small><strong>${h(item.platform)} · ${h(item.local_area || 'ไม่ระบุพื้นที่')}</strong></div><div class="creator-hub-detail"><small>Followers</small><strong>${asNumber(item.follower_count).toLocaleString('th-TH')}</strong></div><div class="creator-hub-detail"><small>ผู้ติดต่อ</small><strong>${h(item.contact_name || 'ไม่ระบุ')} · ${h(item.contact_phone || 'ไม่ระบุ')}</strong></div><div class="creator-hub-detail"><small>การจ่ายเงิน</small><strong>${h(item.payout_method || 'ไม่ระบุ')} · ${h(item.payout_bank_name || 'ไม่ระบุธนาคาร')}</strong></div></div><p class="creator-hub-note">ข้อมูลบัญชีเป็นข้อมูลอ่อนไหว แสดงเฉพาะ Admin ที่ผ่าน RLS และไม่ควรนำไปใส่ใน log หรือ URL</p><section class="creator-hub-panel" style="box-shadow:none;padding:0;border:0"><div class="creator-hub-panel-head"><div><h3>Campaign ที่รับผิดชอบ</h3></div></div>${campaigns.length ? `<ul class="creator-hub-list">${campaigns.map(campaign => `<li><span>${h(campaign.title)}</span><strong>${badge(campaign.status)}</strong></li>`).join('')}</ul>` : empty('ยังไม่มี Campaign')}</section><section class="creator-hub-panel" style="box-shadow:none;padding:0;border:0;margin-top:16px"><div class="creator-hub-panel-head"><div><h3>Link / Code ที่ใช้ได้</h3><p>สร้างจาก landing_path และ referral_code ที่มีอยู่ใน Campaign</p></div></div>${campaigns.length ? campaigns.map(campaign => `<div class="creator-hub-link" style="margin-bottom:8px"><code>${h(`${campaign.landing_path || '/'}${(campaign.landing_path || '/').includes('?') ? '&' : '?'}creator=${campaign.referral_code}`)}</code><button class="mpa-button mpa-button-secondary" type="button" data-copy-link="${h(`${campaign.landing_path || '/'}${(campaign.landing_path || '/').includes('?') ? '&' : '?'}creator=${campaign.referral_code}`)}">คัดลอก</button></div>`).join('') : empty('ยังไม่มีลิงก์')}</section><div class="creator-hub-form-actions" style="margin-top:16px"><button type="button" class="mpa-button mpa-button-secondary" data-modal-close>ปิด</button><button type="button" class="mpa-button" data-creator-edit="${h(item.id)}">แก้ไขข้อมูล</button></div>`, card => { card.querySelector('[data-creator-edit]')?.addEventListener('click', () => { closeModal(); openCreatorForm(item); }); card.querySelectorAll('[data-copy-link]').forEach(button => button.addEventListener('click', async () => { try { await navigator.clipboard.writeText(button.dataset.copyLink || ''); button.textContent = 'คัดลอกแล้ว'; } catch { M.ui.setNotice('คัดลอกลิงก์ไม่สำเร็จ กรุณาคัดลอกด้วยตนเอง', 'error'); } })); });
    }

    function openCreatorStatus(id) {
      const item = creatorById(id); if (!item) return;
      showModal('เปลี่ยนสถานะ Creator', `<form class="creator-hub-form" data-status-form><div class="creator-hub-callout creator-hub-field--full"><strong>${h(item.display_name)}</strong><span>การเปลี่ยนสถานะมีผลต่อการคัดเลือก Campaign และควรบันทึกเหตุผลใน note</span></div><label class="creator-hub-field"><span>สถานะใหม่</span><select name="status">${['pending', 'active', 'paused', 'archived'].map(value => option(value, statusLabel[value], item.status === value)).join('')}</select></label><label class="creator-hub-field creator-hub-field--full"><span>เหตุผล</span><textarea name="note" minlength="3" maxlength="500" required>${h(item.note)}</textarea></label><div class="creator-hub-form-actions"><button type="button" class="mpa-button mpa-button-secondary" data-modal-close>ยกเลิก</button><button type="submit" class="mpa-button">บันทึกสถานะ</button></div></form>`, card => card.querySelector('[data-status-form]')?.addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form).entries()); if (String(data.note || '').trim().length < 3) return M.ui.setNotice('กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร', 'error'); try { await request(`creators?id=eq.${encode(id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: data.status, note: String(data.note).trim(), updated_at: M.ui.nowIso(), reviewed_by: access.user.id, reviewed_at: M.ui.nowIso() }) }); M.ui.setNotice('เปลี่ยนสถานะ Creator แล้ว'); closeModal(); await load(); } catch (error) { M.ui.setNotice(error.message || 'เปลี่ยนสถานะไม่สำเร็จ', 'error'); } }));
    }

    function campaignForm(item = {}) {
      const selectedStores = new Set(storesForCampaign(item.id).map(store => String(store.id)));
      return `<form class="creator-hub-form" data-campaign-form><label class="creator-hub-field creator-hub-field--full"><span>ชื่อ Campaign *</span><input name="title" value="${h(item.title)}" minlength="2" maxlength="160" required></label><label class="creator-hub-field creator-hub-field--full"><span>รายละเอียด</span><textarea name="description" maxlength="2000">${h(item.description)}</textarea></label><label class="creator-hub-field"><span>Creator หลัก *</span><select name="creator_id" required><option value="">เลือก Creator</option>${state.creators.map(creator => option(creator.id, creator.display_name, String(item.creator_id) === String(creator.id))).join('')}</select></label><label class="creator-hub-field"><span>Referral code *</span><input name="referral_code" value="${h(item.referral_code)}" minlength="3" maxlength="48" pattern="[A-Z0-9][A-Z0-9-]{2,47}" placeholder="เช่น APIRAK10" required><small class="creator-hub-note">ใช้ตัวพิมพ์ใหญ่ ตัวเลข และขีดกลางเท่านั้น</small></label><label class="creator-hub-field"><span>Commission rate (%)</span><input name="commission_rate" type="number" min="0" max="100" step="0.01" value="${h(item.commission_rate ?? 0)}"></label><label class="creator-hub-field"><span>ฐานคำนวณ</span><select name="commission_basis">${['order_total', 'order_total_excluding_delivery'].map(value => option(value, value, (item.commission_basis || 'order_total_excluding_delivery') === value)).join('')}</select></label><label class="creator-hub-field"><span>Attribution window (วัน)</span><input name="attribution_window_days" type="number" min="1" max="90" step="1" value="${h(item.attribution_window_days ?? 30)}"></label><label class="creator-hub-field"><span>สถานะ</span><select name="status">${['draft', 'active', 'paused', 'ended'].map(value => option(value, statusLabel[value], (item.status || 'draft') === value)).join('')}</select></label><label class="creator-hub-field"><span>เริ่มต้น</span><input name="starts_at" type="datetime-local" value="${h(item.starts_at ? new Date(item.starts_at).toISOString().slice(0, 16) : '')}"></label><label class="creator-hub-field"><span>สิ้นสุด</span><input name="ends_at" type="datetime-local" value="${h(item.ends_at ? new Date(item.ends_at).toISOString().slice(0, 16) : '')}"></label><label class="creator-hub-field creator-hub-field--full"><span>Customer landing path</span><input name="landing_path" value="${h(item.landing_path || '/') }" maxlength="600" placeholder="ระบุ path ของ Customer ที่ deploy จริง เช่น /customer/"></label><label class="creator-hub-field creator-hub-field--full"><span>ร้านที่เข้าร่วม</span><select name="store_ids" multiple size="6">${state.stores.map(store => option(store.id, `${store.name}${store.active === false ? ' (ปิด)' : ''}`, selectedStores.has(String(store.id)))).join('')}</select><small class="creator-hub-note">เลือกได้หลายร้านตาม composite key ของ creator_campaign_stores; Merchant/Retailing ยังไม่ถูกรวมเป็นระบบเดียว</small></label><div class="creator-hub-form-actions"><button type="button" class="mpa-button mpa-button-secondary" data-modal-close>ยกเลิก</button><button type="submit" class="mpa-button">${item.id ? 'บันทึก Campaign' : 'สร้าง Campaign'}</button></div></form>`;
    }

    function openCampaignForm(item = null) {
      showModal(item ? 'แก้ไข Campaign' : 'สร้าง Campaign', campaignForm(item || {}), card => card.querySelector('[data-campaign-form]')?.addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.currentTarget; const data = Object.fromEntries(new FormData(form).entries()); const storeIds = selectedValues(form.elements.store_ids); const now = M.ui.nowIso();
        const payload = { creator_id: asText(data.creator_id), title: asText(data.title), description: asText(data.description), referral_code: asText(data.referral_code).toUpperCase(), landing_path: asText(data.landing_path, '/'), commission_rate: Math.min(100, Math.max(0, asNumber(data.commission_rate))), commission_basis: asText(data.commission_basis, 'order_total_excluding_delivery'), attribution_window_days: Math.min(90, Math.max(1, Math.trunc(asNumber(data.attribution_window_days) || 30))), status: asText(data.status, 'draft'), starts_at: data.starts_at ? new Date(data.starts_at).toISOString() : null, ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : null, updated_at: now };
        if (!payload.creator_id || !payload.title || !payload.referral_code) return M.ui.setNotice('กรุณากรอกชื่อ Creator, ชื่อ Campaign และ Referral code', 'error');
        try { let campaignId = item?.id; if (campaignId) await request(`creator_campaigns?id=eq.${encode(campaignId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(payload) }); else { payload.created_by = access.user.id; payload.created_at = now; const created = await request('creator_campaigns', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload) }); campaignId = created?.[0]?.id; } if (!campaignId) throw new Error('ระบบไม่คืนรหัส Campaign'); await request(`creator_campaign_stores?campaign_id=eq.${encode(campaignId)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }).catch(() => {}); if (storeIds.length) await request('creator_campaign_stores', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(storeIds.map(storeId => ({ campaign_id: campaignId, store_id: storeId }))) }); M.ui.setNotice(item ? 'บันทึก Campaign แล้ว' : 'สร้าง Campaign แล้ว'); closeModal(); await load(); } catch (error) { M.ui.setNotice(error.message || 'บันทึก Campaign ไม่สำเร็จ ตรวจ referral code และสิทธิ์ Admin', 'error'); }
      }));
    }

    function openCampaignDetail(id) {
      const item = campaignById(id); if (!item) return;
      const stores = storesForCampaign(id);
      showModal('รายละเอียด Campaign', `<div class="creator-hub-detail-grid"><div class="creator-hub-detail"><small>ชื่อ</small><strong>${h(item.title)}</strong></div><div class="creator-hub-detail"><small>Creator</small><strong>${h(creatorName(item.creator_id))}</strong></div><div class="creator-hub-detail"><small>Referral code</small><strong><code>${h(item.referral_code)}</code></strong></div><div class="creator-hub-detail"><small>Commission</small><strong>${h(asNumber(item.commission_rate))}% · ${h(item.commission_basis)}</strong></div><div class="creator-hub-detail"><small>Window</small><strong>${h(item.attribution_window_days)} วัน</strong></div><div class="creator-hub-detail"><small>สถานะ</small><strong>${badge(item.status)}</strong></div></div><div class="creator-hub-callout"><strong>ร้านที่เข้าร่วม</strong><span>${h(stores.map(store => store.name).join(', ') || 'ยังไม่ผูกร้าน')}</span></div><p class="creator-hub-note" style="margin-top:12px">${h(item.description || 'ไม่มีรายละเอียดเพิ่มเติม')}</p><div class="creator-hub-form-actions" style="margin-top:16px"><button type="button" class="mpa-button mpa-button-secondary" data-modal-close>ปิด</button><button type="button" class="mpa-button" data-campaign-edit="${h(item.id)}">แก้ไข Campaign</button></div>`, card => card.querySelector('[data-campaign-edit]')?.addEventListener('click', () => { closeModal(); openCampaignForm(item); }));
    }

    async function toggleCampaign(id) {
      const item = campaignById(id); if (!item) return;
      const next = item.status === 'active' ? 'paused' : 'active';
      if (!window.confirm(`${next === 'active' ? 'เปิด' : 'พัก'} Campaign ${item.title} หรือไม่?`)) return;
      try { await request(`creator_campaigns?id=eq.${encode(id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: next, updated_at: M.ui.nowIso() }) }); M.ui.setNotice(`เปลี่ยนสถานะ Campaign เป็น ${statusLabel[next]} แล้ว`); await load(); } catch (error) { M.ui.setNotice(error.message || 'เปลี่ยนสถานะ Campaign ไม่สำเร็จ', 'error'); }
    }

    function openContentReview(id) {
      const item = state.contentRights.find(row => String(row.id) === String(id)); if (!item) return;
      showModal('ตรวจสิทธิ์ Content', `<div class="creator-hub-detail-grid"><div class="creator-hub-detail"><small>ชื่อ Content</small><strong>${h(item.title)}</strong></div><div class="creator-hub-detail"><small>Creator</small><strong>${h(creatorName(item.creator_id))}</strong></div><div class="creator-hub-detail"><small>Platform</small><strong>${h(item.platform)}</strong></div><div class="creator-hub-detail"><small>Usage scope</small><strong>${h(item.usage_scope)}</strong></div></div><p class="creator-hub-note"><a href="${h(item.content_url)}" target="_blank" rel="noreferrer noopener">เปิด Content URL</a></p><form class="creator-hub-form" data-content-form><label class="creator-hub-field"><span>Consent status</span><select name="consent_status">${['pending', 'approved', 'revoked', 'expired'].map(value => option(value, statusLabel[value], item.consent_status === value)).join('')}</select></label><label class="creator-hub-field creator-hub-field--full"><span>หมายเหตุการตรวจ</span><textarea name="note" minlength="3" maxlength="1000" required>${h(item.note)}</textarea></label><div class="creator-hub-form-actions"><button type="button" class="mpa-button mpa-button-secondary" data-modal-close>ยกเลิก</button><button type="submit" class="mpa-button">บันทึกผลตรวจ</button></div></form>`, card => card.querySelector('[data-content-form]')?.addEventListener('submit', async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget).entries()); if (String(data.note || '').trim().length < 3) return M.ui.setNotice('กรุณาระบุหมายเหตุอย่างน้อย 3 ตัวอักษร', 'error'); try { await request(`creator_content_rights?id=eq.${encode(id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ consent_status: data.consent_status, note: String(data.note).trim(), reviewed_by: access.user.id, reviewed_at: M.ui.nowIso(), updated_at: M.ui.nowIso() }) }); M.ui.setNotice('บันทึกผลตรวจ Content แล้ว'); closeModal(); await load(); } catch (error) { M.ui.setNotice(error.message || 'บันทึกผลตรวจไม่สำเร็จ', 'error'); } }));
    }

    function openCommissionDetail(id) {
      const item = state.commissions.find(row => String(row.id) === String(id)); if (!item) return;
      const normalizedStatus = String(item.status || '').toLowerCase();
      const finalized = ['paid', 'void'].includes(normalizedStatus);
      const allowedActions = normalizedStatus === 'approved' ? ['paid', 'void'] : ['pending_qualification', 'qualified'].includes(normalizedStatus) ? ['approved', 'void'] : [];
      const actionOptions = allowedActions.map(action => option(action, action === 'paid' ? 'บันทึกว่าจ่ายแล้ว' : action === 'approved' ? 'อนุมัติ Commission' : 'ยกเลิกสิทธิ์/พักจ่าย')).join('');
      const detailMarkup = `<div class="creator-hub-detail-grid"><div class="creator-hub-detail"><small>Order</small><strong>${h(item.order_id)}</strong></div><div class="creator-hub-detail"><small>Creator</small><strong>${h(creatorName(item.creator_id))}</strong></div><div class="creator-hub-detail"><small>Campaign</small><strong>${h(campaignName(item.campaign_id))}</strong></div><div class="creator-hub-detail"><small>ยอดคำนวณ</small><strong>${h(money(item.commissionable_amount))} × ${h(asNumber(item.commission_rate))}%</strong></div><div class="creator-hub-detail"><small>Commission</small><strong>${h(money(item.commission_amount))}</strong></div><div class="creator-hub-detail"><small>สถานะ</small><strong>${badge(item.status)}</strong></div></div>`;
      const readonlyMarkup = `<div class="creator-hub-callout"><strong>${finalized ? 'รายการนี้ปิดสถานะแล้ว' : 'ยังไม่มี transition ที่อนุญาตใน Admin Hub'}</strong><span>${finalized ? 'Commission ที่ paid หรือ void ไม่สามารถแก้ไขจาก Admin Hub ได้' : 'สถานะนี้ต้องผ่าน workflow ที่มีการกำหนดสิทธิ์เพิ่มเติมก่อนจึงจะเปลี่ยนได้'}</span></div><div class="creator-hub-form-actions" style="margin-top:16px"><button type="button" class="mpa-button mpa-button-secondary" data-modal-close>ปิด</button></div>`;
      const formMarkup = `<form class="creator-hub-form" data-commission-form><label class="creator-hub-field"><span>การดำเนินการ</span><select name="action" required>${actionOptions}</select></label><label class="creator-hub-field"><span>เลขอ้างอิงการจ่าย (ถ้ามี)</span><input name="payout_reference" maxlength="160" value="${h(item.payout_reference)}"></label><label class="creator-hub-field creator-hub-field--full"><span>เหตุผล / หมายเหตุ *</span><textarea name="note" minlength="3" maxlength="1000" required>${h(item.note)}</textarea></label><div class="creator-hub-form-actions"><button type="button" class="mpa-button mpa-button-secondary" data-modal-close>ยกเลิก</button><button type="submit" class="mpa-button">บันทึก</button></div></form>`;
      showModal('Commission Detail', detailMarkup + (finalized || !allowedActions.length ? readonlyMarkup : formMarkup), card => {
        if (finalized || !allowedActions.length) return;
        card.querySelector('[data-commission-form]')?.addEventListener('submit', async event => {
          event.preventDefault();
          const data = Object.fromEntries(new FormData(event.currentTarget).entries());
          if (!allowedActions.includes(data.action)) return M.ui.setNotice('การเปลี่ยนสถานะ Commission ไม่อยู่ในลำดับที่อนุญาต', 'error');
          if (String(data.note || '').trim().length < 3) return M.ui.setNotice('กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร', 'error');
          const patch = { status: data.action, note: String(data.note).trim(), updated_at: M.ui.nowIso() };
          if (data.action === 'approved') Object.assign(patch, { approved_by: access.user.id, approved_at: M.ui.nowIso() });
          if (data.action === 'paid') Object.assign(patch, { paid_by: access.user.id, paid_at: M.ui.nowIso(), payout_reference: asText(data.payout_reference) || null });
          try { await request(`creator_commissions?id=eq.${encode(id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) }); M.ui.setNotice('อัปเดต Commission แล้ว'); closeModal(); await load(); } catch (error) { M.ui.setNotice(error.message || 'อัปเดต Commission ไม่สำเร็จ', 'error'); }
        });
      });
    }
    async function load() {
      metrics.innerHTML = M.ui.loading('กำลังอ่านข้อมูล Creator…');
      view.innerHTML = M.ui.loading('กำลังอ่านข้อมูลจาก Supabase…');
      state.errors = [];
      const tasks = [
        ['creators', apiRows('creators?select=id,display_name,contact_name,contact_phone,contact_email,local_area,platform,channel_url,follower_count,status,payout_method,payout_bank_name,payout_account_name,payout_account_number,payout_qr_url,note,reviewed_by,reviewed_at,created_at,updated_at&order=created_at.desc&limit=500')],
        ['campaigns', apiRows('creator_campaigns?select=id,creator_id,title,description,referral_code,landing_path,commission_rate,commission_basis,attribution_window_days,status,starts_at,ends_at,created_by,created_at,updated_at&order=created_at.desc&limit=500')],
        ['campaignStores', apiRows('creator_campaign_stores?select=campaign_id,store_id,created_at&order=created_at.desc&limit=1000')],
        ['stores', apiRows('stores?select=id,name,active&order=name.asc&limit=500')],
        ['attributions', apiRows('creator_order_attributions?select=id,order_id,campaign_id,creator_id,referral_session_id,attribution_method,referral_code_snapshot,order_status_snapshot,created_at,updated_at&order=created_at.desc&limit=300')],
        ['commissions', apiRows('creator_commissions?select=id,attribution_id,creator_id,campaign_id,order_id,commission_rate,commission_basis,commissionable_amount,commission_amount,status,qualified_at,approved_at,approved_by,payout_reference,paid_at,paid_by,note,created_at,updated_at&order=created_at.desc&limit=300')],
        ['contentRights', apiRows('creator_content_rights?select=id,creator_id,campaign_id,title,content_url,platform,allowed_channels,usage_scope,consent_status,consent_proof_url,starts_at,expires_at,note,reviewed_by,reviewed_at,created_at,updated_at&order=created_at.desc&limit=300')],
        ['sessions', apiRows('creator_referral_sessions?select=id,campaign_id,anonymous_token,customer_id,landing_path,source_url,first_seen_at,last_seen_at,expires_at,converted_at&order=first_seen_at.desc&limit=300')],
      ];
      const results = await Promise.allSettled(tasks.map(item => item[1]));
      tasks.forEach(([key], index) => { const result = results[index]; if (result.status === 'fulfilled') state[key] = result.value; else { state[key] = []; state.errors.push(`${key}: ${result.reason?.message || 'โหลดไม่สำเร็จ'}`); } });
      renderMetrics(); render();
      if (state.errors.length) M.ui.setNotice(`โหลดบางส่วนไม่สำเร็จ: ${state.errors.join(' · ')}`, 'error');
    }

    document.addEventListener('click', event => {
      const tab = event.target.closest?.('[data-creator-tab]'); if (tab) { state.activeTab = tab.dataset.creatorTab; render(); return; }
      const tabAction = event.target.closest?.('[data-creator-tab-action]'); if (tabAction) { state.activeTab = tabAction.dataset.creatorTabAction; render(); return; }
      if (event.target.closest?.('[data-creator-refresh]')) { clearCaches(); void load(); return; }
      if (event.target.closest?.('[data-creator-new]')) { openCreatorForm(); return; }
      const detail = event.target.closest?.('[data-creator-detail]'); if (detail) { openCreatorDetail(detail.dataset.creatorDetail); return; }
      const creatorStatus = event.target.closest?.('[data-creator-status]'); if (creatorStatus) { openCreatorStatus(creatorStatus.dataset.creatorStatus); return; }
      const campaignNew = event.target.closest?.('[data-campaign-new]'); if (campaignNew) { openCampaignForm(); return; }
      const campaignDetail = event.target.closest?.('[data-campaign-detail]'); if (campaignDetail) { openCampaignDetail(campaignDetail.dataset.campaignDetail); return; }
      const campaignToggle = event.target.closest?.('[data-campaign-toggle]'); if (campaignToggle) { void toggleCampaign(campaignToggle.dataset.campaignToggle); return; }
      const contentReview = event.target.closest?.('[data-content-review]'); if (contentReview) { openContentReview(contentReview.dataset.contentReview); return; }
      const commissionDetail = event.target.closest?.('[data-commission-detail]'); if (commissionDetail) { openCommissionDetail(commissionDetail.dataset.commissionDetail); return; }
      const commissionApprove = event.target.closest?.('[data-commission-approve]'); if (commissionApprove) { openCommissionDetail(commissionApprove.dataset.commissionApprove); }
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });
    await load();
  };

  window.APServiceAdminPatch = window.APServiceAdminPatch || {};
  window.APServiceAdminPatch['creator-hub'] = creatorHub;
})();
