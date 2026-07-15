
const titleInput = document.getElementById("titleInput");
const settingsButton = document.getElementById("settingsButton");
const mainView = document.getElementById("mainView");
const settingsView = document.getElementById("settingsView");

const tagArea = document.getElementById("tagArea");
const itemList = document.getElementById("itemList");

const addDialog = document.getElementById("addDialog");
const dialogTitleInput = document.getElementById("dialogTitleInput");
const openAddButton = document.getElementById("openAddButton");
const dialogTagArea = document.getElementById("dialogTagArea");
const saveItemButton = document.getElementById("saveItemButton");
const deleteItemButton = document.getElementById("deleteItemButton");

const showDateToggle = document.getElementById("showDateToggle");
const tagSettingsList = document.getElementById("tagSettingsList");
const newTagInput = document.getElementById("newTagInput");
const addTagButton = document.getElementById("addTagButton");
const newTagGroupSelect = document.getElementById("newTagGroupSelect");

let tagGroups = [
  {
    id: "group1",
    label: "1",
    colorClass: "tag-group-1",
    tags: ["漫画", "アニメ", "小説"]
  },
  {
    id: "group2",
    label: "2",
    colorClass: "tag-group-2",
    tags: ["まだ途中", "END", "進捗あり"]
  },
  {
    id: "group3",
    label: "3",
    colorClass: "tag-group-3",
    tags: ["面白い", "やめた"]
  },
  {
    id: "group4",
    label: "4",
    colorClass: "tag-group-4",
    tags: ["冒険", "感動", "ギャグ", "シュール"]
  }
];

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
let editingItemIndex = -1;
let settings = {
  showCreatedDate: true
};
let tagDeleteMode = false;
let editingTag = "";
let selectedDeleteTags = [];

const STORAGE_KEY = "furetamonoDaichoData";

function saveData() {
  const data = {
    items,
    tagGroups,
    settings
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
  const savedText = localStorage.getItem(STORAGE_KEY);

  if (!savedText) {
    return;
  }

  try {
    const savedData = JSON.parse(savedText);

    if (Array.isArray(savedData.items)) {
      items = savedData.items;
    }

    if (Array.isArray(savedData.tagGroups)) {
      tagGroups = savedData.tagGroups;
    }

    if (savedData.settings && typeof savedData.settings === "object") {
      settings = {
        ...settings,
        ...savedData.settings
      };
    }
  } catch (error) {
    console.error("保存データの読み込みに失敗しました", error);
  }
}

function render() {
  renderTags();
  renderItems();
  renderSettings();
}

function getAllTags() {
  return tagGroups.flatMap(group => group.tags);
}

function getTagGroup(targetTag) {
  return tagGroups.find(group => group.tags.includes(targetTag));
}

function getTagColorClass(targetTag) {
  const group = getTagGroup(targetTag);
  return group ? group.colorClass : "";
}

function tagExists(targetTag) {
  return getAllTags().includes(targetTag);
}

function renderTags() {
  tagArea.innerHTML = "";

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = "tag-button";
  allButton.textContent = "すべて";

  if (activeTag === "") {
    allButton.classList.add("active");
  }

  allButton.addEventListener("click", () => {
    activeTag = "";
    render();
  });

  tagArea.appendChild(allButton);

  tagGroups.forEach(group => {
    group.tags.forEach(tag => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `tag-button ${group.colorClass}`;
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
  });
}

function renderItems() {
  const keyword = titleInput.value.trim().toLowerCase();

  const filteredItems = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      const matchesKeyword = item.title.toLowerCase().includes(keyword);
      const matchesTag = activeTag === "" || item.tags.includes(activeTag);
      return matchesKeyword && matchesTag;
    });

  itemList.innerHTML = "";

  filteredItems.forEach(({ item, index }) => {
    const row = document.createElement("article");
    row.className = "item-row";
    row.addEventListener("click", () => openEditDialog(index));

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

    visibleTags.forEach(tag => {
      const tagSpan = document.createElement("span");
      tagSpan.className = `item-tag-pill ${getTagColorClass(tag)}`;
      tagSpan.textContent = tag;
      tagLine.appendChild(tagSpan);
    });

    row.appendChild(titleLine);
    row.appendChild(tagLine);
    itemList.appendChild(row);
  });
}

function renderSettings() {
  showDateToggle.checked = settings.showCreatedDate;
  tagSettingsList.innerHTML = "";

  tagGroups.forEach(group => {
    const groupRow = document.createElement("div");
    groupRow.className = "tag-group-setting-row";

    const label = document.createElement("span");
    label.className = `tag-group-label ${group.colorClass}`;
    label.textContent = group.label;
    groupRow.appendChild(label);

    group.tags.forEach(tag => {
      const row = document.createElement("div");
      row.className = "tag-setting-row";

      if (editingTag === tag) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = tag;
        input.className = "tag-edit-input";

        input.addEventListener("keydown", event => {
          if (event.key === "Enter") {
            event.preventDefault();
            saveRenamedTag(tag, input.value);
          }
        });

        input.addEventListener("blur", () => {
          saveRenamedTag(tag, input.value);
        });

        row.appendChild(input);
        setTimeout(() => input.focus(), 0);
      } else {
        const tagButton = document.createElement("button");
        tagButton.type = "button";
        tagButton.className = `tag-edit-button ${group.colorClass}`;

        if (tagDeleteMode) {
          const isSelected = selectedDeleteTags.includes(tag);
          tagButton.textContent = `${isSelected ? "☑" : "□"} ${tag}`;
          tagButton.addEventListener("click", () => toggleDeleteTag(tag));
        } else {
          tagButton.textContent = tag;
          tagButton.addEventListener("click", () => {
            editingTag = tag;
            render();
          });
        }

        row.appendChild(tagButton);
      }

      groupRow.appendChild(row);
    });

    tagSettingsList.appendChild(groupRow);
  });

  const actionRow = document.createElement("div");
  actionRow.className = "tag-setting-actions";

  const deleteModeButton = document.createElement("button");
  deleteModeButton.type = "button";
  deleteModeButton.className = "danger-button";

  if (tagDeleteMode) {
    deleteModeButton.textContent = "選択したタグを削除";
    deleteModeButton.addEventListener("click", deleteSelectedTags);

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "cancel-button";
    cancelButton.textContent = "キャンセル";
    cancelButton.addEventListener("click", () => {
      tagDeleteMode = false;
      selectedDeleteTags = [];
      render();
    });

    actionRow.appendChild(deleteModeButton);
    actionRow.appendChild(cancelButton);
  } else {
    deleteModeButton.textContent = "削除";
    deleteModeButton.addEventListener("click", () => {
      tagDeleteMode = true;
      selectedDeleteTags = [];
      editingTag = "";
      render();
    });

    actionRow.appendChild(deleteModeButton);
  }

  tagSettingsList.appendChild(actionRow);
}

function toggleDeleteTag(targetTag) {
  if (selectedDeleteTags.includes(targetTag)) {
    selectedDeleteTags = selectedDeleteTags.filter(tag => tag !== targetTag);
  } else {
    selectedDeleteTags.push(targetTag);
  }

  render();
}

function deleteSelectedTags() {
  if (selectedDeleteTags.length === 0) {
    return;
  }

  const tagLines = selectedDeleteTags.map(tag => {
    const usedCount = items.filter(item => item.tags.includes(tag)).length;
    return `「${tag}」は ${usedCount} 件の作品についています`;
  });

  const ok = confirm(`タグを削除しますか？\n${tagLines.join("\n")}`);

  if (!ok) {
    return;
  }

  tagGroups = tagGroups.map(group => ({
    ...group,
    tags: group.tags.filter(tag => !selectedDeleteTags.includes(tag))
  }));

  items = items.map(item => ({
    ...item,
    tags: item.tags.filter(tag => !selectedDeleteTags.includes(tag))
  }));

  if (selectedDeleteTags.includes(activeTag)) {
    activeTag = "";
  }

  tagDeleteMode = false;
  selectedDeleteTags = [];
  saveData();
  render();
}

function openAddDialog() {
  const title = titleInput.value.trim();

  if (title === "") {
    return;
  }

  editingItemIndex = -1;
  dialogTitleInput.value = title;
  selectedDialogTags = [];
  saveItemButton.textContent = "投稿";
  deleteItemButton.classList.add("hidden");
  renderDialogTags();
  addDialog.showModal();
}

function openEditDialog(itemIndex) {
  const item = items[itemIndex];

  if (!item) {
    return;
  }

  editingItemIndex = itemIndex;
  dialogTitleInput.value = item.title;
  selectedDialogTags = [...item.tags];
  saveItemButton.textContent = "保存";
  deleteItemButton.classList.remove("hidden");
  renderDialogTags();
  addDialog.showModal();
}

function renderDialogTags() {
  dialogTagArea.innerHTML = "";

  tagGroups.forEach(group => {
    group.tags.forEach(tag => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `tag-button ${group.colorClass}`;
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
  });
}

function saveItem() {
  const title = dialogTitleInput.value.trim();

  if (title === "") {
    return;
  }

  if (editingItemIndex === -1) {
    items.unshift({
      title,
      createdAt: getTodayString(),
      tags: [...selectedDialogTags]
    });
  } else {
    items[editingItemIndex] = {
      ...items[editingItemIndex],
      title,
      tags: [...selectedDialogTags]
    };
  }

  editingItemIndex = -1;
  titleInput.value = "";
  addDialog.close();
  saveData();
  render();
}

function deleteItem() {
  if (editingItemIndex === -1) {
    return;
  }

  const item = items[editingItemIndex];
  const ok = confirm(`「${item.title}」を削除しますか？`);

  if (!ok) {
    return;
  }

  items.splice(editingItemIndex, 1);

  editingItemIndex = -1;
  addDialog.close();
  saveData();
  render();
}

function saveRenamedTag(oldTag, newTagText) {
  const newTag = newTagText.trim();

  if (newTag === "" || newTag === oldTag) {
    editingTag = "";
    render();
    return;
  }

  if (tagExists(newTag)) {
    editingTag = "";
    render();
    return;
  }

  tagGroups = tagGroups.map(group => ({
    ...group,
    tags: group.tags.map(tag => tag === oldTag ? newTag : tag)
  }));

  items = items.map(item => ({
    ...item,
    tags: item.tags.map(tag => tag === oldTag ? newTag : tag)
  }));

  if (activeTag === oldTag) {
    activeTag = newTag;
  }

  editingTag = "";
  saveData();
  render();
}

function addTag() {
  const newTag = newTagInput.value.trim();
  const targetGroupId = newTagGroupSelect.value;

  if (newTag === "" || tagExists(newTag)) {
    return;
  }

  tagGroups = tagGroups.map(group => {
    if (group.id !== targetGroupId) {
      return group;
    }

    return {
      ...group,
      tags: [...group.tags, newTag]
    };
  });

  newTagInput.value = "";
  saveData();
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
  if (event.key !== "Enter") {
    return;
  }

  if (event.isComposing) {
    return;
  }

  event.preventDefault();
  openAddDialog();
});

openAddButton.addEventListener("click", openAddDialog);

settingsButton.addEventListener("click", () => {
  const settingsIsOpen = !settingsView.classList.contains("hidden");

  if (settingsIsOpen) {
    settingsView.classList.add("hidden");
    mainView.classList.remove("hidden");
    settingsButton.textContent = "設定";
  } else {
    mainView.classList.add("hidden");
    settingsView.classList.remove("hidden");
    settingsButton.textContent = "戻る";
  }
});

showDateToggle.addEventListener("change", () => {
  settings.showCreatedDate = showDateToggle.checked;
  saveData();
  render();
});

addTagButton.addEventListener("click", addTag);
saveItemButton.addEventListener("click", saveItem);
deleteItemButton.addEventListener("click", deleteItem);

loadData();
render();
