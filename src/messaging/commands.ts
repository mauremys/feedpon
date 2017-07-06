import * as CacheMap from 'utils/containers/CacheMap';
import * as streamActions from 'messaging/streams/actions';
import * as subscriptionActions from 'messaging/subscriptions/actions';
import * as uiActions from 'messaging/ui/actions';
import { AsyncThunk, Command, Entry, Stream, Thunk } from 'messaging/types';
import { smoothScrollTo, smoothScrollBy } from 'utils/dom/smoothScroll';

const SCROLL_ANIMATION_DURATION = 1000 / 60 * 10;
const SCROLL_OFFSET = 48;

export const gotoFirstLine: Command = {
    title: 'Go to first line',
    thunk({ dispatch }) {
        dispatch(scrollTo(0, 0));
    },
    skipNotification: true
};

export const gotoLastLine: Command = {
    title: 'Go to last line',
    thunk({ dispatch }) {
        dispatch(scrollTo(
            0,
            document.documentElement.scrollHeight - document.documentElement.clientHeight
        ));
    },
    skipNotification: true
};

export const fetchFullContent: Command = {
    title: 'Fetch full content',
    thunk({ dispatch }) {
        const entry = dispatch(getActiveEntry);

        if (entry && entry.url) {
            if (entry.fullContents.isLoaded) {
                const lastFullContent = entry.fullContents.items[entry.fullContents.items.length - 1];

                if (lastFullContent && lastFullContent.nextPageUrl) {
                    dispatch(streamActions.fetchFullContent(entry.entryId, lastFullContent.nextPageUrl));
                } else {
                    if (entry.fullContents.isShown) {
                        dispatch(streamActions.hideFullContents(entry.entryId));
                    } else {
                        dispatch(streamActions.showFullContents(entry.entryId));
                    }
                }
            } else {
                dispatch(streamActions.fetchFullContent(entry.entryId, entry.url));
            }
        }
    }
};

export const fetchComments: Command = {
    title: 'Fetch comments',
    thunk({ dispatch }) {
        const entry = dispatch(getActiveEntry);

        if (entry && entry.url) {
            if (!entry.comments.isLoaded) {
                dispatch(streamActions.fetchComments(entry.entryId, entry.url));
            }
        }
    }
};

export const pinOrUnpinEntry: Command = {
    title: 'Pin/Unpin entry',
    thunk({ dispatch }) {
        const entry = dispatch(getActiveEntry);

        if (entry) {
            if (entry.isPinned) {
                dispatch(streamActions.unpinEntry(entry.entryId));
            } else {
                dispatch(streamActions.pinEntry(entry.entryId));
            }
        }
    }
};

export const reloadSubscriptions: Command = {
    title: 'Reload subscriptions',
    thunk({ dispatch }) {
        dispatch(subscriptionActions.fetchSubscriptions());
    }
};

export const reloadStream: Command = {
    title: 'Reload stream',
    thunk({ getState, dispatch }) {
        const { ui, streams } = getState();

        if (ui.selectedStreamId) {
            dispatch(streamActions.fetchStream(ui.selectedStreamId, streams.defaultFetchOptions));
        }
    }
};

export const scrollUp: Command = {
    title: 'Scroll up',
    thunk({ getState, dispatch }) {
        const { keyMappings } = getState();

        dispatch(scrollBy(0, -keyMappings.scrollAmount));
    },
    skipNotification: true
};

export const scrollDown: Command = {
    title: 'Scroll down',
    thunk({ getState, dispatch }) {
        const { keyMappings } = getState();

        dispatch(scrollBy(0, keyMappings.scrollAmount));
    },
    skipNotification: true
};

export const scrollHalfPageUp: Command = {
    title: 'Scroll half page up',
    thunk({ dispatch }) {
        dispatch(scrollBy(0, -document.documentElement.clientHeight / 2));
    },
    skipNotification: true
};

export const scrollHalfPageDown: Command = {
    title: 'Scroll half page down',
    thunk({ dispatch }) {
        dispatch(scrollBy(0, document.documentElement.clientHeight / 2));
    },
    skipNotification: true
};

export const scrollPageUp: Command = {
    title: 'Scroll page up',
    thunk({ dispatch }) {
        dispatch(scrollBy(0, -document.documentElement.clientHeight));
    },
    skipNotification: true
};

export const scrollPageDown: Command = {
    title: 'Scroll page down',
    thunk({ dispatch }) {
        dispatch(scrollBy(0, document.documentElement.clientHeight));
    },
    skipNotification: true
};

export const searchSubscriptions: Command = {
    title: 'Search subscriptions',
    thunk({ dispatch, getState }) {
        const { ui } = getState();

        if (!ui.sidebarIsOpened) {
            dispatch(uiActions.openSidebar());
        }

        const searchInput = document.querySelector('.input-search-box') as HTMLElement | null;

        if (searchInput) {
            searchInput.focus();
        }
    }
};

export const selectNextEntry: Command = {
    title: 'Select next entry',
    thunk({ getState, dispatch }, { router }) {
        const { ui } = getState();

        if (ui.isScrolling || !ui.selectedStreamId) {
            return;
        }

        const elements = document.getElementsByClassName('entry');
        const scrollY = window.scrollY + SCROLL_OFFSET;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i] as HTMLElement;
            if (element.offsetTop > scrollY) {
                dispatch(scrollTo(0, element.offsetTop - SCROLL_OFFSET));
                return;
            }
        }

        const y = document.documentElement.scrollHeight - window.innerHeight;

        if (window.scrollY === y) {
            const stream = dispatch(getSelectedStream);

            if (stream && stream.continuation) {
                dispatch(streamActions.fetchMoreEntries(stream.streamId, stream.continuation, stream.fetchOptions));
            }
        } else {
            dispatch(scrollTo(0, y));
        }
    },
    skipNotification: true
};

export const selectPreviousEntry: Command = {
    title: 'Select previous entry',
    thunk({ dispatch, getState }, { router }) {
        const { ui } = getState();

        if (ui.isScrolling || !ui.selectedStreamId) {
            return;
        }

        const elements = document.getElementsByClassName('entry');
        const scrollY = window.scrollY + SCROLL_OFFSET;

        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i] as HTMLElement;
            if (element.offsetTop < scrollY) {
                dispatch(scrollTo(0, element.offsetTop - SCROLL_OFFSET));
                return;
            }
        }

        if (window.scrollY !== 0) {
            dispatch(scrollTo(0, 0));
        }
    },
    skipNotification: true
};

export const openEntry: Command = {
    title: 'Open entry',
    thunk({ getState, dispatch }) {
        const { ui } = getState();

        dispatch(uiActions.changeExpandedEntry(ui.activeEntryIndex));
    }
};

export const closeEntry: Command = {
    title: 'Close entry',
    thunk({ dispatch }) {
        dispatch(uiActions.changeExpandedEntry(-1));
    }
};

export const selectNextCategory: Command = {
    title: 'Select next category',
    thunk({ dispatch, getState }, { router, selectors }) {
        const state = getState();
        const streamId = state.ui.selectedStreamId;

        if (streamId) {
            const sortedCategories = selectors.sortedCategoriesSelector(state);
            const selectedCategoryIndex = sortedCategories
                .findIndex((category) => category.streamId === streamId);
            const nextCategory = selectedCategoryIndex > -1
                ? sortedCategories[selectedCategoryIndex + 1]
                : sortedCategories[0];

            if (nextCategory) {
                router.push(`/streams/${encodeURIComponent(nextCategory.streamId)}`);
            }
        }
    },
    skipNotification: true
};

export const selectPreviousCategory: Command = {
    title: 'Select previous category',
    thunk({ dispatch, getState }, { router, selectors }) {
        const state = getState();
        const streamId = state.ui.selectedStreamId;

        if (streamId) {
            const sortedCategories = selectors.sortedCategoriesSelector(state);
            const selectedCategoryIndex = sortedCategories
                .findIndex((category) => category.streamId === streamId);
            const previousCategory = selectedCategoryIndex > -1
                ? sortedCategories[selectedCategoryIndex - 1]
                : sortedCategories[sortedCategories.length - 1];

            if (previousCategory) {
                router.push(`/streams/${encodeURIComponent(previousCategory.streamId)}`);
            }
        }
    },
    skipNotification: true
};

export const selectNextSubscription: Command = {
    title: 'Select next subscription',
    thunk({ dispatch, getState }, { router, selectors }) {
        const state = getState();
        const streamId = state.ui.selectedStreamId;

        if (streamId) {
            const visibleSubscriptions = selectors.visibleSubscriptionsSelector(state);
            const selectedSubscriptionIndex = visibleSubscriptions
                .findIndex((subscription) => subscription.streamId === streamId);
            const nextSubscription = selectedSubscriptionIndex > -1
                ? visibleSubscriptions[selectedSubscriptionIndex + 1]
                : visibleSubscriptions[0];

            if (nextSubscription) {
                router.push(`/streams/${encodeURIComponent(nextSubscription.streamId)}`);
            }
        }
    },
    skipNotification: true
};

export const selectPreviousSubscription: Command = {
    title: 'Select previous subscription',
    thunk({ dispatch, getState }, { router, selectors }) {
        const state = getState();
        const streamId = state.ui.selectedStreamId;

        if (streamId) {
            const visibleSubscriptions = selectors.visibleSubscriptionsSelector(state);
            const selectedSubscriptionIndex = visibleSubscriptions
                .findIndex((subscription) => subscription.streamId === streamId);
            const previousSubscription = selectedSubscriptionIndex > -1
                ? visibleSubscriptions[selectedSubscriptionIndex - 1]
                : visibleSubscriptions[visibleSubscriptions.length - 1];

            if (previousSubscription) {
                router.push(`/streams/${encodeURIComponent(previousSubscription.streamId)}`);
            }
        }
    },
    skipNotification: true
};

export const showHelp: Command = {
    title: 'Show help',
    thunk({ dispatch }) {
        window.alert('help');
    }
};

export const toggleSidebar: Command = {
    title: 'Toggle sidebar',
    thunk({ getState, dispatch }) {
        const { ui } = getState();

        if (ui.sidebarIsOpened) {
            dispatch(uiActions.closeSidebar());
        } else {
            dispatch(uiActions.openSidebar());
        }
    }
};

export const toggleStreamView: Command = {
    title: 'Toggle stream view',
    thunk({ getState, dispatch }) {
        const { ui } = getState();

        if (ui.streamView === 'expanded') {
            dispatch(uiActions.changeStreamView('collapsible'));
        } else {
            dispatch(uiActions.changeStreamView('expanded'));
        }
    }
};

export const visitWebsite: Command = {
    title: 'Visit website',
    thunk({ dispatch }) {
        const entry = dispatch(getActiveEntry);

        if (entry && entry.url) {
            window.open(entry.url);
        }
    }
};

export const visitWebsiteInBackground: Command = {
    title: 'Visit website in background',
    thunk({ dispatch }) {
        const entry = dispatch(getActiveEntry);

        if (entry && entry.url) {
            openUrlInBackground(entry.url);
        }
    }
};

function scrollBy(dx: number, dy: number): AsyncThunk {
    return ({ getState, dispatch }) => {
        const { ui } = getState();

        if (!ui.isScrolling) {
            dispatch(uiActions.startScroll());
        }

        return smoothScrollBy(document.body, dx, dy, SCROLL_ANIMATION_DURATION)
            .then(() => {
                dispatch(uiActions.endScroll());
            });
    };
}

function scrollTo(x: number, y: number): AsyncThunk {
    return ({ getState, dispatch }) => {
        const { ui } = getState();

        if (!ui.isScrolling) {
            dispatch(uiActions.startScroll());
        }

        return smoothScrollTo(document.body, x, y, SCROLL_ANIMATION_DURATION)
            .then(() => {
                dispatch(uiActions.endScroll());
            });
    };
}

function openUrlInBackground(url: string): void {
    if (chrome) {
        chrome.tabs.create({ url, active: false });
    } else {
        const a = document.createElement('a');
        a.href = url;

        const event = document.createEvent('MouseEvents');
        event.initMouseEvent(
            'click', true, true, window,
            0, 0, 0, 0, 0,
            false, false, false, false,
            1, null
        );

        a.dispatchEvent(event);
    }
}

const getSelectedStream: Thunk<Stream | null> = ({ getState }) => {
    const { ui, streams } = getState();

    if (ui.selectedStreamId) {
        const stream = CacheMap.get(streams.items, ui.selectedStreamId);

        if (stream) {
            return stream;
        }
    }

    return null;
};

const getActiveEntry: Thunk<Entry | null> = ({ getState, dispatch }) => {
    const seletedStream = dispatch(getSelectedStream);

    if (seletedStream) {
        const { ui } = getState();
        const entry = seletedStream.entries[ui.activeEntryIndex];

        if (entry) {
            return entry;
        }
    }

    return null;
};
