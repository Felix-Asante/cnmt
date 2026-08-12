type cacheTags = "transfers";

export function getGlobalTag(tag: cacheTags) {
  return `global:${tag}`;
}

export function getTransferOptionsTag() {
  return `transfers`;
}
