import { ConversationArea, Interactable, ViewingArea, CodenamesArea } from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return 'occupantsByID' in interactable;
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return 'isPlaying' in interactable;
}

/**
 * Test to see if an interactable is a Codenames area
 */
export function isCodenamesArea(interactable: Interactable): interactable is CodenamesArea {
  return 'occupantsByID' in interactable;
}
