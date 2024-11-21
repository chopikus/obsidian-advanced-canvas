import { setIcon } from "obsidian"
import { BBox, Canvas, CanvasData, CanvasNode, CanvasNodeData, SelectionData } from "src/@types/Canvas"
import { CanvasEvent } from "src/core/events"
import BBoxHelper from "src/utils/bbox-helper"
import CanvasExtension from "../core/canvas-extension"
import CanvasHelper from "src/utils/canvas-helper"

export default class MyExtension extends CanvasExtension {
  isEnabled() { return 'myExtensionEnabled' as const }

  init() {
    this.plugin.addCommand({
        id: 'my-command',
        name: 'My command',
        checkCallback: CanvasHelper.canvasCommand(
          this.plugin,
          (canvas: Canvas) => {
            // just checking if an element can be created. returning true
            return true;
          }, // ???
          (canvas: Canvas) => this.createTextNode(canvas)
        )
    });
  }

  private createTextNode(canvas: Canvas) {
    const slideSize = {width: 1200, height: 675};
    let pos = CanvasHelper.getCenterCoordinates(canvas, slideSize)

    const groupNode = canvas.createGroupNode({
      pos: pos,
      size: slideSize,
      label: "my remarkable",
      focus: false,
    })
    console.log(canvas.nodes);

    let remarkableCanvas = document.createElement("canvas");
    remarkableCanvas.setAttribute("style", "width: 100%; height: 100%");

    const ctx = remarkableCanvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.rect(20, 40, 50, 50);
      ctx.fillStyle = "#FF0000";
      ctx.fill();
      ctx.closePath();
    }

    groupNode.nodeEl.appendChild(remarkableCanvas);
  }

  private getDomPath(el: HTMLElement) {
    if (!el) {
      return;
    }
    var stack = [];
    var isShadow = false;
    while (el.parentNode != null) {
      // console.log(el.nodeName);
      var sibCount = 0;
      var sibIndex = 0;
      // get sibling indexes
      for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
        var sib = el.parentNode.childNodes[i];
        if ( sib.nodeName == el.nodeName ) {
          if ( sib === el ) {
            sibIndex = sibCount;
          }
          sibCount++;
        }
      }
      // if ( el.hasAttribute('id') && el.id != '' ) { no id shortcuts, ids are not unique in shadowDom
      //   stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
      // } else
      var nodeName = el.nodeName.toLowerCase();
      if (isShadow) {
        nodeName += "::shadow";
        isShadow = false;
      }
      if ( sibCount > 1 ) {
        stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
      } else {
        stack.unshift(nodeName);
      }
      el = el.parentNode;
      if (el.nodeType === 11) { // for shadow dom, we
        isShadow = true;
        el = el.host;
      }
    }
    stack.splice(0,1); // removes the html element
    return stack.join(' > ');
  }
}