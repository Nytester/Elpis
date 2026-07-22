export const STATUS_LABELS = { submitted: 'Submitted', under_review: 'Under Review', approved: 'Approved', denied: 'Denied' };

export function getSteps(status) {
  const order = ['submitted', 'under_review', status === 'denied' ? 'denied' : 'approved'];
  const idx = order.indexOf(status);
  return order.map((s, i) => ({
    label: STATUS_LABELS[s],
    state: i < idx ? 'past' : i === idx ? 'current' : '',
  }));
}
