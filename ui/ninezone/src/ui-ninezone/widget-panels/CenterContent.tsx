/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module WidgetPanels
 */

import * as React from "react";
import { WidgetPanelsContent } from "./Content";
import { CenterContentNodeContext } from "./Panels";

/** Component that displays center content (i.e. toolbars). Content is allways bound by widget panels (panel pinned setting is ignored).
 * @internal
 */
export const CenterContent = React.memo(function CenterContent() { // eslint-disable-line @typescript-eslint/naming-convention, no-shadow
  const content = React.useContext(CenterContentNodeContext);
  return (
    <WidgetPanelsContent
      className="nz-widgetPanels-centerContent"
      pinnedLeft
      pinnedRight
      pinnedTop
      pinnedBottom
    >
      {content}
    </WidgetPanelsContent>
  );
});
