import { Canvas, CanvasEdge, CanvasNode } from "src/@types/Canvas"
import AdvancedCanvasPlugin from "src/main"
import * as CanvasHelper from "src/utils/canvas-helper"
import * as AStarHelper from "src/utils/a-star-helper"
import * as SvgPathHelper from "src/utils/svg-path-helper"
import { CanvasEvent } from "src/events/events"
import * as BBoxHelper from "src/utils/bbox-helper"

const STYLES_MENU_OPTIONS: CanvasHelper.MenuOption[] = [
  {
    id: undefined,
    label: 'Default',
    icon: 'minus'
  },
  {
    id: 'long-dashed',
    label: 'Dashed (long)',
    icon: 'long-dashed-line'
  },
  {
    id: 'short-dashed',
    label: 'Dashed',
    icon: 'short-dashed-line'
  },
  {
    id: 'dotted',
    label: 'Dotted',
    icon: 'dotted-line'
  }
]

const ROUTES_MENU_OPTIONS: CanvasHelper.MenuOption[] = [
  {
    id: undefined,
    label: 'Default',
    icon: 'route'
  },
  {
    id: 'direct',
    label: 'Direct',
    icon: 'minus'
  },
  {
    id: 'a-star',
    label: 'A*',
    icon: 'navigation'
  }
]

export default class EdgesStyleCanvasExtension {
  plugin: AdvancedCanvasPlugin

  constructor(plugin: AdvancedCanvasPlugin) {
    this.plugin = plugin

    if (!this.plugin.settingsManager.getSetting('edgesStylingFeatureEnabled')) return

    this.plugin.registerEvent(this.plugin.app.workspace.on(
      CanvasEvent.PopupMenuCreated,
      (canvas: Canvas) => this.onPopupMenuCreated(canvas)
    ))

    this.plugin.registerEvent(this.plugin.app.workspace.on(
      CanvasEvent.EdgeChanged,
      (canvas: Canvas, edge: CanvasEdge) => this.onEdgeChanged(canvas, edge)
    ))

    this.plugin.registerEvent(this.plugin.app.workspace.on(
      CanvasEvent.NodeAdded,
      (canvas: Canvas, _node: CanvasNode) => this.updateAllEdges(canvas)
    ))

    this.plugin.registerEvent(this.plugin.app.workspace.on(
      CanvasEvent.NodeRemoved,
      (canvas: Canvas, _node: CanvasNode) => this.updateAllEdges(canvas)
    ))

    this.plugin.registerEvent(this.plugin.app.workspace.on(
      CanvasEvent.DraggingStateChanged,
      (canvas: Canvas, isDragging: boolean) => {
        if (!isDragging) this.updateAllEdges(canvas)
      }
    ))
  }

  onPopupMenuCreated(canvas: Canvas): void {
    // If the canvas is readonly or there is no edge in the selection, return
    const selectedEdges = [...canvas.selection].filter((item: any) => item.path !== undefined) as CanvasEdge[]
    if (canvas.readonly || selectedEdges.length === 0)
      return

    // Path styles
    const pathStyleNestedOptions = STYLES_MENU_OPTIONS.map((style) => ({
      ...style,
      id: undefined,
      callback: () => this.setStyleForSelection(canvas, selectedEdges, style.id)
    }))

    const pathStyleMenuOption = CanvasHelper.createExpandablePopupMenuOption({
      id: 'edge-style-option',
      label: 'Edge style',
      icon: 'paintbrush',
    }, pathStyleNestedOptions)

    // Add menu option to menu bar
    CanvasHelper.addPopupMenuOption(canvas, pathStyleMenuOption)

    const pathRouteNestedOptions = ROUTES_MENU_OPTIONS.map((route) => ({
      ...route,
      id: undefined,
      callback: () => this.setPathRouteForSelection(canvas, selectedEdges, route.id)
    }))

    const pathRouteMenuOption = CanvasHelper.createExpandablePopupMenuOption({
      id: 'edge-path-route-option',
      label: 'Edge path route',
      icon: 'route',
    }, pathRouteNestedOptions)

    // Add menu option to menu bar
    CanvasHelper.addPopupMenuOption(canvas, pathRouteMenuOption)
  }

  private setStyleForSelection(canvas: Canvas, selectedEdges: CanvasEdge[], styleId: string|undefined) {
    for (const edge of selectedEdges) {
      canvas.setEdgeData(edge, 'edgeStyle', styleId)
    }
  }

  private setPathRouteForSelection(canvas: Canvas, selectedEdges: CanvasEdge[], pathRouteTypeId: string|undefined) {
    for (const edge of selectedEdges) {
      canvas.setEdgeData(edge, 'edgePathRoute', pathRouteTypeId)
    }
  }

  private onEdgeChanged(canvas: Canvas, edge: CanvasEdge) {
    if (!edge.bezier) return
    const pathRouteType = edge.getData().edgePathRoute

    let newPath = edge.path.display.getAttr("d")
    if (pathRouteType === 'direct') {
      newPath = `M${edge.bezier.from.x} ${edge.bezier.from.y} L${edge.bezier.to.x} ${edge.bezier.to.y}`
    } else if (pathRouteType === 'a-star') {
      const nodeBBoxes = [...canvas.nodes.values()].map(node => node.getBBox())

      const gridResolution = this.plugin.settingsManager.getSetting('edgeStylePathfinderGridResolution')
      const pathArray = AStarHelper.aStar(edge.bezier.from, edge.bezier.to, nodeBBoxes, gridResolution)
      if (!pathArray) return // No path found - use default path

      const roundedPath = this.plugin.settingsManager.getSetting('edgeStylePathfinderPathRounded')
      const svgPath = SvgPathHelper.pathArrayToSvgPath(pathArray, roundedPath)
      newPath = svgPath
    }
    
    edge.path.interaction.setAttr("d", newPath)
    edge.path.display.setAttr("d", newPath)
  }

  private updateAllEdges(canvas: Canvas) {
    for (const edge of canvas.edges.values()) {
      this.onEdgeChanged(canvas, edge)
    }
  }
}