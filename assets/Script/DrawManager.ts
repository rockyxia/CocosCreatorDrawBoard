import { DrawBoard } from './DrawBoard'
export class DrawManager {
  private _node: cc.Node
  private strokeColor: cc.Color = cc.color(0, 0, 255)
  private lineWidth: number = 10

  private _width: number
  private _height: number

  private _drawNode: cc.Node
  private _drawBoard: DrawBoard
  private _drawSprite: cc.Sprite

  constructor() {}

  public init(ui: cc.Node) {
    this._node = ui

    this.initDraw()
    this.addEvent()
  }

  public get drawNode(): cc.Node {
    return this._drawNode
  }
  public setStrokeColor(color: cc.Color) {
    this.strokeColor = color
    this._drawBoard.setColor(
      this.strokeColor.getR(),
      this.strokeColor.getG(),
      this.strokeColor.getB(),
      this.strokeColor.getA(),
    )
  }
  public setLineWidth(lineWidth: number) {
    this.lineWidth = lineWidth
    this._drawBoard.setLineWidth(this.lineWidth)
  }

  private initDraw(): void {
    let size: cc.Size = this._node.getContentSize()
    this._width = size.width
    this._height = size.height

    this._drawNode = new cc.Node()
    this._drawSprite = this._drawNode.addComponent(cc.Sprite)
    this._drawBoard = new DrawBoard(size.width, size.height)

    let data: Uint8Array = this._drawBoard.getData()
    let texture: cc.Texture2D = new cc.Texture2D()
    texture.initWithData(data, 16, this._width, this._height)
    texture.setFlipY(true)
    // this._drawSprite.spriteFrame.setTexture(texture)
    this._drawSprite.spriteFrame = new cc.SpriteFrame(texture)
  }

  private addEvent() {
    this._node.targetOff(this)
    this._node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
    this._node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
    this._node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this)
    this._node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
  }
  public unregistEvents() {
    this._node.targetOff(this)
    cc.systemEvent.targetOff(this)
  }
  private onTouchStart(evt: cc.Event.EventTouch) {
    let loc: cc.Vec2 = evt.getLocation()

    let drawLoc: cc.Vec2 = this._transition(loc)
    this._drawBoard.moveTo(drawLoc.x, drawLoc.y)

    return true
  }

  private onTouchMove(evt: cc.Event.EventTouch) {
    let touchLoc: cc.Vec2 = evt.getLocation()

    let drawLoc: cc.Vec2 = this._transition(touchLoc)
    this._drawWithLocation(drawLoc)
  }

  private onTouchEnd(evt: cc.Event.EventTouch) {}

  private onTouchCancel(evt: cc.Event.EventTouch) {}

  private _transition(loc: cc.Vec2): cc.Vec2 {
    let node: cc.Node = this._node
    let touchLoc = node.convertToNodeSpaceAR(loc)
    touchLoc.x += this._width / 2
    touchLoc.y += this._height / 2

    return touchLoc
  }
  private _drawWithLocation(loc: cc.Vec2) {
    this._drawBoard.lineTo(loc.x, loc.y)

    let data: Uint8Array = this._drawBoard.getData()
    let texture: cc.Texture2D = this._drawSprite.spriteFrame.getTexture()
    let opts = texture._getOpts()
    opts.image = data
    opts.images = [opts.image]
    texture.update(opts)
  }
  public clear() {
    this._drawBoard.clear()
  }
}

export enum PenType {
  /** 默认为画*/
  DEFAULT = 0,
  /** 橡皮擦*/
  ERASER = 1,
}
