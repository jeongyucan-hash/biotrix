// REST Responses payloads do not necessarily contain the SDK's output_text helper.
export function responseText(response) {
  return response.output_text || (response.output || [])
    .filter(item => item.type === 'message')
    .flatMap(item => item.content || [])
    .filter(item => item.type === 'output_text')
    .map(item => item.text).join('\n');
}

export function safeUrl(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

export function responseSources(response) {
  const sources = new Map();
  for (const item of response.output || []) {
    const entries = item.type === 'web_search_call' ? item.action?.sources || [] :
      (item.content || []).flatMap(part => part.annotations || []);
    for (const entry of entries) {
      const url = safeUrl(entry.url);
      if (url) sources.set(url, {url, title: String(entry.title || url)});
    }
  }
  return [...sources.values()];
}
