import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class GameArea extends Interactable {
  private _labelText?: Phaser.GameObjects.Text;

  addedToScene() {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);

    this._labelText = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      `Press space to start the codenames game`,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      'Codenames Area',
      { color: '#000000' },
    );
    this._labelText.setVisible(false);
    this.townController.getCodenamesAreaController(this);
    this.setDepth(-1);
  }

  overlap(): void {
    if (!this._labelText) {
      throw new Error('Should not be able to overlap with this interactable before added to scene');
    }
    const location = this.townController.ourPlayer.location;
    this._labelText.setX(location.x - 45);
    this._labelText.setY(location.y - 45);
    this._labelText.setVisible(true);
  }

  overlapExit(): void {
    this._labelText?.setVisible(false);
  }

  interact(): void {
    this._labelText?.setVisible(false);
  }

  getType(): KnownInteractableTypes {
    return 'codenamesArea';
  }
}
