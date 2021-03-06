import { Action } from '@ngrx/store';
import { PackableOriginal } from '../../shared/models/packable.model';

export const ADD_ORIGINAL_PACKABLE = 'ADD_ORIGINAL_PACKABLE';
export const REMOVE_ORIGINAL_PACKABLES = 'REMOVE_ORIGINAL_PACKABLES';
export const EDIT_ORIGINAL_PACKABLE = 'EDIT_ORIGINAL_PACKABLE';
export const SET_PACKABLE_STATE = 'SET_PACKABLE_STATE';

export class setPackableState  implements Action{
    readonly type = SET_PACKABLE_STATE;
    constructor(public payload: PackableOriginal[]){};
}
export class addOriginalPackable  implements Action{
    readonly type = ADD_ORIGINAL_PACKABLE;
    constructor(public payload: PackableOriginal){};
}
export class editOriginalPackable  implements Action{
    readonly type = EDIT_ORIGINAL_PACKABLE;
    constructor(public payload: PackableOriginal){};
}
export class removeOriginalPackables  implements Action{
    readonly type = REMOVE_ORIGINAL_PACKABLES;
    constructor(public payload: string[]){};
}

export type theActions = addOriginalPackable | editOriginalPackable | removeOriginalPackables | setPackableState;