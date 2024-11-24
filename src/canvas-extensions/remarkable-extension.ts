import { setIcon } from "obsidian"
import { BBox, Canvas, CanvasData, CanvasNode, CanvasNodeData, SelectionData } from "src/@types/Canvas"
import { CanvasEvent } from "src/core/events"
import BBoxHelper from "src/utils/bbox-helper"
import CanvasExtension from "../core/canvas-extension"
import CanvasHelper from "src/utils/canvas-helper"

export default class RemarkableExtension extends CanvasExtension {
  isEnabled() { return 'remarkableExtensionEnabled' as const }

  init() {
    this.plugin.registerEvent(this.plugin.app.workspace.on(
      CanvasEvent.CanvasChanged,
      (canvas: Canvas) => {
        for (let node of canvas.nodes.values()) {
          const styleAttributes = node.getData().styleAttributes;
          if (!styleAttributes)
            continue;
          const orientation = styleAttributes["remarkable_screen"];
          if ((orientation !== "landscape") && (orientation !== "portrait"))
            continue;
          this.addRemarkableScreen(node, orientation);
        }
      }
    ))

    this.plugin.addCommand({
      id: 'insert-remarkable-screen-landscape',
      name: 'Insert Remarkable screen (Landscape)',
      checkCallback: CanvasHelper.canvasCommand(
        this.plugin,
        _ => true,
        (canvas: Canvas) => this.createGroupNode(canvas, "landscape")
      )
    });

    this.plugin.addCommand({
      id: 'insert-remarkable-screen-portrait',
      name: 'Insert Remarkable screen (Portrait)',
      checkCallback: CanvasHelper.canvasCommand(
        this.plugin,
        _ => true,
        (canvas: Canvas) => this.createGroupNode(canvas, "portrait")
      )
    });

    this.plugin.registerEvent(this.plugin.app.workspace.on(
      CanvasEvent.NodeMoved,
      (canvas: Canvas, node: CanvasNode) => this.onNodeMoved(canvas, node)
    ))
  }

  private createGroupNode(canvas: Canvas, orientation: string) {
    const screenSize = (orientation === "portrait") ?
      { width: 1404, height: 1872 } :
      { width: 1872, height: 1404 };

    let pos = CanvasHelper.getCenterCoordinates(canvas, screenSize)

    const groupNode = canvas.createGroupNode({
      pos: pos,
      size: screenSize,
      label: "Remarkable Screen",
      focus: false,
    });

    const nodeData = groupNode.getData();
    if (nodeData.styleAttributes) {
      nodeData.styleAttributes["remarkable_screen"] = orientation;
    } else {
      nodeData.styleAttributes = { "remarkable_screen": orientation };
    }
    groupNode.setData(nodeData);

    this.addRemarkableScreen(groupNode, orientation);
  }

  private addRemarkableScreen(node: CanvasNode, orientation: string) {
    const goMarkableStreamUrl = this.plugin.settings.getSetting('goMarkableStreamUrl');
    let connectingMsg = document.createElement("h1");
    connectingMsg.setAttribute("style", "font-size: 100%;");
    connectingMsg.textContent = "Connecting...";
    node.nodeEl.appendChild(connectingMsg);
    fetch(goMarkableStreamUrl, {mode: 'no-cors'}).then(_ => node.nodeEl.removeChild(connectingMsg));

    let remarkableIframe = document.createElement("iframe");
    remarkableIframe.src = goMarkableStreamUrl + "?portrait=" + (orientation === "portrait").toString();
    remarkableIframe.setAttribute("style", "width: 100%; height: 100%");
    node.nodeEl.appendChild(remarkableIframe);
  }

  private onNodeMoved(_canvas: Canvas, node: CanvasNode) {
    const nodeData = node.getData()
    if (!nodeData.sideRatio) return

    const nodeBBox = node.getBBox()
    const nodeSize = {
      width: nodeBBox.maxX - nodeBBox.minX,
      height: nodeBBox.maxY - nodeBBox.minY
    }
    const nodeAspectRatio = nodeSize.width / nodeSize.height

    if (nodeAspectRatio < nodeData.sideRatio)
      nodeSize.width = nodeSize.height * nodeData.sideRatio
    else nodeSize.height = nodeSize.width / nodeData.sideRatio

    node.setData({
      ...nodeData,
      width: nodeSize.width,
      height: nodeSize.height
    })
  }
}