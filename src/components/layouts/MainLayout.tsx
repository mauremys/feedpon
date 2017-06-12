import React, { PureComponent } from 'react';

interface MainLayoutProps {
    footer?: React.ReactNode;
    header?: React.ReactNode;
}

export default class MainLayout extends PureComponent<MainLayoutProps, {}> {
    static defaultProps = {
        footer: (
            <div>
                <div className="u-text-center">
                    <small>Copyright &copy; 2017 Shota Nozaki</small>
                </div>
                <div className="u-text-center">
                    <ul className="list-inline list-inline-slashed">
                        <li className="list-inline-item"><a href="https://github.com/emonkak/feedpon" target="_blank">Source code</a></li>
                        <li className="list-inline-item"><a href="https://github.com/emonkak/feedpon/issues" target="_blank">Issues</a></li>
                    </ul>
                </div>
            </div>
        )
    };

    render() {
        const { children, footer, header } = this.props;

        return (
            <div className="l-main">
                {header ? <div className="l-main-header">{header}</div> : null}
                <div className="l-main-content">
                    {children}
                </div>
                {footer ? <div className="l-main-footer">{footer}</div> : null}
            </div>
        );
    }
}
