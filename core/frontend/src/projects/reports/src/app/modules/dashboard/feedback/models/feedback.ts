export const interactiveFeedbackCategoryList = [
    "Feedback Hub",
    "Interactive Feedback",
    "Open Exchange",
    "Dialogue Hub",
    "Feedback Forum",
    "Conversation Corner",
    "Engagement Center",
    "Question & Response Hub",
    "Clarification Corner",
    "Discussion Zone",
];

export const feedbackTypesList = {
    appreciation: { index: 100, label: 'Appreciation', material_icon: 'social_leaderboard', feedbackPlaceholder: 'and your appreciation here...' },
    improvement: { index: 200, label: 'Improvements', material_icon: 'thumb_up', feedbackPlaceholder: 'and your notes here...' },
    conversation: { index: 300, label: 'Interactive', material_icon: 'forum', feedbackPlaceholder: '' }
};

export const filterFeedbackTypesList = {
    all: { index: 1, label: 'All' },
    appreciation: { index: 100, label: 'Appreciation' },
    improvement: { index: 200, label: 'Improvements'  },
    conversation: { index: 300, label: 'Interactive' }
};

export const processAreasList = {
    query: { index: 0, label: 'Query' },
    accounting: { index: 1, label: 'Accounting' },
    workpaper: { index: 2, label: 'Workpaper' },
};