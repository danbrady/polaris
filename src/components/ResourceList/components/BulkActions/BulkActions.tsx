import * as React from 'react';
import {CSSTransition, Transition} from 'react-transition-group';
import {autobind, debounce} from '@shopify/javascript-utilities/decorators';
import {classNames} from '@shopify/react-utilities/styles';
import {DisableableAction, Action} from '../../../../types';
import {Duration} from '../../../shared';
import {ActionList, Popover, Button, EventListener} from '../../../';
import {withProvider, WithProviderProps} from '../../../Provider';
import {ActionListSection} from '../../../ActionList/Section';
import CheckableButton from '../CheckableButton';
import BulkActionButton from './BulkActionButton';
import * as styles from './BulkActions.scss';

export type BulkAction = DisableableAction;
export type BulkActionListSection = ActionListSection;

export type TransitionStatus = 'entering' | 'entered' | 'exiting' | 'exited';

const MAX_PROMOTED_ACTIONS = 2;

export interface Props {
  accessibilityLabel?: string;
  label?: string;
  selected?: boolean | 'indeterminate';
  selectMode?: boolean;
  promotedActions?: BulkAction[];
  actions?: (BulkAction | BulkActionListSection)[];
  paginatedSelectAllText?: string;
  paginatedSelectAllAction?: Action;
  onToggleAll?(): void;
  onSelectModeToggle?(selectMode: boolean): void;
}

export interface State {
  smallScreenPopoverVisible: boolean;
  largeScreenPopoverVisible: boolean;
  containerWidth: number;
  measuring: boolean;
}

const slideClasses = {
  appear: classNames(styles.Slide, styles['Slide-appear']),
  appearActive: classNames(styles.Slide, styles['Slide-appearing']),
  enter: classNames(styles.Slide, styles['Slide-enter']),
  enterActive: classNames(styles.Slide, styles['Slide-entering']),
  exit: classNames(styles.Slide, styles['Slide-exit']),
};

export type CombinedProps = Props & WithProviderProps;

class BulkActions extends React.PureComponent<CombinedProps, State> {
  state = {
    smallScreenPopoverVisible: false,
    largeScreenPopoverVisible: false,
    containerWidth: 0,
    measuring: true,
  };

  private containerNode: HTMLElement | null;
  private largeScreenButtonsNode: HTMLElement | null;
  private moreActionsNode: HTMLElement | null;
  private promotedActionsWidths: number[] = [];
  private bulkActionsWidth = 0;
  private addedMoreActionsWidthForMeasuring = 0;

  private get numberOfPromotedActionsToRender(): number {
    const {promotedActions} = this.props;
    const {containerWidth, measuring} = this.state;

    if (!promotedActions) {
      return 0;
    }

    if (containerWidth >= this.bulkActionsWidth || measuring) {
      return promotedActions.length;
    }

    let sufficientSpace = false;
    let counter = promotedActions.length - 1;
    let totalWidth = 0;

    while (!sufficientSpace && counter >= 0) {
      totalWidth += this.promotedActionsWidths[counter];
      const widthWithRemovedAction =
        this.bulkActionsWidth -
        totalWidth +
        this.addedMoreActionsWidthForMeasuring;
      if (containerWidth >= widthWithRemovedAction) {
        sufficientSpace = true;
      } else {
        counter--;
      }
    }

    return counter;
  }

  private get hasActions() {
    const {promotedActions, actions} = this.props;
    return Boolean(
      (promotedActions && promotedActions.length > 0) ||
        (actions && actions.length > 0),
    );
  }

  private get actionSections(): BulkActionListSection[] | undefined {
    const {actions} = this.props;

    if (!actions || actions.length === 0) {
      return;
    }

    if (instanceOfBulkActionListSectionArray(actions)) {
      return actions;
    }

    if (instanceOfBulkActionArray(actions)) {
      return [
        {
          items: actions,
        },
      ];
    }
  }

  componentDidMount() {
    const {actions, promotedActions} = this.props;

    if (promotedActions && !actions && this.moreActionsNode) {
      this.addedMoreActionsWidthForMeasuring = this.moreActionsNode.getBoundingClientRect().width;
    }

    this.bulkActionsWidth = this.largeScreenButtonsNode
      ? this.largeScreenButtonsNode.getBoundingClientRect().width -
        this.addedMoreActionsWidthForMeasuring
      : 0;

    if (this.containerNode) {
      // eslint-disable-next-line react/no-did-mount-set-state
      this.setState({
        containerWidth: this.containerNode.getBoundingClientRect().width,
        measuring: false,
      });
    }
  }

  render() {
    const {
      selectMode,
      accessibilityLabel,
      label = '',
      onToggleAll,
      selected,
      promotedActions,
      paginatedSelectAllText = null,
      paginatedSelectAllAction,
      polaris: {intl},
    } = this.props;

    if (promotedActions && promotedActions.length > MAX_PROMOTED_ACTIONS) {
      // eslint-disable-next-line no-console
      console.warn(
        `To provide a better user experience. There should only be a maximum of ${MAX_PROMOTED_ACTIONS} promoted actions.`,
      );
    }

    const {
      smallScreenPopoverVisible,
      largeScreenPopoverVisible,
      measuring,
    } = this.state;

    const paginatedSelectAllActionMarkup = paginatedSelectAllAction ? (
      <Button
        onClick={paginatedSelectAllAction.onAction}
        plain
        testID="paginated-action"
      >
        {paginatedSelectAllAction.content}
      </Button>
    ) : null;

    const paginatedSelectAllTextMarkup =
      paginatedSelectAllText && paginatedSelectAllAction ? (
        <span>{paginatedSelectAllText}</span>
      ) : (
        paginatedSelectAllText
      );

    const paginatedSelectAllMarkup =
      paginatedSelectAllActionMarkup || paginatedSelectAllTextMarkup ? (
        <div
          className={styles.PaginatedSelectAll}
          testID="paginated-select-all"
        >
          {paginatedSelectAllTextMarkup} {paginatedSelectAllActionMarkup}
        </div>
      ) : null;

    const cancelButtonClassName = classNames(
      styles.Button,
      styles['Button-cancel'],
    );
    const cancelButton = (
      <button
        className={cancelButtonClassName}
        // eslint-disable-next-line react/jsx-no-bind
        onClick={this.setSelectMode.bind(this, false)}
        testID="btn-cancel"
      >
        Cancel
      </button>
    );

    const numberOfPromotedActionsToRender = this
      .numberOfPromotedActionsToRender;

    const allActionsPopover = this.hasActions ? (
      <div className={styles.Popover} ref={this.setMoreActionsNode}>
        <Popover
          active={smallScreenPopoverVisible}
          activator={
            <BulkActionButton
              disclosure
              onAction={this.toggleSmallScreenPopover}
              content={intl.translate(
                'Polaris.ResourceList.BulkActions.actionsActivatorLabel',
              )}
            />
          }
          onClose={this.toggleSmallScreenPopover}
        >
          <ActionList
            items={promotedActions}
            sections={this.actionSections}
            onActionAnyItem={this.toggleSmallScreenPopover}
          />
        </Popover>
      </div>
    ) : null;

    const promotedActionsMarkup =
      promotedActions && numberOfPromotedActionsToRender > 0
        ? [...promotedActions]
            .slice(0, numberOfPromotedActionsToRender)
            .map((action, index) => (
              <BulkActionButton
                {...action}
                key={index}
                handleMeasurement={this.handleMeasurement}
              />
            ))
        : null;

    const rolledInPromotedActions =
      promotedActions &&
      numberOfPromotedActionsToRender < promotedActions.length
        ? [...promotedActions].slice(numberOfPromotedActionsToRender)
        : [];

    const activatorLabel =
      !promotedActions ||
      (promotedActions && numberOfPromotedActionsToRender === 0 && !measuring)
        ? intl.translate(
            'Polaris.ResourceList.BulkActions.actionsActivatorLabel',
          )
        : intl.translate(
            'Polaris.ResourceList.BulkActions.moreActionsActivatorLabel',
          );

    let combinedActions: ActionListSection[] = [];

    if (this.actionSections && rolledInPromotedActions.length > 0) {
      combinedActions = [
        {items: rolledInPromotedActions},
        ...this.actionSections,
      ];
    } else if (this.actionSections) {
      combinedActions = this.actionSections;
    } else if (rolledInPromotedActions.length > 0) {
      combinedActions = [{items: rolledInPromotedActions}];
    }

    const actionsPopover =
      this.actionSections || rolledInPromotedActions.length > 0 || measuring ? (
        <div className={styles.Popover} ref={this.setMoreActionsNode}>
          <Popover
            active={largeScreenPopoverVisible}
            activator={
              <BulkActionButton
                disclosure
                onAction={this.toggleLargeScreenPopover}
                content={activatorLabel}
              />
            }
            onClose={this.toggleLargeScreenPopover}
          >
            <ActionList
              sections={combinedActions}
              onActionAnyItem={this.toggleLargeScreenPopover}
            />
          </Popover>
        </div>
      ) : null;

    const checkableButtonProps = {
      accessibilityLabel,
      label,
      selected,
      selectMode,
      onToggleAll,
      measuring,
    };

    const smallScreenGroup = (
      <Transition timeout={0} in={selectMode} key="smallGroup">
        {(status: TransitionStatus) => {
          const smallScreenGroupClassName = classNames(
            styles.Group,
            styles['Group-smallScreen'],
            styles[`Group-${status}`],
          );
          return (
            <div className={smallScreenGroupClassName}>
              <div className={styles.ButtonGroup}>
                <CSSTransition
                  in={selectMode}
                  timeout={Duration.Base}
                  classNames={slideClasses}
                  appear
                >
                  <CheckableButton {...checkableButtonProps} />
                </CSSTransition>
                {allActionsPopover}
                {cancelButton}
              </div>
              {paginatedSelectAllMarkup}
            </div>
          );
        }}
      </Transition>
    );

    const largeScreenGroup = (
      <Transition timeout={0} in={selectMode} key="largeGroup">
        {(status: TransitionStatus) => {
          const largeScreenGroupClassName = classNames(
            styles.Group,
            styles['Group-largeScreen'],
            !measuring && styles[`Group-${status}`],
            measuring && styles['Group-measuring'],
          );
          return (
            <div className={largeScreenGroupClassName}>
              <EventListener event="resize" handler={this.handleResize} />
              <div
                className={styles.ButtonGroup}
                ref={this.setLargeScreenButtonsNode}
              >
                <CheckableButton {...checkableButtonProps} />
                {promotedActionsMarkup}
                {actionsPopover}
              </div>
              {paginatedSelectAllMarkup}
            </div>
          );
        }}
      </Transition>
    );

    return (
      <div ref={this.setContainerNode}>
        {smallScreenGroup}
        {largeScreenGroup}
      </div>
    );
  }

  @autobind
  private setLargeScreenButtonsNode(node: HTMLElement | null) {
    this.largeScreenButtonsNode = node;
  }

  @autobind
  private setContainerNode(node: HTMLElement | null) {
    this.containerNode = node;
  }

  @autobind
  private setMoreActionsNode(node: HTMLElement | null) {
    this.moreActionsNode = node;
  }

  @autobind
  private setSelectMode(val: boolean) {
    const {onSelectModeToggle} = this.props;
    if (onSelectModeToggle) {
      onSelectModeToggle(val);
    }
  }

  @autobind
  private toggleSmallScreenPopover() {
    this.setState(({smallScreenPopoverVisible}) => ({
      smallScreenPopoverVisible: !smallScreenPopoverVisible,
    }));
  }

  @autobind
  private toggleLargeScreenPopover() {
    this.setState(({largeScreenPopoverVisible}) => ({
      largeScreenPopoverVisible: !largeScreenPopoverVisible,
    }));
  }

  @autobind
  @debounce(50, {trailing: true})
  private handleResize() {
    const {smallScreenPopoverVisible, largeScreenPopoverVisible} = this.state;

    if (this.containerNode) {
      const containerWidth = this.containerNode.getBoundingClientRect().width;
      if (containerWidth > 0) {
        this.setState({containerWidth});
      }
    }

    if (smallScreenPopoverVisible || largeScreenPopoverVisible) {
      this.setState({
        smallScreenPopoverVisible: false,
        largeScreenPopoverVisible: false,
      });
    }
  }

  @autobind
  private handleMeasurement(width: number) {
    const {measuring} = this.state;
    if (measuring) {
      this.promotedActionsWidths.push(width);
    }
  }
}

function instanceOfBulkActionListSectionArray(
  actions: (BulkAction | BulkActionListSection)[],
): actions is BulkActionListSection[] {
  const validList = actions.filter((action: any) => {
    return action.items;
  });

  return actions.length === validList.length;
}

function instanceOfBulkActionArray(
  actions: (BulkAction | BulkActionListSection)[],
): actions is BulkAction[] {
  const validList = actions.filter((action: any) => {
    return !action.items;
  });

  return actions.length === validList.length;
}

export default withProvider()(BulkActions);
