const form = document.getElementById('uploadForm');
const resultEl = document.getElementById('result');
const yearEl = document.getElementById('year');
yearEl.textContent = new Date().getFullYear();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  resultEl.textContent = 'กำลังอัปโหลด...';

  const fd = new FormData(form);

  try {
    const res = await fetch('/api/apps', {
      method: 'POST',
      body: fd
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.errors ? data.errors.join(', ') : (data?.error || 'อัปโหลดล้มเหลว');
      resultEl.textContent = msg;
      resultEl.style.color = '#ff5d6c';
      return;
    }
    resultEl.textContent = 'อัปโหลดสำเร็จ! กำลังพาไปหน้าแอพ...';
    resultEl.style.color = '#00c2a8';
    setTimeout(() => {
      window.location.href = `/app.html?id=${data.id}`;
    }, 800);
  } catch (err) {
    resultEl.textContent = 'เกิดข้อผิดพลาด: ' + err.message;
    resultEl.style.color = '#ff5d6c';
  }
});