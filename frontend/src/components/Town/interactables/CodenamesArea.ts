import CodenamesAreaController from '../../../classes/CodenamesAreaController';
import TownController from '../../../classes/TownController';
import { BoundingBox } from '../../../types/CoveyTownSocket';
import Interactable, { KnownInteractableTypes } from '../Interactable';
import TownGameScene from '../TownGameScene';

export default class ConversationArea extends Interactable {
  private _infoTextBox?: Phaser.GameObjects.Text;

  private _codenamesArea?: CodenamesAreaController;

  private _townController: TownController;

  constructor(scene: TownGameScene) {
    super(scene);
    this._townController = scene.coveyTownController;
    this.setTintFill();
    this.setAlpha(0.3);
    this._townController.addListener('codenamesAreasChanged', this._updateCodenamesAreas);
  }

  getType(): KnownInteractableTypes {
    return 'codenamesArea';
  }

  removedFromScene(): void {}

  addedToScene(): void {
    super.addedToScene();
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._updateCodenamesAreas(this._townController.codenamesAreas);
  }

  private _updateCodenamesAreas(areas: CodenamesAreaController[]) {
    const area = areas.find(eachAreaInController => eachAreaInController.id === this.name);
    if (area !== this._codenamesArea) {
      if (area === undefined) {
        this._codenamesArea = undefined;
      } else {
        this._codenamesArea = area;
        if (this.isOverlapping) {
          this._scene.moveOurPlayerTo({ interactableID: this.name });
        }
      }
    }
  }

  public getBoundingBox(): BoundingBox {
    const { x, y, width, height } = this.getBounds();
    return { x, y, width, height };
  }

  private _showInfoBox() {
    if (!this._infoTextBox) {
      this._infoTextBox = this.scene.add
        .text(
          this.scene.scale.width / 2,
          this.scene.scale.height / 2,
          "You've found an empty codenames area!\nJoin a game by pressing the spacebar.",
          { color: '#000000', backgroundColor: '#FFFFFF' },
        )
        .setScrollFactor(0)
        .setDepth(30);
    }
    this._infoTextBox.setVisible(true);
    this._infoTextBox.x = this.scene.scale.width / 2 - this._infoTextBox.width / 2;
  }

  overlap(): void {
    if (this._codenamesArea === undefined) {
      this._showInfoBox();
    }
  }

  overlapExit(): void {
    this._infoTextBox?.setVisible(false);
  }
}
