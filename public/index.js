import { isMobileUA, escapeHTML, fmtDateTH } from './main.js';

const qEl = document.getElementById('q');
const catEl = document.getElementById('cat');
const searchBtn = document.getElementById('searchBtn');
const listEl = document.getElementById('list');
const yearEl = document.getElementById('year');
const deviceNoteEl = document.getElementById('deviceNote');

yearEl.textContent = new Date().getFullYear();
deviceNoteEl.textContent = `อุปกรณ์ของคุณ: ${isMobileUA() ? 'มือถือ/แท็บเล็ต' : 'คอมพิวเตอร์'} — ปุ่มหลักจะเลือกไฟล์ให้เหมาะกับอุปกรณ์`;

async function loadCategories() {
  const res = await fetch('/api/apps/categories');
  const cats = await res.json();
  for (const c of cats) {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    catEl.appendChild(opt);
  }
}

function appCardHTML(app) {
  const profileUrl = app.profile_path ? `/uploads/profile/${app.profile_path.split(/[\\/]/).pop()}` : '';
  const desktopAvailable = !!app.desktop_file_path;
  const mobileAvailable = !!app.mobile_file_path;

  const btnTextPrimary = isMobileUA() ? 'ดาวโหลดเวอร์ชั่น APK' : 'ดาวโหลด เวอร์ชั่น PC';
  const hrefPrimary = isMobileUA()
    ? (mobileAvailable ? `/api/apps/${app.id}/download?device=mobile` : '#')
    : (desktopAvailable ? `/api/apps/${app.id}/download?device=desktop` : '#');
  const primaryClass = (isMobileUA() ? mobileAvailable : desktopAvailable) ? 'btn primary' : 'btn gray';

  const hrefDesktop = desktopAvailable ? `/api/apps/${app.id}/download?device=desktop` : '#';
  const hrefMobile = mobileAvailable ? `/api/apps/${app.id}/download?device=mobile` : '#';

  return `
    <div class="card app">
      <div>
        ${profileUrl
          ? `<img src="${profileUrl}" alt="โปรไฟล์แอพ" />`
          : `<div style="width:72px;height:72px;border-radius:10px;border:1px solid #263057;background:#0f1220;display:flex;align-items:center;justify-content:center;font-size:11px;color:#7e89a9;">ไม่มีรูป</div>`}
      </div>
      <div>
        <h3>${escapeHTML(app.name)} <span style="color:#8fa2d9;font-weight:500;">(${escapeHTML(app.category)})</span></h3>
        <div class="meta">
          <span class="tag">เวอร์ชั่น PC: ${app.desktop_version ? escapeHTML(app.desktop_version) : '-'}</span>
          <span class="tag">เวอร์ชั่น APK: ${app.mobile_version ? escapeHTML(app.mobile_version) : '-'}</span>
          <span class="tag">อัปโหลด: ${fmtDateTH(app.created_at)}</span>
        </div>
        <div class="sep"></div>
        <div style="font-size:13px; color:#dbe2f6;">${escapeHTML(app.description)}</div>
        <div class="sep"></div>
        <div class="row">
          <a class="${primaryClass}" href="${hrefPrimary}">${btnTextPrimary}</a>
          <a class="${desktopAvailable ? 'btn' : 'btn gray'}" href="${hrefDesktop}">ไฟล์เดสก์ท็อป</a>
          <a class="${mobileAvailable ? 'btn' : 'btn gray'}" href="${hrefMobile}">ไฟล์มือถือ</a>
          <a class="btn" href="/app.html?id=${app.id}">รายละเอียด</a>
        </div>
      </div>
    </div>
  `;
}

async function loadList() {
  const params = new URLSearchParams();
  if (qEl.value.trim()) params.set('q', qEl.value.trim());
  if (catEl.value.trim()) params.set('cat', catEl.value.trim());

  const res = await fetch('/api/apps?' + params.toString());
  const apps = await res.json();

  listEl.innerHTML = apps.length
    ? apps.map(appCardHTML).join('')
    : `<div class="card">ยังไม่มีรายการแอพ/โปรแกรม หรือไม่พบผลการค้นหา</div>`;
}

searchBtn.addEventListener('click', loadList);
qEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadList(); });
catEl.addEventListener('change', loadList);

await loadCategories();
await loadList();