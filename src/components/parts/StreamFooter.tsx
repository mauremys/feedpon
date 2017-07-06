import React, { PureComponent } from 'react';

interface StreamFooterProps {
    canMarkAsRead: boolean;
    hasMoreEntries: boolean;
    isLoading: boolean;
    onLoadMoreEntries: () => void;
    onMarkAllAsRead: () => void;
}

export default class StreamFooter extends PureComponent<StreamFooterProps, {}> {
    constructor(props: StreamFooterProps, context: any) {
        super(props, context);

        this.handleLoadMoreEntries = this.handleLoadMoreEntries.bind(this);
    }

    handleLoadMoreEntries(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { onLoadMoreEntries } = this.props;

        onLoadMoreEntries();
    }

    render() {
        const {
            canMarkAsRead,
            hasMoreEntries,
            isLoading,
            onMarkAllAsRead
        } = this.props;

        if (hasMoreEntries) {
            if (isLoading) {
                return (
                    <footer className="stream-footer">
                        <i className="icon icon-32 icon-spinner icon-rotating" />
                    </footer>
                );
            } else {
                return (
                    <footer className="stream-footer">
                        <a
                            className="link-strong"
                            href="#"
                            onClick={this.handleLoadMoreEntries}>
                            Load more entries...
                        </a>
                    </footer>
                );
            }
        } else {
            return (
                <footer className="stream-footer">
                    <p>No more entries here.</p>
                    <p>
                        <button
                            className="button button-positive"
                            onClick={onMarkAllAsRead}
                            disabled={!canMarkAsRead}>
                            Mark all as read
                        </button>
                    </p>
                </footer>
            );
        }
    }
}
