const STORAGE_KEY = 'ag_tool_clicks';

export function trackToolClick(toolId: string): void {
  try {
    const clicks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    clicks[toolId] = (clicks[toolId] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clicks));
  } catch (e) {
    console.error('Error tracking tool click:', e);
  }
}

export function getPopularTools<T extends { id: string }>(toolsList: T[], limit = 3): T[] {
  try {
    const clicks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return [...toolsList]
      .sort((a, b) => {
        const clicksA = clicks[a.id] || 0;
        const clicksB = clicks[b.id] || 0;
        if (clicksB !== clicksA) {
          return clicksB - clicksA;
        }
        return 0; // Maintain original custom/popularity order if click counts are equal
      })
      .slice(0, limit);
  } catch (e) {
    console.error('Error getting popular tools:', e);
    return toolsList.slice(0, limit);
  }
}
