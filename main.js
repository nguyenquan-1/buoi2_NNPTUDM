const API = "http://localhost:3000";

// ====== HELPERS ======
async function getMaxIdAsNumber(url) {
  // Lấy toàn bộ, parse id dạng số để tìm max (id lưu chuỗi)
  const res = await fetch(url);
  if (!res.ok) return 0;
  const arr = await res.json();
  let max = 0;
  for (const item of arr) {
    const n = parseInt(item.id, 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return max;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ====== POSTS ======
async function GetPosts() {
  try {
    const res = await fetch(`${API}/posts`);
    if (!res.ok) return;

    const posts = await res.json();
    const bodyTable = document.getElementById("posts-body-table");
    bodyTable.innerHTML = "";

    for (const post of posts) {
      bodyTable.innerHTML += postToRowHTML(post);
    }
  } catch (e) {
    console.log(e);
  }
}

function postToRowHTML(post) {
  const isDeleted = !!post.isDeleted;
  const trClass = isDeleted ? "deleted" : "";
  return `
    <tr class="${trClass}">
      <td>${escapeHtml(post.id)}</td>
      <td>${escapeHtml(post.title)}</td>
      <td>${escapeHtml(post.views)}</td>
      <td>${isDeleted ? "true" : "false"}</td>
      <td>
        <input type="submit" value="Soft Delete" onclick="SoftDeletePost('${escapeHtml(post.id)}')" />
      </td>
    </tr>
  `;
}

async function SavePost() {
  const id = document.getElementById("post_id_txt").value.trim(); // tạo mới -> để trống
  const title = document.getElementById("post_title_txt").value;
  const views = document.getElementById("post_views_txt").value;

  try {
    if (id === "") {
      // CREATE: id = maxId + 1 (lưu chuỗi)
      const maxId = await getMaxIdAsNumber(`${API}/posts`);
      const newId = String(maxId + 1);

      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId,
          title: title,
          views: views,
          isDeleted: false
        })
      });

      if (!res.ok) console.log("Create post failed");
    } else {
      // UPDATE: dùng PATCH để không làm mất isDeleted
      const res = await fetch(`${API}/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          views: views
        })
      });

      if (!res.ok) console.log("Update post failed");
    }

    await GetPosts();
    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function SoftDeletePost(id) {
  try {
    const res = await fetch(`${API}/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDeleted: true })
    });

    if (res.ok) await GetPosts();
    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
}

// ====== COMMENTS (CRUD) ======
async function GetComments() {
  try {
    const res = await fetch(`${API}/comments`);
    if (!res.ok) return;

    const comments = await res.json();
    const bodyTable = document.getElementById("comments-body-table");
    bodyTable.innerHTML = "";

    for (const c of comments) {
      bodyTable.innerHTML += commentToRowHTML(c);
    }
  } catch (e) {
    console.log(e);
  }
}

function commentToRowHTML(c) {
  return `
    <tr>
      <td>${escapeHtml(c.id)}</td>
      <td>${escapeHtml(c.text)}</td>
      <td>${escapeHtml(c.postId)}</td>
      <td>
        <input type="submit" value="Delete" onclick="DeleteComment('${escapeHtml(c.id)}')" />
      </td>
    </tr>
  `;
}

async function SaveComment() {
  const id = document.getElementById("cmt_id_txt").value.trim(); // để trống -> auto id
  const text = document.getElementById("cmt_text_txt").value;
  const postId = document.getElementById("cmt_postId_txt").value;

  try {
    if (id === "") {
      const maxId = await getMaxIdAsNumber(`${API}/comments`);
      const newId = String(maxId + 1);

      const res = await fetch(`${API}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId,
          text: text,
          postId: String(postId) // đảm bảo chuỗi
        })
      });

      if (!res.ok) console.log("Create comment failed");
    } else {
      const res = await fetch(`${API}/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          postId: String(postId)
        })
      });

      if (!res.ok) console.log("Update comment failed");
    }

    await GetComments();
    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function DeleteComment(id) {
  try {
    const res = await fetch(`${API}/comments/${id}`, { method: "DELETE" });
    if (res.ok) await GetComments();
    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
}

// ====== INIT ======
GetPosts();
GetComments();
