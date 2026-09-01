// MV3 background service worker. No default_popup in manifest.json --
// clicking the toolbar icon fires this instead, opening the app as a
// full tab/page rather than a small popup. Focuses the existing tab
// instead of piling up duplicates if one's already open.
const INDEX_URL = chrome.runtime.getURL("index.html");

chrome.action.onClicked.addListener(async () => {
  const [existing] = await chrome.tabs.query({ url: INDEX_URL });
  if (existing) {
    await chrome.tabs.update(existing.id, { active: true });
    if (existing.windowId !== undefined) {
      await chrome.windows.update(existing.windowId, { focused: true });
    }
  } else {
    await chrome.tabs.create({ url: INDEX_URL });
  }
});
