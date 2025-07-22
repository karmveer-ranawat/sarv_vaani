document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("save");
  const projectIdInput = document.getElementById("projectId");
  const modelIdInput = document.getElementById("modelId");
  const accessTokenInput = document.getElementById("accessToken");

  // Load saved values
  chrome.storage.local.get(["projectId", "modelId", "accessToken"], (data) => {
    projectIdInput.value = data.projectId || "";
    modelIdInput.value = data.modelId || "";
    accessTokenInput.value = data.accessToken || "";
  });

  saveBtn.addEventListener("click", () => {
    chrome.storage.local.set({
      projectId: projectIdInput.value.trim(),
      modelId: modelIdInput.value.trim(),
      accessToken: accessTokenInput.value.trim(),
    }, () => {
      alert("Saved!");
    });
  });
});
