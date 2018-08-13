import { Action } from '@ngrx/store';
import { Trip } from '../../shared/models/trip.model';
import { PackingList } from '../../shared/models/packing-list.model';

export const ADD_TRIP = 'ADD_TRIP';
export const REMOVE_TRIP = 'REMOVE_TRIP';
export const EDIT_TRIP = 'EDIT_TRIP';
export const UPDATE_PACKING_LIST = 'UPDATE_PACKING_LIST';

export class addTrip  implements Action{
    readonly type = ADD_TRIP;
    constructor(public payload: Trip){};
}
export class editTrip  implements Action{
    readonly type = EDIT_TRIP;
    constructor(public payload: Trip){};
}
export class removeTrip  implements Action{
    readonly type = REMOVE_TRIP;
    constructor(public payload: string){};
}
export class updatePackingList  implements Action{
    readonly type = UPDATE_PACKING_LIST;
    constructor(public payload: PackingList){};
}

export type tripActions = addTrip | editTrip | removeTrip | updatePackingList;