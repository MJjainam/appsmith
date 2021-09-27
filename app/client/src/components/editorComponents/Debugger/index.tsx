import { Classes } from "components/ads/common";
import Icon, { IconSize } from "components/ads/Icon";
import React from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "store";
import styled from "styled-components";
import DebuggerTabs from "./DebuggerTabs";
import { AppState } from "reducers";
import { showDebugger as showDebuggerAction } from "actions/debuggerActions";
import AnalyticsUtil from "utils/AnalyticsUtil";
import { Colors } from "constants/Colors";
import { getTypographyByKey } from "constants/DefaultTheme";
import { Layers } from "constants/Layers";
import { stopEventPropagation } from "utils/AppsmithUtils";
import { getMessageCount } from "selectors/debuggerSelectors";
import getFeatureFlags from "utils/featureFlags";
import TooltipComponent from "components/ads/Tooltip";
import { Position } from "@blueprintjs/core";
import { createMessage, DEBUGGER_TOOLTIP } from "constants/messages";
import { TOOLTIP_HOVER_ON_DELAY } from "constants/AppConstants";
import { Classes as BpClasses } from "@blueprintjs/core";

const ICON_POSITION_RIGHT = 20;
const ICON_POSITION_BOTTOM = 20;

const Container = styled.div<{ errorCount: number; warningCount: number }>`
  z-index: ${Layers.debugger};
  background-color: ${(props) =>
    props.theme.colors.debugger.floatingButton.background};
  position: absolute;
  right: ${ICON_POSITION_RIGHT}px;
  bottom: ${ICON_POSITION_BOTTOM}px;
  cursor: pointer;
  padding: ${(props) => props.theme.spaces[6]}px;
  color: ${(props) => props.theme.colors.debugger.floatingButton.color};
  border-radius: 50px;
  box-shadow: ${(props) => props.theme.colors.debugger.floatingButton.shadow};

  .${Classes.ICON} {
    &:hover {
      path {
        fill: ${(props) => props.theme.colors.icon.normal};
      }
    }
  }

  .debugger-count {
    color: ${Colors.WHITE};
    ${(props) => getTypographyByKey(props, "h6")}
    height: 16px;
    padding: ${(props) => props.theme.spaces[1]}px;
    background-color: ${(props) =>
      props.errorCount + props.warningCount > 0
        ? props.errorCount === 0
          ? props.theme.colors.debugger.floatingButton.warningCount
          : props.theme.colors.debugger.floatingButton.errorCount
        : props.theme.colors.debugger.floatingButton.noErrorCount};
    border-radius: 10px;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    right: 0;
  }
`;

const StyledTooltipComponent = styled(TooltipComponent)`
  .${BpClasses.POPOVER_TARGET} {
    position: absolute;
    right: ${ICON_POSITION_RIGHT}px;
    bottom: ${ICON_POSITION_BOTTOM}px;
  }
`;

function Debugger() {
  const dispatch = useDispatch();
  const messageCounters = useSelector(getMessageCount);

  const totalMessageCount = messageCounters.errors + messageCounters.warnings;
  const showDebugger = useSelector(
    (state: AppState) => state.ui.debugger.isOpen,
  );

  const onClick = (e: any) => {
    AnalyticsUtil.logEvent("OPEN_DEBUGGER", {
      source: "CANVAS",
    });
    dispatch(showDebuggerAction(true));
    stopEventPropagation(e);
  };

  if (!showDebugger && !getFeatureFlags().GIT)
    return (
      <StyledTooltipComponent
        boundary="viewport"
        content={createMessage(DEBUGGER_TOOLTIP)}
        hoverOpenDelay={TOOLTIP_HOVER_ON_DELAY}
        position={Position.TOP_RIGHT}
      >
        <Container
          className="t--debugger"
          errorCount={messageCounters.errors}
          onClick={onClick}
          warningCount={messageCounters.warnings}
        >
          <Icon name="bug" size={IconSize.XL} />
          {!!messageCounters.errors && (
            <div className="debugger-count t--debugger-count">
              {totalMessageCount}
            </div>
          )}
        </Container>
      </StyledTooltipComponent>
    );
  return showDebugger ? (
    <DebuggerTabs defaultIndex={totalMessageCount ? 0 : 1} />
  ) : null;
}

const TriggerContainer = styled.div<{
  errorCount: number;
  warningCount: number;
}>`
  position: relative;
  overflow: visible;
  display: flex;
  align-items: center;
  margin-right: ${(props) => props.theme.spaces[9]}px;

  .debugger-count {
    color: ${Colors.WHITE};
    ${(props) => getTypographyByKey(props, "p3")}
    height: 16px;
    width: 16px;
    background-color: ${(props) =>
      props.errorCount + props.warningCount > 0
        ? props.errorCount === 0
          ? props.theme.colors.debugger.floatingButton.warningCount
          : props.theme.colors.debugger.floatingButton.errorCount
        : props.theme.colors.debugger.floatingButton.noErrorCount};
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 100%;
  }
`;

export function DebuggerTrigger() {
  const dispatch = useDispatch();
  const showDebugger = useSelector(
    (state: AppState) => state.ui.debugger.isOpen,
  );

  const messageCounters = useSelector(getMessageCount);

  const totalMessageCount = messageCounters.errors + messageCounters.warnings;

  const onClick = (e: any) => {
    if (!showDebugger)
      AnalyticsUtil.logEvent("OPEN_DEBUGGER", {
        source: "CANVAS",
      });
    dispatch(showDebuggerAction(!showDebugger));
    stopEventPropagation(e);
  };

  return (
    <TriggerContainer
      errorCount={messageCounters.errors}
      warningCount={messageCounters.warnings}
    >
      <TooltipComponent
        boundary="viewport"
        content={createMessage(DEBUGGER_TOOLTIP)}
        hoverOpenDelay={TOOLTIP_HOVER_ON_DELAY}
        position={Position.TOP_RIGHT}
      >
        <Icon name="bug" onClick={onClick} size={IconSize.XL} />
      </TooltipComponent>
      {!!messageCounters.errors && (
        <div className="debugger-count t--debugger-count">
          {totalMessageCount > 9 ? "9+" : totalMessageCount}
        </div>
      )}
    </TriggerContainer>
  );
}

export default Debugger;
