// Victoria manages blog content herself via "Write New Post".
// Stored in this browser's localStorage — simple and independent of the main database.

const blogPostsData = {};

window.openBlogPost = function(postId) {
  const post = blogPostsData[postId];
  if (!post) return;
  const modal = document.getElementById('blogModal');
  const content = document.getElementById('blogModalContent');
  if (!modal || !content) return;

  const tagHtml = post.tags.map(t => `<span class="blog-tag ${t.toLowerCase().replace(' ', '')}">${t}</span>`).join('');
  content.innerHTML = `
    <div class="blog-post-content">
      <div class="blog-post-meta">
        ${tagHtml}
        <span class="blog-date"><i class="fas fa-calendar-alt"></i> ${post.date}</span>
        <span class="blog-read"><i class="fas fa-clock"></i> ${post.readTime}</span>
      </div>
      <h1>${post.title}</h1>
      ${post.content}
      <div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--mid);display:flex;align-items:center;gap:.75rem">
        <img src="1691446996009.jpg" alt="Victoria" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--gold)" onerror="this.style.display='none'"/>
        <div>
          <strong style="color:var(--light);display:block">Victoria Amarachi Philip</strong>
          <span style="font-size:.85rem;color:var(--muted)">IT Administrator → DevOps Professional</span>
        </div>
        <a href="index.html#contact" style="margin-left:auto" class="btn-primary" onclick="closeBlogModal()">
          <i class="fas fa-envelope"></i> Get in Touch
        </a>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeBlogModal = function(e) {
  const modal = document.getElementById('blogModal');
  if (e && e.target !== modal) return;
  modal && (modal.style.display = 'none');
  document.body.style.overflow = '';
};

window.filterBlogPosts = function() {
  const query = document.getElementById('blogSearch')?.value.toLowerCase() || '';
  const cards = document.querySelectorAll('.blog-card');
  let visibleCount = 0;
  cards.forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
    const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
    const show = !query || title.includes(query) || desc.includes(query);
    card.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  });
  const empty = document.getElementById('blogEmpty');
  if (empty) empty.style.display = visibleCount === 0 ? 'block' : 'none';
};

window.filterBlogByTag = function(btn) {
  document.querySelectorAll('.filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filter = btn.dataset.filter;
  document.querySelectorAll('.blog-card').forEach(card => {
    const tags = (card.dataset.tags || '').split(' ');
    card.style.display = filter === 'all' || tags.includes(filter) ? '' : 'none';
  });
};

window.toggleWritePost = function() {
  const form = document.getElementById('writePostForm');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
};

window.publishPost = function() {
  const title = document.getElementById('postTitle')?.value.trim();
  const category = document.getElementById('postCategory')?.value;
  const excerpt = document.getElementById('postExcerpt')?.value.trim();
  const content = document.getElementById('postContent')?.value.trim();
  const readTime = document.getElementById('postReadTime')?.value.trim() || '5 min';
  const dateVal = document.getElementById('postDate')?.value;

  if (!title || !excerpt) { alert('Title and excerpt are required.'); return; }

  const date = dateVal ? new Date(dateVal + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Now';
  const id = 'custom-' + Date.now();
  blogPostsData[id] = { title, tags: [category], date, readTime: readTime + ' read', content: content || `<p>${excerpt}</p>` };

  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  const gradients = {
    devops: 'linear-gradient(135deg,#4776e6,#8e54e9)', database: 'linear-gradient(135deg,#6a11cb,#2575fc)',
    career: 'linear-gradient(135deg,#f953c6,#b91d73)', automation: 'linear-gradient(135deg,#11998e,#38ef7d)',
    it: 'linear-gradient(135deg,#fc4a1a,#f7b733)',
  };
  const icons = { devops: 'fa-code-branch', database: 'fa-database', career: 'fa-user-graduate', automation: 'fa-robot', it: 'fa-server' };

  const card = document.createElement('article');
  card.className = 'blog-card fade-in visible';
  card.dataset.tags = category;
  card.innerHTML = `
    <div class="blog-card-header" style="background:${gradients[category] || 'linear-gradient(135deg,#667eea,#764ba2)'}">
      <i class="fas ${icons[category] || 'fa-pen'} blog-card-icon"></i>
    </div>
    <div class="blog-card-body">
      <div class="blog-card-meta"><span class="blog-tag ${category}">${category}</span><span class="blog-date-sm">${date}</span></div>
      <h3>${title}</h3>
      <p>${excerpt}</p>
      <div class="blog-card-footer">
        <span class="read-time"><i class="fas fa-clock"></i> ${readTime}</span>
        <button class="blog-read-link" onclick="openBlogPost('${id}')">Read More <i class="fas fa-arrow-right"></i></button>
      </div>
    </div>
  `;
  grid.prepend(card);
  toggleWritePost();
  document.querySelector('.blog-empty-state')?.style.setProperty('display', 'none');
  document.getElementById('postTitle').value = '';
  document.getElementById('postExcerpt').value = '';
  document.getElementById('postContent').value = '';

  try {
    const saved = JSON.parse(localStorage.getItem('portfolio_blog_posts') || '[]');
    saved.unshift({ id, title, category, excerpt, content, readTime, date });
    localStorage.setItem('portfolio_blog_posts', JSON.stringify(saved.slice(0, 20)));
  } catch (e) { /* ignore */ }
};

// Restore posts saved in this browser
(function loadBlogPosts() {
  try {
    const saved = JSON.parse(localStorage.getItem('portfolio_blog_posts') || '[]');
    if (!saved.length) return;
    document.querySelector('.blog-empty-state')?.style.setProperty('display', 'none');
    saved.forEach(p => {
      blogPostsData[p.id] = { title: p.title, tags: [p.category], date: p.date, readTime: p.readTime + ' read', content: p.content || `<p>${p.excerpt}</p>` };
    });
    const grid = document.getElementById('blogGrid');
    if (!grid) return;
    const gradients = {
      devops: 'linear-gradient(135deg,#4776e6,#8e54e9)', database: 'linear-gradient(135deg,#6a11cb,#2575fc)',
      career: 'linear-gradient(135deg,#f953c6,#b91d73)', automation: 'linear-gradient(135deg,#11998e,#38ef7d)',
      it: 'linear-gradient(135deg,#fc4a1a,#f7b733)',
    };
    const icons = { devops: 'fa-code-branch', database: 'fa-database', career: 'fa-user-graduate', automation: 'fa-robot', it: 'fa-server' };
    saved.forEach(p => {
      const card = document.createElement('article');
      card.className = 'blog-card fade-in visible';
      card.dataset.tags = p.category;
      card.innerHTML = `
        <div class="blog-card-header" style="background:${gradients[p.category] || 'linear-gradient(135deg,#667eea,#764ba2)'}">
          <i class="fas ${icons[p.category] || 'fa-pen'} blog-card-icon"></i>
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta"><span class="blog-tag ${p.category}">${p.category}</span><span class="blog-date-sm">${p.date}</span></div>
          <h3>${p.title}</h3>
          <p>${p.excerpt}</p>
          <div class="blog-card-footer">
            <span class="read-time"><i class="fas fa-clock"></i> ${p.readTime}</span>
            <button class="blog-read-link" onclick="openBlogPost('${p.id}')">Read More <i class="fas fa-arrow-right"></i></button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (e) { /* ignore */ }
})();
