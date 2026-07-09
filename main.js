const titleInput = document.getElementById("titleInput");
const settingsButton = document.getElementById("settingsButton");
const backButton = document.getElementById("backButton");
const mainView = document.getElementById("mainView");
const settingsView = document.getElementById("settingsView");

const tagArea = document.getElementById("tagArea");
const itemList = document.getElementById("itemList");

const addDialog = document.getElementById("addDialog");
const dialogTitleInput = document.getElementById("dialogTitleInput");
const dialogTagArea = document.getElementById("dialogTagArea");
const saveItemButton = document.getElementById("saveItemButton");

const showDateToggle = document.getElementById("showDateToggle");
const tagSettingsList = document.getElementById("tagSettingsList");
const newTagInput = document.getElementById("newTagInput");
const addTagButton = document.getElementById("addTagButton");

let tags = ["映画", "アニメ", "小説", "漫画", "まだ途中", "進捗あり", "END", "面白い", "捨て"];

let items = [
  {
    title: "死神の制度",
    createdAt: "2025-05-12",
    tags: ["小説", "END", "面白い"]
  },
  {
    title: "人間失格",
    createdAt: "2023-02-26",
    tags: ["小説", "END", "面白い"]
  }
];

let activeTag = "";
let selectedDialogTags = [];
let settings = {
  showCreatedDate: true
};

function render() {
  renderTags();
  renderItems();
  renderSettings();
}

function renderTags() {
  tagArea.innerHTML = "";

  tags.forEach(tag => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tag-button";
    button.textContent = tag;

    if (tag === activeTag) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      activeTag = activeTag === tag ? "" : tag;
      render();
    });

    tagArea.appendChild(button);
  });
}

function renderItems() {
  const keyword = titleInput.value.trim().toLowerCase();

  const filteredItems = items.filter(item => {
    const matchesKeyword = item.title.toLowerCase().includes(keyword);
    const matchesTag = activeTag === "" || item.tags.includes(activeTag);
    return matchesKeyword && matchesTag;
  });

  itemList.innerHTML = "";

  filteredItems.forEach(item => {
    const row = document.createElement("article");
    row.className = "item-row";

    const titleLine = document.createElement("div");
    titleLine.className = "item-title-line";

    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = item.title;

    titleLine.appendChild(title);

    if (settings.showCreatedDate) {
      const date = document.createElement("div");
      date.className = "item-date";
      date.textContent = formatDate(item.createdAt);
      titleLine.appendChild(date);
    }

    const tagLine = document.createElement("div");
    tagLine.className = "item-tags";

    const visibleTags = item.tags.filter(tag => tag !== activeTag);
    tagLine.textContent = visibleTags.join("　");

    row.appendChild(titleLine);
    row.appendChild(tagLine);
    itemList.appendChild(row);
  });
}

function renderSettings() {
  showDateToggle.checked = settings.showCreatedDate;
  tagSettingsList.innerHTML = "";

  tags.forEach(tag => {
    const row = document.createElement("div");
    row.className = "tag-setting-row";

    const name = document.createElement("span");
    name.textContent = tag;

    const renameButton = document.createElement("button");
    renameButton.type = "button";
    renameButton.textContent = "名前変更";
    renameButton.addEventListener("click", () => renameTag(tag));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => deleteTag(tag));

    row.appendChild(name);
    row.appendChild(renameButton);
    row.appendChild(deleteButton);
    tagSettingsList.appendChild(row);
  });
}

function openAddDialog() {
  const title = titleInput.value.trim();

  if (title === "") {
    return;
  }

  const sameTitleCount = items.filter(item => item.title === title).length;

  if (sameTitleCount > 0) {
    const ok = confirm(`「${title}」はすでに ${sameTitleCount} 件あります。新しい記録として追加しますか？`);
    if (!ok) {
      return;
    }
  }

  dialogTitleInput.value = title;
  selectedDialogTags = [];
  renderDialogTags();
  addDialog.showModal();
}

function renderDialogTags() {
  dialogTagArea.innerHTML = "";

  tags.forEach(tag => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tag-button";
    button.textContent = tag;

    if (selectedDialogTags.includes(tag)) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      if (selectedDialogTags.includes(tag)) {
        selectedDialogTags = selectedDialogTags.filter(selectedTag => selectedTag !== tag);
      } else {
        selectedDialogTags.push(tag);
      }

      renderDialogTags();
    });

    dialogTagArea.appendChild(button);
  });
}

function saveItem() {
  const title = dialogTitleInput.value.trim();

  if (title === "") {
    return;
  }

  items.unshift({
    title,
    createdAt: getTodayString(),
    tags: [...selectedDialogTags]
  });

  titleInput.value = "";
  addDialog.close();
  render();
}

function renameTag(oldTag) {
  const newTag = prompt("新しいタグ名", oldTag);

  if (!newTag || newTag.trim() === "") {
    return;
  }

  const trimmedTag = newTag.trim();

  tags = tags.map(tag => tag === oldTag ? trimmedTag : tag);

  items = items.map(item => ({
    ...item,
    tags: item.tags.map(tag => tag === oldTag ? trimmedTag : tag)
  }));

  if (activeTag === oldTag) {
    activeTag = trimmedTag;
  }

  render();
}

function deleteTag(targetTag) {
  const usedCount = items.filter(item => item.tags.includes(targetTag)).length;
  const ok = confirm(`「${targetTag}」タグを削除します。このタグは ${usedCount} 件の作品についています。`);

  if (!ok) {
    return;
  }

  tags = tags.filter(tag => tag !== targetTag);

  items = items.map(item => ({
    ...item,
    tags: item.tags.filter(tag => tag !== targetTag)
  }));

  if (activeTag === targetTag) {
    activeTag = "";
  }

  render();
}

function addTag() {
  const newTag = newTagInput.value.trim();

  if (newTag === "" || tags.includes(newTag)) {
    return;
  }

  tags.push(newTag);
  newTagInput.value = "";
  render();
}

function formatDate(dateText) {
  const [year, month, day] = dateText.split("-");
  return `${year}/${Number(month)}/${Number(day)}`;
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

titleInput.addEventListener("input", renderItems);

titleInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    openAddDialog();
  }
});

settingsButton.addEventListener("click", () => {
  mainView.classList.add("hidden");
  settingsView.classList.remove("hidden");
});

backButton.addEventListener("click", () => {
  settingsView.classList.add("hidden");
  mainView.classList.remove("hidden");
});

showDateToggle.addEventListener("change", () => {
  settings.showCreatedDate = showDateToggle.checked;
  render();
});

addTagButton.addEventListener("click", addTag);
saveItemButton.addEventListener("click", saveItem);

render();