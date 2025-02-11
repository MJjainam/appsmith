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
import { stopEventPropagation } from "utils/AppsmithUtils";
import { getMessageCount } from "selectors/debuggerSelectors";
import { setActionTabsInitialIndex } from "actions/pluginActionActions";
import {
  matchApiPath,
  matchBuilderPath,
  matchQueryPath,
} from "constants/routes";
import TooltipComponent from "components/ads/Tooltip";

function Debugger() {
  const messageCounters = useSelector(getMessageCount);

  const totalMessageCount = messageCounters.errors + messageCounters.warnings;
  const showDebugger = useSelector(
    (state: AppState) => state.ui.debugger.isOpen,
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
  margin-right: ${(props) => props.theme.spaces[10]}px;

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
    border-radius: 50%;
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
    const isOnCanvas = matchBuilderPath(window.location.pathname);
    if (isOnCanvas) {
      dispatch(showDebuggerAction(!showDebugger));
      if (!showDebugger)
        AnalyticsUtil.logEvent("OPEN_DEBUGGER", {
          source: "CANVAS",
        });
    }

    const onApiEditor = matchApiPath(window.location.pathname);
    const onQueryEditor = matchQueryPath(window.location.pathname);
    if (onApiEditor || onQueryEditor) {
      dispatch(setActionTabsInitialIndex(1));
    }
    stopEventPropagation(e);
  };

  const tooltipContent =
    totalMessageCount > 0
      ? `View details for ${totalMessageCount} ${
          totalMessageCount > 1 ? "errors" : "error"
        }`
      : "View logs";

  return (
    <TriggerContainer
      className="t--debugger"
      errorCount={messageCounters.errors}
      warningCount={messageCounters.warnings}
    >
      <TooltipComponent
        content={tooltipContent}
        modifiers={{
          preventOverflow: { enabled: true },
        }}
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
