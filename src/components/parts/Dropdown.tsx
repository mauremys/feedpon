import React, { PureComponent, cloneElement } from 'react';
import classnames from 'classnames';

import Closable from 'components/parts/Closable';
import createChainedFunction from 'utils/createChainedFunction';
import { Menu } from 'components/parts/Menu';

interface DropdownProps {
    className?: string;
    isOpened?: boolean;
    onClose?: () => void;
    onSelect?: (value?: any) => void;
    pullRight?: boolean;
    toggleButton: React.ReactElement<any>;
}

interface DropdownState {
    isOpened: boolean;
}

export default class Dropdown extends PureComponent<DropdownProps, DropdownState> {
    static defaultProps = {
        isOpened: false,
        pullRight: false
    };

    private menu: Menu;

    constructor(props: DropdownProps, context: any) {
        super(props, context);

        this.state = {
            isOpened: props.isOpened!
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
    }

    componentWillReceiveProps(nextProps: DropdownProps) {
        if (this.props.isOpened !== nextProps.isOpened) {
            this.setState({ isOpened: nextProps.isOpened! });
        }
    }

    handleClose() {
        const { onClose } = this.props;

        if (onClose) {
            onClose();
        }

        this.setState({ isOpened: false });
    }

    handleKeyDown(event: React.KeyboardEvent<any>) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.menu.focusPrevious();
                break;

            case 'ArrowDown':
                event.preventDefault();
                this.menu.focusNext();
                break;

            case 'Escape':
                this.handleClose();
                break;
        }
    }

    handleSelect(value?: any) {
        const { onClose, onSelect } = this.props;

        if (onClose) {
            onClose();
        }

        if (onSelect) {
            onSelect(value);
        }

        this.setState({ isOpened: false });
    }

    handleToggle(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { isOpened } = this.state;

        this.setState({ isOpened: !isOpened });
    }

    renderToggleButton() {
        const { toggleButton } = this.props;

        const props = {
            ...toggleButton.props,
            onClick: createChainedFunction(
                toggleButton.props.onClick,
                this.handleToggle
            ),
            onKeyDown: createChainedFunction(
                toggleButton.props.onKeyDown,
                this.handleKeyDown
            )
        };

        return cloneElement(toggleButton, props);
    }

    render() {
        const { children, className, pullRight } = this.props;
        const { isOpened } = this.state;

        return (
            <div className={classnames('dropdown', className, {
                'is-opened': isOpened!,
                'is-pull-right': pullRight!
            })}>
                {this.renderToggleButton()}
                <Closable
                    onClose={this.handleClose}
                    isDisabled={!isOpened}>
                    <Menu ref={(ref) => this.menu = ref}
                          onKeyDown={this.handleKeyDown}
                          onSelect={this.handleSelect}
                          onClose={this.handleClose}>
                        {children}
                    </Menu>
                </Closable>
            </div>
        );
    }
}
