// Domain rules shared by the future authenticated admin API.
// This module does not store data or call external services.
export const STAGES = Object.freeze([
  'idea', 'research', 'draft', 'review', 'approval', 'ready', 'published',
]);

const transitions = Object.freeze({
  idea: ['research'],
  research: ['draft'],
  draft: ['review'],
  review: ['draft', 'approval'],
  approval: ['review', 'ready'],
  ready: ['approval', 'published'],
  published: [],
});

export function transition(item, next, actor) {
  if (!item || !STAGES.includes(item.status)) throw new Error('Invalid content item');
  if (!STAGES.includes(next) || !transitions[item.status].includes(next)) {
    throw new Error(`Transition ${item.status} → ${next} is not allowed`);
  }
  if (!actor?.id || !['owner', 'editor', 'ai', 'publisher'].includes(actor.role)) {
    throw new Error('Valid actor required');
  }
  if (actor.role === 'ai' && ['approval', 'ready', 'published'].includes(next)) {
    throw new Error('AI cannot approve or publish');
  }
  if (next === 'ready' && actor.role !== 'owner') {
    throw new Error('Owner approval required');
  }
  if (next === 'ready' && (!item.versionId || !item.reviewPassed)) {
    throw new Error('Reviewed version required');
  }
  if (next === 'published' && (actor.role !== 'publisher' || !item.remoteMediaId)) {
    throw new Error('Confirmed remote publication required');
  }
  return {
    item: { ...item, status: next },
    event: {
      actorId: actor.id,
      action: 'content.transition',
      subjectId: item.id,
      before: item.status,
      after: next,
    },
  };
}
