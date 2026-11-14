'use strict';

// A response can reach the client before the underlying file handle closes.
// Drain reads before mutating that exercise, including on Windows where unlink
// may otherwise leave a delete-pending entry visible to directory metadata reads.
function createDownloadTracker() {
  const exercises = new Map();
  function stateFor(key) {
    if (!exercises.has(key)) exercises.set(key, { key, readers: new Set(), tail: Promise.resolve(), tailDone: true });
    return exercises.get(key);
  }
  function clean(state) {
    if (!state.readers.size && state.tailDone && exercises.get(state.key) === state) exercises.delete(state.key);
  }
  function track(id, operation) {
    const state = stateFor(id);
    const pending = state.tail.catch(() => {}).then(operation).finally(() => {
      state.readers.delete(pending);
      clean(state);
    });
    state.readers.add(pending);
    return pending;
  }
  function mutate(id, operation) {
    const state = stateFor(id);
    const pending = Promise.allSettled([state.tail, ...state.readers]).then(operation).finally(() => {
      if (state.tail === pending) state.tailDone = true;
      clean(state);
    });
    state.tail = pending;
    state.tailDone = false;
    return pending;
  }
  return { track, mutate };
}

module.exports = { createDownloadTracker };
