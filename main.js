
const titleInput = document.getElementById("titleInput");
const settingsButton = document.getElementById("settingsButton");
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
let settings = {
  showCreatedDate: true
};
let tagDeleteMode = false;
let editingTag = "";
let selectedDeleteTags = [];

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
  render();
}

function openAddDialog() {
  const title = titleInput.value.trim();

  if (title === "") {
    return;
  }

  dialogTitleInput.value = title;
  selectedDialogTags = [];
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

  items.unshift({
    title,
    createdAt: getTodayString(),
    tags: [...selectedDialogTags]
  });

  titleInput.value = "";
  addDialog.close();
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
  render();
});

addTagButton.addEventListener("click", addTag);
saveItemButton.addEventListener("click", saveItem);

render();
