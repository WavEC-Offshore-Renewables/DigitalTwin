/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as React from "react";
import { useActiveViewport } from "@bentley/ui-framework";
import { FillCentered } from "@bentley/ui-core";
import { MapLayersUiItemsProvider } from "../MapLayersUiItemsProvider";
import { MapLayerManager } from "./MapLayerManager";

/**
 * Widget to Manage Map Layers
 * @beta
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function MapLayersWidget() {
  const [notGeoLocatedMsg] = React.useState(MapLayersUiItemsProvider.i18n.translate("mapLayers:Messages.NotSupported"));
  const activeViewport = useActiveViewport();
  const ref = React.useRef<HTMLDivElement>(null);

  if (activeViewport && !!activeViewport?.iModel.isGeoLocated && activeViewport.view.isSpatialView)
    return (
      <div ref={ref} className="map-manager-layer-host">
        <MapLayerManager activeViewport={activeViewport} getContainerForClone={() => {
          return ref.current ? ref.current : document.body;
        }} />
      </div>
    );

  return (
    <FillCentered><div className="map-manager-not-geo-located-text">{notGeoLocatedMsg}</div></FillCentered>
  );
}
