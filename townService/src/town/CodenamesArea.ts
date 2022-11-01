import Player from '../lib/Player';
import InteractableArea from './InteractableArea';

enum Turn {
    TeamOneSpymaster,
    TeamOneOperative,
    TeamTwoSpymaster,
    TeamTwoOperative,
}

export default class CodenamesArea extends InteractableArea {
    /* Whether or not the game is currently actively in play. 
       Game can only be active if all roles filled. */
    private _isActive : boolean;

    /* The current player whose turn is active. */
    public _turn : Turn;

    /* The spymaster for team one. */
    private _teamOneSpymaster : Player;
    
    /* The operative for team one. */
    private _teamOneOperative : Player;
    
    /* The spymaster for team two. */
    private _teamTwoSpymaster : Player;
    
    /* The operative for team two. */
    private _teamTwoOperative : Player;

    /* The board(To be implemented after Card object type created) */
    // private board : Card[];

    /* The currently active hint word issued by the spymaster. */
    private _hint : String;

    /* The number of words relevant to the hint issued by the spymaster */
    private _hintedAmount : number;

    /* The amount of words for Team 1 that have not been revealed. */
    private _teamOneWordsRemaining : number;

    /* The amount of words for Team 2 that have not been revealed. */
    private _teamTwoWordsRemaining : number;

    /**
     * Assigns the player to a role, if there is any undefined role.
     * 
     * The player must already be in the CodenamesArea to join an undefined role.
     * 
     * @param player Player to add.
     */
    public joinPlayer(player : Player): void {
        if (this._occupants.find(_player => _player.id === player.id)) {
            if (this._teamOneSpymaster === undefined) {
                this._teamOneSpymaster = player;
            }
            if (this._teamTwoSpymaster === undefined) {
                this._teamTwoSpymaster = player;
            }
            if (this._teamOneOperative === undefined) {
                this._teamOneOperative = player;
            }
            if (this._teamTwoOperative === undefined) {
                this._teamTwoOperative = player;
            }
        }
    }

    /**
     * Removes the player from the game, and removes the player from its role.
     * 
     * The player must be assigned to a role to be removed.
     * 
     * If game is still active when the player leaves, set the game activity to false.
     * 
     * @param player Player to remove.
     */
    public removePlayer(player : Player): void {

    }

    /**
     * Sets the current hint and the amount of words the hint belongs to.
     * 
     * (TBD making sure that only a spymaster whose turn is the current turn can make a hint)
     * 
     * @param hint The word to set as the hint.
     * @param hintedAmount The amount of words within the board that this hint correlates with.
     */
    public setHint(hint : string, hintedAmount : number): void {
        this._hint = hint;
        this._hintedAmount = hintedAmount;
    }

    /**
     * Submits a guess for specified tiles. Also updates game state based on the guesses.(Will be more specific once we discuss more)
     * 
     * Guesses must be unrevealed and within bounds of the board.
     * 
     * (TBD making sure that only an operative whose turn is the current turn can make a guess)
     * 
     * @param guesses The coordinates within the grid that is being guessed.
     */
}